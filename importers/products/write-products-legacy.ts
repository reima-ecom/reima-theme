import { getProductMapper } from "https://raw.githubusercontent.com/reima-ecom/platform-legacy/master/shopify-import/lib/shopify-transform.js";
import setVariantImageIndecies from "https://raw.githubusercontent.com/reima-ecom/platform-legacy/master/shopify-import/lib/variant-images.js";
import { log } from "./deps.ts";
import { convertToLegacyId } from "./write-products.ts";

const flattenEdges = (param: string) =>
  (product: any) => ({
    ...product,
    [param]: product[param].edges.map(({ node }: any) => node),
  });

const addEmptySeo = (product: any) => ({
  ...product,
  seo: {},
});

const addVariantStorefrontIds = (product: any) => ({
  ...product,
  variants: product.variants.map((v: any) => ({ ...v, storefrontId: v.id })),
});

const addLegacyId = (product: any) => ({
  ...product,
  legacyResourceId: convertToLegacyId(product.id),
});

export class NumberFormatMock {
  currency: string;
  constructor(locale: string, { currency }: { currency: string }) {
    this.currency = currency;
  }
  format(num: number) {
    switch (this.currency.toUpperCase()) {
      case "USD":
        return `$${num}`;
      case "JPY": {
        const [thousands, singles] = (num / 1000).toString().split(".");
        return `¥${thousands},${singles.padEnd(3, "0")}`;
      }
      default:
        throw new Error(`Currency ${this.currency} not supported`);
    }
  }
}

const addMockNumberFormat = (product: any) => {
  globalThis.Intl = {
    //@ts-ignore
    NumberFormat: NumberFormatMock,
  };
  return product;
};

const mapProduct = getProductMapper([
  "Breathability",
  "Waterproof",
  "Durability",
  "Warmth",
  "UV-Protection",
  "SizeClothing",
  "SizeHand",
  "SizeFeet",
  "SizeHeadwear",
  "Color",
  "Gender",
] as any);

export const mapProductLegacy = (product: any): Promise<any> =>
  Promise.resolve(product)
    .then(flattenEdges("variants"))
    .then(flattenEdges("images"))
    .then(addEmptySeo)
    .then(addVariantStorefrontIds)
    .then(addLegacyId)
    .then(addMockNumberFormat)
    .then(mapProduct)
    .then(setVariantImageIndecies);
