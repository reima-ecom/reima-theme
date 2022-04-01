import getUToken from './get-utoken.ts';

async function* getReviewsMediaNextPage(yotpoAppKey: string, yotpoUToken: string, pageSize = 100) {
  let page = 1;
  let isNextPage = true;
  while (isNextPage) {
    const url = `https://api.yotpo.com/v1/apps/${yotpoAppKey}/images/export?source=review&page=${page}&per_page=${pageSize}&utoken=${yotpoUToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Couldn't get media: ${await res.text()}`);
    }
    const { response } = await res.json();
    // continue if we still have pages left
    isNextPage = response.images.length === pageSize;
    page++;
    yield response.images;
  }
}

const getAllReviewsMedia = async ({
  yotpoAppKey,
  yotpoSecret,
}: {
  yotpoAppKey: string;
  yotpoSecret: string;
}) => {
  // get utoken
  const yotpoUToken = await getUToken(yotpoAppKey, yotpoSecret);
  // get media
  const media = [];
  for await (const mediaPage of getReviewsMediaNextPage(yotpoAppKey, yotpoUToken)) {
    media.push(...mediaPage);
  }
  console.log('media.length', media.length);
  return media;
};

export default getAllReviewsMedia;
