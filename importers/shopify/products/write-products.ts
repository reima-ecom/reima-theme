import { Content, serializeContent, writeFileToDir } from "../deps.ts";
import { mapProductLegacy } from "./write-products-legacy.ts";
import type { ProductNode } from "./product-generator.ts";

type Product = {
  handle: string
  title: string
}

export const convertToLegacyId = (id: string) => atob(id).split("/").pop();

const toContent = ({ source: productNode, target: product }: {source: ProductNode, target: Product}): Content => ({
  path: `${product.handle}/index.html`,
  content: product,
  markdown: productNode.descriptionHtml,
});

const serializer = (obj: Record<string, unknown>) => JSON.stringify(obj, undefined, 2);

type Obj = Record<string, unknown>

const transform = <S extends unknown, R extends Obj>(transformer: (input: S) => R | Promise<R>) =>
  async <T extends Obj>({ source, target }: { source: S, target: T}) => ({
    source,
    target: {
      ...target,
      ...(await transformer(source))
    },
  });

const addCollections= (product: ProductNode) => ({
  collections: product.collections.edges.map(({ node }) => node.handle),
});

export const writeProduct = (
  outDir: string,
) => {
  return (productNode: ProductNode): Promise<void> =>
    Promise.resolve({ source: productNode, target: {} })
      .then(transform(mapProductLegacy))
      // add sku to variants in a very hacky way
      .then(({ source: productNode, target: product }: any) => ({
        source: productNode,
        target: {
          ...product,
          variants: product.variants.map((v: any, i: number) => ({
            ...v,
            sku: productNode.variants.edges[i].node.sku,
          })),
        },
      }))
      // collections are needed for the algolia index
      .then(transform(addCollections))
      .then(toContent)
      .then(serializeContent(serializer))
      .then(writeFileToDir(outDir));
};
