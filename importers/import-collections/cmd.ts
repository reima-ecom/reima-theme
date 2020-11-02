import {
  parse,
  stringify,
} from "https://deno.land/std@0.67.0/encoding/yaml.ts";
import syncCollections from "./workflow.ts";

const [shopifyShop, directory] = Deno.args;
const shopifyBasicAuth = Deno.env.get("SHOPIFY_BASIC_AUTH");

const usage = `
Import Shopify collections into the specified directory.

Usage: import-collections [shopify shop] [collections directory]

Set the SHOPIFY_BASIC_AUTH environment variable to the
base64-encoded value of "[API key]:[Password]".
`;

if (!shopifyShop || !directory || !shopifyBasicAuth) {
  console.log(usage);
  Deno.exit(1);
}

await syncCollections(
  shopifyShop,
  shopifyBasicAuth,
  directory,
  stringify as (obj: object) => string,
  parse,
);
