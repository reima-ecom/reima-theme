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

const deleteIfNotFound = (dir: string) =>
  async (dirEntryNames: string[]) => {
    try {
      // go through base dir
      for await (const dirEntry of Deno.readDir(dir)) {
        // delete if not found in dir names array
        if (!dirEntryNames.includes(dirEntry.name)) {
          await Deno.remove(`${dir}/${dirEntry.name}`, { recursive: true });
          console.log("Deleted", dirEntry.name, "from", dir);
        }
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
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
      .then(deleteIfNotFound(outDir));

export const purgeDeletedImages = (
  outDir: string,
  srcToFilename: (src: string) => string,
) =>
  async (product: ProductNode) =>
    Promise.resolve(product)
      .then((product) =>
        product.images.edges.map(({ node }) => srcToFilename(node.originalSrc))
      )
      .then(deleteIfNotFound(`${outDir}/${product.handle}/imgs`));
