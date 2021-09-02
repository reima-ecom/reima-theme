import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { createProductMap } from "./main.ts";
import type { ProductNode } from "../shopify/products/product-generator.ts";

async function* productGenerator(): AsyncGenerator<ProductNode> {
  yield {
    handle: "test",
    variants: {
      edges: [
        {
          // @ts-ignore: test case only
          node: {
            sku: "1234561111056",
            selectedOptions: [{ name: "color", value: "white" }],
          },
        },
        {
          // @ts-ignore: test case only
          node: {
            sku: "1234562222056",
            selectedOptions: [{ name: "color", value: "black" }],
          },
        },
      ],
    },
  };
}

Deno.test("product map creator base case", async () => {
  const map = await createProductMap(productGenerator(), "color");
  assertEquals(map, {
    "123456": { handle: "test", colors: { "1111": "white", "2222": "black" } },
  });
});
