import {
  CollectionType,
  CollectionHandle,
  Collection,
  CollectionProduct,
} from "./domain.ts";
import { Content as FileContent } from "./filesystem.ts";

export type Content<t, T, A = {}> = {
  path: string;
  type: t;
  content: T;
} & A;

export type CollectionContent = Content<"collection", {
  layout: "collection";
  handle: CollectionHandle;
  title: string;
  seotitle: string;
  seodescription: string;
  filters: boolean;
  main: Array<ContentModule>;
}>;

export type CollectionProductContent = Content<"product", {
  type: "products";
  noindex: true;
  weight: number;
}, { collection: CollectionHandle }>;

export type CollectionTypeContent =
  | CollectionContent
  | CollectionProductContent;

type Markdown = string;
type Html = string;

type ContentModuleBase<T, t> = {
  template: t;
} & T;

export type ContentModuleContent = ContentModuleBase<{
  content: Markdown;
  usehtml?: boolean;
  contenthtml?: Html;
}, "content">;
type ContentModuleProductList = ContentModuleBase<
  { collection: CollectionHandle },
  "products"
>;
type ContentModule = ContentModuleContent | ContentModuleProductList;

const addContentModule = (modules: ContentModule[]) =>
  (htmlContent: Html) => {
    modules.push({
      template: "content",
      content: "",
      usehtml: true,
      contenthtml: htmlContent,
    });
  };

export const toCollectionContent = (
  collection: Collection,
): CollectionContent => {
  const main: ContentModule[] = [];
  const addContent = addContentModule(main);
  // add summary to modules if exists
  if (collection.contentHtmlSummary) addContent(collection.contentHtmlSummary);
  // add product list
  main.push({
    template: "products",
    collection: collection.handle,
  });
  // add main content to modules if exists
  if (collection.contentHtml) addContent(collection.contentHtml);

  return {
    path: `${collection.handle}/_index.md`,
    type: "collection",
    content: {
      layout: "collection",
      handle: collection.handle,
      title: collection.title,
      seotitle: collection.seoTitle,
      seodescription: collection.seoDescription,
      filters: true,
      main,
    },
  };
};

export const toCollectionProductContent = (
  collectionProduct: CollectionProduct,
  counter: number,
): CollectionProductContent => ({
  path:
    `${collectionProduct.collection}/products/${collectionProduct.handle}.md`,
  type: "product",
  collection: collectionProduct.collection,
  content: {
    noindex: true,
    type: "products",
    weight: counter,
  },
});

export function toContent(
  obj: CollectionType,
  counter: number,
): CollectionTypeContent;
export function toContent(
  obj: FileContent,
  counter: number,
): CollectionTypeContent;

export function toContent(
  obj: CollectionType | FileContent,
  counter: number,
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
