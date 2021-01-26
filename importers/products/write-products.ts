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
      src: imgSrcToLocal(img.node.originalSrc),
    })),
  });

export const writeProduct = (
  outDir: string,
  imageSrcToLocal: (src: string) => string,
): ProductWriter => {
  const getResources = imagesToResources(imageSrcToLocal);
  return (productNode) =>
    Promise.resolve({ productNode, product: {} })
      .then(transform(getResources))
      .then(transform(mapProductLegacy))
      .then(toContent)
      .then(serializeContent(serializer))
      .then(writeFileToDir(outDir));
};
