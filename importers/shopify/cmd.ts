import { parse as parseYaml } from "https://deno.land/std@0.97.0/encoding/yaml.ts";
import { grantOrThrow } from "https://deno.land/std@0.97.0/permissions/mod.ts";
import { log, parseFlags } from "./deps.ts";
import type { LevelName } from "./deps.ts";
import { importProductsAndMediaBankImages } from "./products.ts";

const usage = `
Import products and collections from Shopify and product images from the media bank into a format that the Hugo site understands.

Shopify configuration is read from config.yml.

Usage:
> deno run cmd.ts DIRECTORY [OPTIONS]

Options:
  -v        Verbose logging (DEBUG)
  -c COUNT  Only download the first COUNT products
`;

const { _: [outDir], ...flags } = parseFlags(Deno.args);

let logLevel: LevelName = "INFO";
if (flags.v) logLevel = "DEBUG";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
  },
  loggers: {
    default: {
      level: logLevel,
      handlers: ["console"],
    },
  },
});

const logger = log.getLogger();

export type ShopifyConfig = {
  store: string;
  token: string;
};

type HugoConfig = {
  params?: {
    public?: {
      shopify?: {
        store?: string;
        token?: string;
      };
    };
  };
} | null;

const getShopConfig = (hugoConfigYaml: string) => {
  const config = parseYaml(hugoConfigYaml) as HugoConfig;
  const { store, token } = config?.params?.public?.shopify || {};
  if (!store || !token) throw new Error("No shop and/or token found in config");
  return { store, token };
};

let shopifyConfig: { store: string; token: string };

try {
  logger.info("Checking arguments and permissions");
  if (!outDir) {
    throw new Error("Out directory not specified");
  }
  grantOrThrow({ name: "read", path: "config.yml" });
  const hugoConfigYaml = await Deno.readTextFile("config.yml");
  shopifyConfig = getShopConfig(hugoConfigYaml);
  grantOrThrow(
    { name: "net", host: `${shopifyConfig.store}.myshopify.com` },
    { name: "net", host: "reima.mediabank.fi" },
    { name: "write", path: outDir as string },
    { name: "read", path: outDir as string },
  );
} catch (_error) {
  console.log(usage);
  Deno.exit(1);
}

await importProductsAndMediaBankImages(
  logger,
  `${outDir}/products`,
  shopifyConfig,
  flags.c,
);

logger.warning("Collections are currently not supported");
