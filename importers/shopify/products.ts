import {
  parse,
  stringify,
} from "https://deno.land/std@0.97.0/encoding/yaml.ts";
import {
  createProductGenerator,
  ProductNode,
} from "./products/product-generator.ts";
import { Content, serializeContent, writeFileToDir } from "./deps.ts";
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

type HugoConfig = {
  params?: {
    public?: {
      shopify?: {
        store?: string;
        token?: string;
      };
    };
  };
} | null;

const getShopConfig = (hugoConfigYaml: string) => {
  const config = parse(hugoConfigYaml) as HugoConfig;
  const { store, token } = config?.params?.public?.shopify || {};
  if (!store || !token) throw new Error("No shop and/or token found in config");
  return { shop: store, token };
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

export const importProductsAndMediaBankImages = async (
  outDir: string,
  hugoConfigYaml: string,
  limit?: number,
) => {
  const writeProduct = getProductWriter(outDir, getCurrencyFormatter("en-US"));
  const shopConfig = getShopConfig(hugoConfigYaml);
  let count = 0;
  for await (const productNode of createProductGenerator(shopConfig)) {
    count++;
    const dir = `${outDir}/${productNode.handle}/imgs`;
    await writeProduct(productNode);
    const downloadImages = downloadSkuImages(dir);
    for (const { node } of productNode.variants.edges) {
      await downloadImages(node.sku);
    }
    if (limit && count >= limit) break;
  }
};
