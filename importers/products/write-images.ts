/// <reference path="./domain.d.ts" />

import { map } from "../lib/fn/mod.ts";
import { exists } from "./deps.ts";

type ImageWriter = (product: ProductNode) => Promise<void>;
type DownloadOptions = {
  src: string;
  dest: string;
};

const getImageSrc = ({ node }: { node: ProductImageNode }) => node.originalSrc;

export const getImageSrcFilename = (src: string): string => {
  const [name, qry] = src.split("/").pop()?.split("?") || [];
  if (name && qry) {
    const [base, ext] = name.split(".");
    return `${base}__${qry.replace("v=", "")}.${ext}`;
  }
  return name;
};

const getImageDownloadOptions = (outDir: string) =>
  (src: string): DownloadOptions => ({
    src,
    dest: `${outDir}/${getImageSrcFilename(src)}`,
  });

const downloadImage = async ({ src, dest }: DownloadOptions) => {
  const res = await fetch(src);
  if (!res.ok || !res.body) {
    throw new Error(
      `Could not download ${src}: ${res.statusText} (${res.status})`,
    );
  }
  const file = await Deno.open(dest, { create: true, write: true });
  for await (const chunk of res.body) {
    await Deno.writeAll(file, chunk);
  }
  file.close();
};

const dirname = (path: string) => {
  const arr = path.split("/");
  arr.pop();
  return arr.join("/");
};

const ensureDir = async (opts: DownloadOptions): Promise<DownloadOptions> => {
  await Deno.mkdir(dirname(opts.dest), { recursive: true });
  return opts;
};

const undefinedIfExists = async (
  opts: DownloadOptions,
): Promise<DownloadOptions | undefined> => {
  if (await exists(opts.dest)) {
    return undefined;
  }
  return opts;
};

export const writeImages = (outDir: string): ImageWriter =>
  async (product) => {
    console.warn("Downloading", product.handle, "images to", outDir, "...");
    const writes = await Promise.resolve(product.images.edges)
      .then(map(getImageSrc))
      .then(map(getImageDownloadOptions(`${outDir}/${product.handle}`)))
      .then(map(undefinedIfExists))
      .then((arr) => arr.filter(Boolean) as DownloadOptions[])
      .then(map(ensureDir))
      .then(map(downloadImage));
    console.warn(`DONE ${writes.length} images for ${product.handle}`);
  };
