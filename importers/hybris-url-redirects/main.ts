import type { Redirect } from "https://raw.githubusercontent.com/reima-ecom/site-worker/main/response-transformers/redirecter.ts";
import type { ProductNode } from "../shopify/products/product-generator.ts";
import { ParsedSku, parseSku } from "../shopify/products/sku-parser.ts";

type ProductMap = Record<
  string,
  { handle: string; colors: Record<string, string> }
>;

type ProductMapCreator = (
  productGenerator: AsyncGenerator<ProductNode>,
  colorOptionName: string,
) => Promise<ProductMap>;

type RedirectsCreator = (
  urlGenerator: AsyncIterableIterator<string>,
  productMap: ProductMap,
  urlPrefix: string,
  colorOptionName: string,
) => Promise<Redirect[]>;

export const createProductMap: ProductMapCreator = async (
  productGenerator,
  colorOptionName,
) => {
  const map: ProductMap = {};
  for await (const product of productGenerator) {
    for (const { node: variant } of product.variants.edges) {
      const sku = parseSku(variant.sku);
      if (!map[sku.product]) {
        map[sku.product] = { handle: product.handle, colors: {} };
      }
      const colorName = variant.selectedOptions.find((o) =>
        o.name === colorOptionName
      )?.value;
      if (!colorName) {
        console.warn(`Could not find color option for ${product.handle}`);
        continue;
      }
      map[sku.product].colors[sku.color] = colorName;
    }
  }
  return map;
};

export const parseUrlSku = (url: string): ParsedSku | undefined => {
  const match = url.match(/.*(\d{6}[a-zA-Z]?)-(\d{4}[a-zA-Z]?)$/);
  if (!match) return;
  return {
    product: match[1],
    color: match[2],
    size: "n/a",
  };
};

export const getUrlBuilder = (
  productMap: ProductMap,
  urlPrefix: string,
  colorOptionName: string,
) =>
  (sku: ParsedSku): string | undefined => {
    const p = productMap[sku.product];
    if (!p) return;
    const { handle } = p;
    let url = urlPrefix + handle;
    const color = p.colors[sku.color];
    if (color) url = `${url}?${colorOptionName}=${color}`;
    return url;
  };

export const createRedirects: RedirectsCreator = async (
  urlGenerator,
  productMap,
  urlPrefix,
  colorOptionName,
) => {
  const buildUrl = getUrlBuilder(productMap, urlPrefix, colorOptionName);
  const redirects: Redirect[] = [];
  for await (const hybrisUrl of urlGenerator) {
    const sku = parseUrlSku(hybrisUrl);
    if (!sku) {
      console.warn(`Could not parse url ${hybrisUrl}`);
      continue;
    }
    const headlessUrl = buildUrl(sku);
    if (!headlessUrl) {
      console.warn(`Could not build url for ${hybrisUrl}, likely product not found`);
      continue;
    }
    redirects.push({
      from: hybrisUrl,
      to: headlessUrl,
    });
  }
  return redirects;
};
