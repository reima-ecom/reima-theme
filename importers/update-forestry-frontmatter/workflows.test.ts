import {
  parseTemplateContents,
  serializeTemplateContents,
  writeFrontmatterTemplate,
  removeTemplatePage,
  keepTemplatePagesOnly,
  joinPagesIntoTemplateDefinitions,
} from "./workflows.ts";
import { assertEquals } from "./deps.ts";

Deno.test("removes pages param", () => {
  assertEquals(
    removeTemplatePage(
      { filename: "a", parsed: { a: "a" } },
    ),
    { filename: "a", definition: { a: "a" } },
  );
  assertEquals(
    removeTemplatePage(
      { filename: "b", parsed: { b: "b", pages: ["something"] } },
    ),
    { filename: "b", definition: { b: "b" } },
  );
});

Deno.test("keeps only pages param", () => {
  assertEquals(
    keepTemplatePagesOnly(
      { filename: "a", parsed: { a: "a" } },
    ),
    { filename: "a", pages: [] },
  );
  assertEquals(
    keepTemplatePagesOnly(
      { filename: "b", parsed: { b: "b", pages: ["something"] } },
    ),
    { filename: "b", pages: ["something"] },
  );
});

Deno.test("joining pages", () => {
  const joined = joinPagesIntoTemplateDefinitions(
    [
      { filename: "a", pages: ["a pages"] },
      { filename: "b", pages: ["b pages"] },
    ],
    [
      { filename: "a", definition: { key: "a" } },
      { filename: "c", definition: { key: "c" } },
    ],
  );
  const expected = [
    { filename: "a", definition: { key: "a", pages: ["a pages"] } },
    { filename: "c", definition: { key: "c" } },
  ];
  assertEquals(joined, expected);
});
