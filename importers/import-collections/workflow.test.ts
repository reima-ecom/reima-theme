import { CollectionTypeContent } from "./content.ts";
import { generateContentActions } from "./workflow.ts";
import { assertEquals } from "./deps.test.ts";
import { ContentAction, FileAction } from "../lib/files/mod.ts";

Deno.test("content action generator works when empty arrays", () => {
  assertEquals(
    generateContentActions({ currentContents: [], newContents: [] }),
    [],
  );
});

const collectionTypeContent = (handle: string): CollectionTypeContent => ({
  path: `${handle}.md`,
  type: "collection",
  content: {
    handle,
    title: handle.toUpperCase(),
    filters: true,
    layout: "collection",
    main: [],
    seodescription: "",
    seotitle: "",
  },
});

const productTypeContent = (handle: string): CollectionTypeContent => ({
  path: `products/${handle}.md`,
  type: "product",
  collection: "coll",
  content: {
    noindex: true,
    type: "products",
    weight: 0,
  },
});

Deno.test("content action generator does nothing with existing collections", () => {
  const currentContents: CollectionTypeContent[] = [
    collectionTypeContent("kids"),
  ];
  const newContents: CollectionTypeContent[] = [
    collectionTypeContent("kids"),
  ];
  const expectedActions: ContentAction[] = [];

  const result = generateContentActions({ currentContents, newContents });
  assertEquals(result, expectedActions);
});

Deno.test("content action generator creates new collections", () => {
  const currentContents: CollectionTypeContent[] = [];
  const newContents: CollectionTypeContent[] = [
    collectionTypeContent("kids"),
  ];
  const expectedActions: ContentAction[] = [{
    action: FileAction.Write,
    content: collectionTypeContent("kids"),
  }];

  const result = generateContentActions({ currentContents, newContents });
  assertEquals(result, expectedActions);
});

Deno.test("content action generator deletes removed collections", () => {
  const currentContents: CollectionTypeContent[] = [
    collectionTypeContent("kids"),
  ];
  const newContents: CollectionTypeContent[] = [];
  const expectedActions: ContentAction[] = [{
    action: FileAction.Remove,
    content: collectionTypeContent("kids"),
  }];

  const result = generateContentActions({ currentContents, newContents });
  assertEquals(result, expectedActions);
});

Deno.test("content action generator overwrites all products", () => {
  const currentContents: CollectionTypeContent[] = [
    productTypeContent("jacket"),
  ];
  const newContents: CollectionTypeContent[] = [
    productTypeContent("jacket"),
  ];
  const expectedActions: ContentAction[] = [{
    action: FileAction.Write,
    content: productTypeContent("jacket"),
  }];

  const result = generateContentActions({ currentContents, newContents });
  assertEquals(result, expectedActions);
});
