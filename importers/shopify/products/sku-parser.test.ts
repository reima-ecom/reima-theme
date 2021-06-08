import parseSku from "./sku-parser.ts";
import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";

Deno.test("regular product numbers work", () => {
  const result = parseSku("1234564321000");
  assertEquals(result.product, "123456");
  assertEquals(result.color, "4321");
});

Deno.test("product numbers with letters work", () => {
  const result = parseSku("123456A4321000");
  assertEquals(result.product, "123456A");
  assertEquals(result.color, "4321");
});

Deno.test("product numbers with letters work", () => {
  const result = parseSku("599154B7250000");
  assertEquals(result.product, "599154B");
  assertEquals(result.color, "7250");
});
