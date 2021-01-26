import { eachAsync, runSerial, takeAsync } from "../lib/lazy-list/mod.ts";
import { createProductGenerator } from "./product-generator.ts";
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
    .then(runSerial);
