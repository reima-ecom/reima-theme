import { eachAsync, runSerial, takeAsync } from "./deps.ts";
import { createProductGenerator } from "./product-generator.ts";
import {
  purgeAllButIndexAndImgs,
  purgeDeletedImages,
  purgeDeletedProducts,
} from "./purge-deleted.ts";
import { getImageSrcFilename, writeImages } from "./write-images.ts";
import { writeProduct } from "./write-products.ts";

export const importProducts = async (
  shop: string,
  token: string,
  outDir: string,
  count?: number,
) =>
  Promise.resolve({ shop, token })
    .then(createProductGenerator)
    .then(takeAsync(count))
    .then(eachAsync(writeProduct(outDir, getImageSrcFilename)))
    .then(eachAsync(writeImages(outDir)))
    .then(eachAsync(purgeDeletedImages(outDir, getImageSrcFilename)))
    .then(eachAsync(purgeAllButIndexAndImgs(outDir)))
    .then(
      // if we have a count, just run serially
      // when no count (all products fetched), we can purge
      count ? runSerial : purgeDeletedProducts(outDir),
    );
