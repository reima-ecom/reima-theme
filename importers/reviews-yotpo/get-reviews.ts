type SerializedDate = string;

export type YotpoAllReviewsReview = {
  id: 140796223;
  title: string;
  content: string;
  score: number;
  votes_up: number;
  votes_down: number;
  created_at: SerializedDate;
  updated_at: SerializedDate;
  sentiment: number;
  sku: string;
  name: string;
  email: string;
  reviewer_type: string;
  deleted: boolean;
  archived: boolean;
  escalated: boolean;
  user_reference: string;
}

type YotpoAllReviewsResponse = {
  reviews: YotpoAllReviewsReview[];
};

const getUToken = async (
  yotpoAppKey: string,
  yotpoSecret: string,
): Promise<string> => {
  if (!yotpoAppKey || !yotpoSecret) {
    throw new Error("Please specify yotpo credentials");
  }

  const params = {
    client_id: yotpoAppKey,
    client_secret: yotpoSecret,
    grant_type: "client_credentials",
  };
  const response = await fetch("https://api.yotpo.com/oauth/token", {
    method: "POST",
    body: JSON.stringify(params),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Couldn't get utoken: ${await response.text()}`);
  }
  const data = await response.json();

  return data.access_token;
};

async function* getAllReviewsNextPage(
  yotpoAppKey: string,
  yotpoUToken: string,
  pageSize: number = 100,
) {
  let page = 1;
  let isNextPage = true;
  while (isNextPage) {
    const url =
      `https://api.yotpo.com/v1/apps/${yotpoAppKey}/reviews?utoken=${yotpoUToken}&page=${page}&count=${pageSize}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Couldn't get reviews: ${await response.text()}`);
    }
    /** @type {YotpoProductsResponse} */
    const { reviews } = await response.json() as YotpoAllReviewsResponse;
    // continue if we still have pages left
    isNextPage = reviews.length === pageSize;
    page += 1;
    yield reviews;
  }
}

const getAllReviews = async (
  { yotpoAppKey, yotpoSecret }: { yotpoAppKey: string; yotpoSecret: string },
) => {
  // get utoken
  const yotpoUToken = await getUToken(yotpoAppKey, yotpoSecret);
  // get reviews
  const reviews = [];
  for await (
    const reviewPage of getAllReviewsNextPage(yotpoAppKey, yotpoUToken)
  ) {
    reviews.push(...reviewPage);
  }

  return reviews;
};

export default getAllReviews;
