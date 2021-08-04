import { join } from "https://deno.land/std@0.97.0/path/mod.ts";
import { stringify } from "https://deno.land/std@0.97.0/encoding/yaml.ts";
import {
  createProductGenerator,
  ProductNode,
} from "./products/product-generator.ts";
import { Content, serializeContent, writeFileToDir } from "./deps.ts";
import type { Logger } from "./deps.ts";
import type { ShopifyConfig } from "./cmd.ts";
import {
  CurrencyFormatter,
  mapProduct,
  Product,
} from "./products/product-mapper.ts";
import { downloadSkuImages } from "./products/product-image-downloader.ts";

type ProductWriter = (product: ProductNode) => Promise<void>;

const toContent = ({ descriptionHtml, ...product }: Product): Content => ({
  path: `${product.handle}/index.html`,
  content: product,
  markdown: descriptionHtml,
});

const serializer = (obj: unknown) =>
  stringify(obj as Record<string, unknown>, { skipInvalid: true });

const getProductWriter = (
  outDir: string,
  currencyFormatter: CurrencyFormatter,
): ProductWriter => {
  return (productNode) =>
    Promise.resolve(productNode)
      .then(mapProduct(currencyFormatter))
      .then(toContent)
      .then(serializeContent(serializer))
      .then(writeFileToDir(outDir));
};

const getCurrencyFormatter = (locale: string): CurrencyFormatter =>
  (currency: string) =>
    (value: number | string) => {
      const valueNumber = typeof value === "number"
        ? value
        : Number.parseFloat(value);
      const formatter = Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      });
      return formatter.format(valueNumber);
    };

const deleteNonExistingSubdirs = (logger: Logger) =>
  async (dir: string, subdirs: string[]) => {
    for await (const dirEntry of Deno.readDir(dir)) {
      if (!subdirs.includes(dirEntry.name)) {
        logger.debug(
          `Deleting subdirectory ${dirEntry.name} since it wasn't found in array`,
        );
        await Deno.remove(join(dir, dirEntry.name), { recursive: true });
      }
    }
  };

export const importProductsAndMediaBankImages = async (
  logger: Logger,
  outDir: string,
  shopifyConfig: ShopifyConfig,
  limit?: number,
  skipImageDownload?: boolean,
) => {
  logger.info(`Getting products from Shopify store ${shopifyConfig.store}`);

  const writeProduct = getProductWriter(outDir, getCurrencyFormatter("en-US"));

  if (limit) logger.warning(`Limiting import to ${limit} products`);
  let count = 0;

  const allProductHandles: string[] = [];

  for await (
    const productNode of createProductGenerator(shopifyConfig, logger)
  ) {
    await writeProduct(productNode);

    if (!skipImageDownload) {
      const dir = `${outDir}/${productNode.handle}`;
      const downloadImages = downloadSkuImages(dir, logger);
      for (let i = 0; i < productNode.variants.edges.length; i++) {
        const v = productNode.variants.edges[i].node;
        await downloadImages(v.sku, i);
      }
    }

    allProductHandles.push(productNode.handle);

    count++;
    if (limit && count >= limit) break;
  }

  if (limit) {
    logger.warning(
      "Deleting product subdirectories even though limited number of products fetched",
    );
  }
  await deleteNonExistingSubdirs(logger)(outDir, allProductHandles);

  logger.info("Finished getting products and media");
};
