import {
  CollectionShopify,
  Jsonl,
  toCollectionTypeShopify,
  CollectionProductShopify,
} from "./queries.ts";
import {
  filterPublished,
  filterType,
  NodeType,
  Node,
  getNodeType,
} from "./node.ts";

export type CollectionHandle = string;
export type ProductHandle = string;

export type Collection = {
  type: "collection";
  handle: CollectionHandle;
  title: string;
  seoTitle: string;
  seoDescription: string;
  contentHtml?: string;
  contentHtmlSummary?: string;
};

export type CollectionProduct = {
  type: "product";
  handle: ProductHandle;
  collection: CollectionHandle;
};

export type CollectionType = Collection | CollectionProduct;

export const mapCollection = (
  bulkCollection: CollectionShopify,
): Collection => {
  // split current shopify description into parts
  const [contentHtml, contentHtmlSummary] = bulkCollection.descriptionHtml
    .split("[first_paragraph]");
  const collection: Collection = {
    type: "collection",
    handle: bulkCollection.handle,
    title: bulkCollection.title,
    seoTitle: bulkCollection.seo.title || bulkCollection.title,
    seoDescription: bulkCollection.seo.description,
  };
  if (contentHtml) collection.contentHtml = contentHtml;
  if (contentHtmlSummary) collection.contentHtmlSummary = contentHtmlSummary;
  return collection;
};

// collection handle map getter

export const collectionHandleReducer = (
  collectionHandles: { [id: string]: string },
  collection: CollectionShopify,
) => {
  return {
    ...collectionHandles,
    [collection.id]: collection.handle,
  };
};

/**
 * @param collectionHandles Map (object) of collection ids to handles
 */
export const mapCollectionProduct = (
  collectionHandles: { [id: string]: string },
) =>
  (
    bulkCollectionProduct: CollectionProductShopify,
  ): CollectionProduct | undefined => {
    const collection = collectionHandles[bulkCollectionProduct.__parentId];
    // if collection not found, it most means that the collection is not published
    if (!collection) return;
    return ({
      type: "product",
      handle: bulkCollectionProduct.handle,
      collection,
    });
  };

export const objectToDomain = (
  mapCollectionProduct: (
    bulkCollectionProduct: CollectionProductShopify,
  ) => CollectionProduct | undefined,
) =>
  (obj: Node): CollectionType | undefined => {
    switch (getNodeType(obj.id)) {
      case NodeType.Collection:
        return mapCollection(obj as CollectionShopify);
      case NodeType.Product:
        return mapCollectionProduct(obj as CollectionProductShopify);
    }
  };

// jsonl to domain object

export const jsonlToObjects = (jsonl: Jsonl): CollectionType[] => {
  const parsed = jsonl
    .split("\n")
    .filter(Boolean)
    .map(toCollectionTypeShopify)
    .filter(filterPublished);
  const collectionHandles = parsed
    .filter(filterType(NodeType.Collection))
    .map((obj) => obj as CollectionShopify)
    .reduce<{ [id: string]: string }>(collectionHandleReducer, {});
  const mapProduct = mapCollectionProduct(collectionHandles);
  const domainObjects = parsed
    .map(objectToDomain(mapProduct))
    .filter(Boolean as unknown as (input: any) => input is CollectionType);
  return domainObjects;
};
