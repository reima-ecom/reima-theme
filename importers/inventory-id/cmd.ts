import { getInventoryIds } from "./workflow.ts";

const filePath = "static/inventory-ids.json";
const [shop]  = Deno.args;
const shopifyBasicAuth = Deno.args[1] || Deno.env.get('SHOPIFY_BASIC_AUTH');

if (!shop || !shopifyBasicAuth) {
  throw new Error("No shop and/or basic auth");
}

console.log("Getting inventory items...");
const idsJsonl = await getInventoryIds(shop, shopifyBasicAuth);

console.log("Writing json to", filePath);
Deno.writeTextFile(
  filePath,
  `[
${idsJsonl.replaceAll("}", "},").slice(0, -2)}
]`,
);

console.log("Success!");
