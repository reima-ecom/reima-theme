import { assertEquals } from "https://deno.land/std@0.81.0/testing/asserts.ts";
import { convertToLegacyId } from "./write-products.ts";

Deno.test("legacy id converter", () => {
  assertEquals(
    convertToLegacyId("Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzE5NzQyMDgyOTkwMzA="),
    "1974208299030",
  );
});
