import { assertEquals } from "https://deno.land/std@0.81.0/testing/asserts.ts";
import { getImageSrcFilename } from "./write-images.ts";

Deno.test("src to filename", () => {
  assertEquals(
    getImageSrcFilename("https://www.com/image.jpg"),
    'image.jpg'
  );
  assertEquals(
    getImageSrcFilename("https://www.com/image.jpg?v=2"),
    'image__2.jpg'
  );
});
