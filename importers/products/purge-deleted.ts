/// <reference path="./domain.d.ts" />

const getHandles = async (
  productGenerator: AsyncGenerator<ProductNode>,
): Promise<string[]> => {
  const handles: string[] = [];
  for await (const product of productGenerator) {
    handles.push(product.handle);
  }
  return handles;
};

const deleteDirIfNotFound = (baseDir: string) =>
  async (dirNames: string[]) => {
    console.log("Deleting non-existing directories");
    // go through base dir
    for await (const dirEntry of Deno.readDir(baseDir)) {
      // delete if not found in dir names array
      if (!dirNames.includes(dirEntry.name)) {
        await Deno.remove(`${baseDir}/${dirEntry.name}`, { recursive: true });
        console.log("Deleted", dirEntry.name, "(not found in source)");
      }
    }
  };

/**
 * Delete folders in `outDir` that do not have a product
 * with the corresponding `handle` in the generator.
 * 
 * Will execute the entire generator!
 */
export const purgeDeletedProducts = (outDir: string) =>
  async (
    productGenerator: AsyncGenerator<ProductNode>,
  ) =>
    Promise.resolve(productGenerator)
      // get array of handles
      .then(getHandles)
      // go through every directory and delete dir if not found in array
      .then(deleteDirIfNotFound(outDir));
