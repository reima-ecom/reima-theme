import { importProducts } from "./workflow.ts";

const [shopifyShop, shopifyToken, outDir, countStr] = Deno.args;

const usage = `
Import Shopify products into the specified directory.

Usage:
> deno run cmd.ts [shopify shop] [shopify token] [directory]
`;

if (!shopifyShop || !shopifyToken || !outDir) {
  console.log(usage);
  Deno.exit(1);
}

let count;
if (countStr) {
  count = Number.parseInt(countStr);
}

await importProducts(shopifyShop, shopifyToken, outDir, count);
