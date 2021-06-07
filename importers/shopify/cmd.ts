import { importProductsAndMediaBankImages } from "./products.ts";

// countStr is used for development; it limits the number of products and collections fetched
const [outDir, countStr] = Deno.args;

const usage = `
Import products and collections from Shopify and product images from the media bank into a format that the Hugo site understands.

Shopify configuration is read from config.yml.

Usage:
> deno run cmd.ts [directory]
`;

if (!outDir) {
  console.log(usage);
  Deno.exit(1);
}

let count;
if (countStr) {
  count = Number.parseInt(countStr);
}

const hugoConfigYaml = await Deno.readTextFile("config.yml");

await importProductsAndMediaBankImages(outDir, hugoConfigYaml, count);
console.warn("WARNING! collections are currently not supported");
