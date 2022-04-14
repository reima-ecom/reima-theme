import {
  Collection,
  CollectionHandle,
  CollectionProduct,
  CollectionType,
} from "./domain.ts";
import { Content as FileContent } from "./deps.ts";

export type Content<t, T, A = {}> = {
  path: string;
  type: t;
  content: T;
} & A;

export type CollectionContent = Content<
  "collection",
  {
    layout: "collection";
    handle: CollectionHandle;
    title: string;
    seotitle: string;
    seodescription: string;
    filters: boolean;
    main: Array<ContentModule>;
  }
>;

export type buildOptions = {
  list: string;
  render: string;
};

export type CollectionProductContent = Content<
  "product",
  {
    type: "products";
    noindex: true;
    weight: number;
    title: string;
    _build?: buildOptions | null;
  },
  { collection: CollectionHandle }
>;

export type CollectionTypeContent =
  | CollectionContent
  | CollectionProductContent;

type Markdown = string;

type ContentModuleBase<T, t> = {
  template: t;
} & T;

type ContentModuleProductList = ContentModuleBase<
  { collection: CollectionHandle },
  "products"
>;
type ContentModule = ContentModuleProductList;

export const toCollectionContent = (
  collection: Collection
): CollectionContent => ({
  path: `${collection.handle}/_index.md`,
  type: "collection",
  content: {
    layout: "collection",
    handle: collection.handle,
    title: collection.title,
    seotitle: collection.seoTitle,
    seodescription: collection.seoDescription,
    filters: true,
    main: [
      {
        template: "products",
        collection: collection.handle,
      },
    ],
  },
});

export const toCollectionProductContent = (
  collectionProduct: CollectionProduct,
  counter: number
): CollectionProductContent => ({
  path: `${collectionProduct.collection}/products/${collectionProduct.handle}.md`,
  type: "product",
  collection: collectionProduct.collection,
  content: {
    noindex: true,
    type: "products",
    weight: counter,
    title: collectionProduct.title,
    _build: {
      list: 'always',
      render: 'link'
    }
  },
});

/**
 * This interface is needed to explicitly set the right overload in map calls etc.
 */
export interface ToContentWithType<T> {
  (obj: T, counter: number | undefined): CollectionTypeContent;
}

export function toContent(
  obj: CollectionType,
  counter: number | undefined
): CollectionTypeContent;
export function toContent(
  obj: FileContent,
  counter: number | undefined
): CollectionTypeContent;

export function toContent(
  obj: CollectionType | FileContent,
  counter: number | undefined = 0
): CollectionTypeContent {
  if ("type" in obj) {
    switch (obj.type) {
      case "collection":
        return toCollectionContent(obj);
      case "product":
        return toCollectionProductContent(obj, counter);
    }
  } else {
    if (obj.path.includes("/products/")) {
      const collection = obj.path.split("/")[0];
      return {
        type: "product",
        collection,
        path: obj.path,
        content: obj.content as any,
      };
    } else {
      return {
        type: "collection",
        path: obj.path,
        content: obj.content as any,
      };
    }
  }
}
