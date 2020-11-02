import { assertEquals } from "./deps.test.ts";
import { map } from "./mod.ts";

Deno.test("async types work", async () => {
  const upperAwait = async (str: string) => str.toUpperCase();
  const join = (arr: string[]) => arr.join(" ");
  const actual = await Promise
    .resolve(["hello", "world"])
    .then(map(upperAwait))
    .then(join);
  assertEquals(actual, "HELLO WORLD");
});
