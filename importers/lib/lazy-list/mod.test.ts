import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.81.0/testing/asserts.ts";
import { eachAsync, fromArray, take } from "./mod.ts";

Deno.test("from array", () => {
  const numbers = fromArray([1, 2, 3]);
  assertEquals(numbers.next().value, 1);
  assertEquals(numbers.next().value, 2);
  assertEquals(numbers.next().value, 3);
  assert(numbers.next().done);
});

Deno.test("take", () => {
  const numbers = fromArray([1, 2, 3]);
  const taken = take(2)(numbers);
  assertEquals(taken.next().value, 1);
  assertEquals(taken.next().value, 2);
  assert(taken.next().done);
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

Deno.test("each async", async () => {
  const numbers = fromArray([1, 2, 3]);
  const log: string[] = [];
  const logger = async (num: number) => {
    await sleep(1);
    log.push(`log ${num}`);
  };
  const eacher = eachAsync(logger)(numbers);
  // run and assert original generator unchanged
  assertEquals((await eacher.next()).value, 1);
  assertEquals((await eacher.next()).value, 2);
  assertEquals((await eacher.next()).value, 3);
  assert((await eacher.next()).done);
  // assert side effects
  assertEquals(log, ["log 1", "log 2", "log 3"]);
});
