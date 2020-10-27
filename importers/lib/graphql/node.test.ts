import { assertEquals } from "./deps.test.ts";
import {
  getNodeType,
  NodeType,
} from "./node.ts";

Deno.test("type getting works", () => {
  const type = getNodeType("gid://shopify/Collection/199172030614");
  assertEquals(type, NodeType.Collection);
});
