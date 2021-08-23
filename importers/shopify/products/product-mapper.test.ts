import { assertEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";
import { _addFiltering } from "./product-mapper.ts";
import { ProductNode } from "./product-generator.ts";

Deno.test("filtering mapper works for simple color case", () => {
  const { filtering } = _addFiltering({
    tags: [
      "Color:Blue",
      "Other",
      "Color:Red",
    ],
  } as unknown as ProductNode);
  assertEquals(filtering, {
    Color: ["Blue", "Red"],
  });
});
