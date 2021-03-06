/// <reference path="./domain.d.ts" />

import { Content, log, serializeContent, writeFileToDir } from "./deps.ts";
import { mapProductLegacy } from "./write-products-legacy.ts";

type ProductWriter = (product: ProductNode) => Promise<void>;

type TransformerParam = {
  productNode: ProductNode;
  product: any;
};
type Transformer = (productNode: ProductNode) => any;

export const convertToLegacyId = (id: string) => atob(id).split("/").pop();

const toContent = ({ productNode, product }: TransformerParam): Content => ({
  path: `${product.handle}/index.html`,
  content: product,
  markdown: productNode.descriptionHtml,
});

const serializer = (obj: any) => JSON.stringify(obj, undefined, 2);

const transform = (transformer: Transformer) =>
  async ({ productNode, product }: TransformerParam) => ({
    productNode,
    product: {
      ...product,
      ...(await transformer(productNode)),
    },
  });

const imagesToResources = (
  imgSrcToLocal: (src: string) => string,
): Transformer =>
  (productNode: ProductNode) => ({
    resources: productNode.images.edges.map((img, i) => ({
      name: i.toString().padStart(2, "0"),
      src: `imgs/${imgSrcToLocal(img.node.originalSrc)}`,
    })),
  });

const checkMissingVariants: Transformer = (product) => {
  if (product.variants.pageInfo.hasNextPage !== false) {
    throw new Error(`Missing variants on ${product.handle}`);
  }
};

const addCollections: Transformer = (product) => ({
  collections: product.collections.edges.map(({ node }) => node.handle),
});

export const writeProduct = (
  outDir: string,
  srcToFilename: (src: string) => string,
): ProductWriter => {
  const getResources = imagesToResources(srcToFilename);
  return (productNode) =>
    Promise.resolve({ productNode, product: {} })
      .then(transform(checkMissingVariants))
      .then(transform(getResources))
      .then(transform(mapProductLegacy))
      // add sku to variants in a very hacky way
      .then(({ productNode, product }: TransformerParam) => ({
        productNode,
        product: {
          ...product,
          variants: product.variants.map((v: any, i: number) => ({ ...v, sku: productNode.variants.edges[i].node.sku }))
        }
      }))
      // collections are needed for the algolia index
      .then(transform(addCollections))
      .then(toContent)
      .then(serializeContent(serializer))
      .then(writeFileToDir(outDir));
};
