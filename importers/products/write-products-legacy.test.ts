import { NumberFormatMock } from "./write-products-legacy.ts";
import { assertEquals } from "https://deno.land/std@0.81.0/testing/asserts.ts";

Deno.test("mock number format USD", () => {
  assertEquals(
    new NumberFormatMock("", { currency: "USD" }).format(12.95),
    "$12.95",
  );
});

Deno.test("mock number format JPY", () => {
  assertEquals(
    new NumberFormatMock("", { currency: "JPY" }).format(4130),
    "¥4,130",
  );
});
