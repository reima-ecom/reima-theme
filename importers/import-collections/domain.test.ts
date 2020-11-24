import { assertEquals } from "./deps.test.ts";
import {
  mapCollectionProduct,
  CollectionProduct,
  jsonlToObjects,
  collectionHandleReducer,
  CollectionType,
} from "./domain.ts";
import { CollectionShopify } from "./queries.ts";

Deno.test("collection product mapper works", () => {
  const actual = mapCollectionProduct({
    "1": "something",
    "2": "something else",
  })({
    __parentId: "2",
    handle: "product",
    id: "aoeu",
    publishedOnCurrentPublication: true,
  });
  const expected: CollectionProduct = {
    collection: "something else",
    handle: "product",
    type: "product",
  };
  assertEquals(actual, expected);
});

Deno.test("collection handles mapper works", () => {
  const collections: CollectionShopify[] = [
    {
      id: "1",
      handle: "something",
      publishedOnCurrentPublication: true,
      seo: {
        description: "",
        title: "",
      },
      title: "",
    },
    {
      id: "2",
      handle: "something else",
      publishedOnCurrentPublication: true,
      seo: {
        description: "",
        title: "",
      },
      title: "",
    },
  ];
  const handles = collections.reduce(collectionHandleReducer, {});
  assertEquals(handles, {
    "1": "something",
    "2": "something else",
  });
});

Deno.test("jsonl mapper works", () => {
  const actual = jsonlToObjects(
    `{"id":"gid://shopify/Collection/1","handle":"something","publishedOnCurrentPublication":"","seo":{"description":"seo description","title":"seo title"},"title":"collection title","publishedOnCurrentPublication": true}
{"id":"gid://shopify/Collection/2","handle":"something else","publishedOnCurrentPublication":"","seo":{"description":"","title":""},"title":"another collection","publishedOnCurrentPublication": true}
{"__parentId":"gid://shopify/Collection/2","handle":"product","id":"gid://shopify/Product/","publishedOnCurrentPublication": true}
`,
  );
  const expected: CollectionType[] = [
    {
      type: "collection",
      seoDescription: "seo description",
      handle: "something",
      title: "collection title",
      seoTitle: "seo title",
    },
    {
      type: "collection",
      seoDescription: "",
      seoTitle: "another collection",
      handle: "something else",
      title: "another collection",
    },
    { type: "product", handle: "product", collection: "something else" },
  ];
  assertEquals(actual, expected);
});
