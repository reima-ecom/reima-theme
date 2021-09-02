import { readLines } from "https://deno.land/std@0.106.0/io/mod.ts";
import * as log from "https://deno.land/std@0.97.0/log/mod.ts";
import { createProductMap, createRedirects } from "./main.ts";
import { createProductGenerator } from "../shopify/products/product-generator.ts";

const [urlFile, store, token, colorOptionName, urlPrefix] = Deno.args;

if (!urlFile || !store || !token || !colorOptionName || !urlPrefix) {
  throw new Error(
    "Missing arguments, expecting URLFILE, STORE, TOKEN, COLOROPTIONNAME, URLPREFIX",
  );
}

const logger = log.getLogger();

const productMap = await createProductMap(
  createProductGenerator({ store, token }, logger),
  colorOptionName,
);
const fileReader = await Deno.open(urlFile);
const redirects = await createRedirects(
  readLines(fileReader),
  productMap,
  urlPrefix,
  colorOptionName,
);

await Deno.writeTextFile("hybris_redirects.json", JSON.stringify(redirects, undefined, 2));
