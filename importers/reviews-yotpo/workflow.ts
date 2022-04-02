/*
WORKFLOW

1. Exchange app key and secret for utoken
2. Get all reviews from Yotpo (paginated)
2.5. Get all media from Yotpo (paginated)
3. Merge media with reviews
3.5 Create object map for products
4. Calculate bottom line (average, count) for each product
5. Write reviews into data directory

Step one is implemented in `get-utoken.ts`
Steps  two are implemented in `get-reviews.ts` and `get-media.ts`

*/
import getAllReviews, { YotpoAllReviewsReview } from './get-reviews.ts';
import getAllReviewsMedia from './get-media.ts';

type Review = {
  name: string;
  score: number;
  verified: boolean;
  title: string;
  content: string;
  created_at: Date;
  images: string[];
};

type ReviewsBottomLine = {
  average: number;
  count: number;
};

type ProductReviewsMap = {
  [id: string]: {
    reviews: Review[];
  };
};

type ProductReviewsMapWithBottomLine = {
  [id: string]: {
    reviews: Review[];
    bottomline: ReviewsBottomLine;
  };
};

const mergeMediaWithReviews = async ({
  yotpoAppKey,
  yotpoSecret,
}: {
  yotpoAppKey: string;
  yotpoSecret: string;
}) => {
  const reviews = await getAllReviews({ yotpoAppKey, yotpoSecret });
  const media = await getAllReviewsMedia({ yotpoAppKey, yotpoSecret });
  return reviews.map(review => {
    const reviewMedia = media.filter(media => media.review_id === review.id);
    const images = reviewMedia.map(media => media.original_image_url);
    return images.length > 0 ? { ...review, images } : review;
  });
};

const toDomain = (yotpoReview: YotpoAllReviewsReview): Review => ({
  name: yotpoReview.name,
  score: yotpoReview.score,
  verified: yotpoReview.reviewer_type === 'verified_buyer',
  title: yotpoReview.title,
  content: yotpoReview.content,
  created_at: new Date(yotpoReview.created_at),
  images: yotpoReview.images,
});

const createProductReviewsMap = (yotpoReviews: YotpoAllReviewsReview[]): ProductReviewsMap =>
  yotpoReviews.reduce(
    (productReviews, currentReview) => ({
      ...productReviews,
      [currentReview.sku]: {
        reviews: [
          ...(productReviews[currentReview.sku]?.reviews || []),
          toDomain(currentReview),
        ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
      },
    }),
    {} as ProductReviewsMap
  );

const addBottomLine = (productReviews: ProductReviewsMap): ProductReviewsMapWithBottomLine => {
  return Object.fromEntries(
    Object.entries(productReviews).map(([id, data]) => [
      id,
      {
        ...data,
        bottomline: {
          count: data.reviews.length,
          average:
            data.reviews.reduce((total, review) => total + review.score, 0) / data.reviews.length,
        },
      },
    ])
  );
};

const writeReviewData = async (
  reviews: ProductReviewsMapWithBottomLine,
  dataDir: string
): Promise<string> => {
  const filePath = `${dataDir}/reviews.json`;
  await Deno.writeTextFile(filePath, JSON.stringify(reviews, undefined, 2));
  return `Wrote reviews of ${Object.keys(reviews).length} products to ${filePath}`;
};

const workflow = async (yotpoAppKey: string, yotpoSecret: string, dataDir: string) => {
  const reviews = await Promise.resolve({ yotpoAppKey, yotpoSecret })
    .then(mergeMediaWithReviews)
    .then(createProductReviewsMap)
    .then(addBottomLine);
  return writeReviewData(reviews, dataDir);
};

export default workflow;
