/**
 * Create a generator from a regular array
 */
export function* fromArray<T>(array: T[]) {
  yield* array;
}

/**
 * Map generator values using a given function
 * @param fn Mapper function
 */
export const map = <F extends (arg: any) => any>(fn: F) =>
  function* generatorMapper(
    generator: Generator<Parameters<F>[0]>,
  ): Generator<ReturnType<F>> {
    for (const element of generator) {
      yield fn(element);
    }
  };

const createQueue = (fn: (arg: any) => Promise<any>) => {
  let promise = Promise.resolve();
  return (element: any) => {
    promise = promise.then(() => fn(element));
  };
};

/**
 * Execute the given function asynchronously for each generator
 * value without altering the generator value itself.
 * @param fn Function to execute for each value
 */
export const eachAsync = <F extends (arg: any) => Promise<any>>(fn: F) =>
  async function* generatorMapper(
    generator: Generator<Parameters<F>[0]> | AsyncGenerator<Parameters<F>[0]>,
  ): AsyncGenerator<Parameters<F>[0]> {
    const queue = createQueue(fn);
    for await (const element of generator) {
      queue(element);
      yield element;
    }
  };

/**
 * Take a specified number of values from a generator.
 * @param count Number of values to take
 */
export const take = (count: number) =>
  function* take<T extends any>(generator: Generator<T>): Generator<T> {
    for (let i = 0; i < count; i++) {
      const { value, done } = generator.next();
      yield value as T;
      if (done) return;
    }
  };

  /**
   * Take a specified number of values from an async generator.
   * Awaits each value sequentially.
   * @param count Number of values to take, or falsey to take all
   */
export const takeAsync = (count?: number) => {
  return async function* take<T extends any>(
    generator: AsyncGenerator<T>,
  ): AsyncGenerator<T> {
    if (!count) {
      yield* generator;
    } else {
      for (let i = 0; i < count; i++) {
        const { value, done } = await generator.next();
        yield value as T;
        if (done) {
          return;
        }
      }
    }
  };
};

/**
 * Run the generator awaiting values sequentially.
 */
export const runSerial = async (generator: AsyncGenerator) => {
  for await (const result of generator) {
  }
};

/**
 * Await all promises from a promise generator (in parallel).
 */
export const awaitAll = (generator: Generator<Promise<any>>) => {
  return Promise.all(generator);
};

/**
 * Run the given function in chunks, passing in values from a generator.
 * @param fn Function to run for each generator function
 * @param size Chunk size i.e. operations to run in parallel
 */
export const awaitInChunks = (
  fn: (arg: any) => Promise<unknown>,
  size: number,
) =>
  async (generator: Generator) => {
    const results = [];
    let run = true;
    do {
      const chunkedResultsArray = await Promise.resolve(generator)
        .then(take(size))
        .then(map(fn))
        .then(awaitAll);
      results.push(...chunkedResultsArray);
      run = chunkedResultsArray.length >= size;
    } while (run);
    return results;
  };
