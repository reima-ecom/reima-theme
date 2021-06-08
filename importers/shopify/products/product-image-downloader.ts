import { exists } from "https://deno.land/std@0.97.0/fs/exists.ts";
import { dirname, join } from "https://deno.land/std@0.97.0/path/mod.ts";
import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { ParsedSku, parseSku } from "./sku-parser.ts";
import type { Logger } from "../deps.ts";

type Unwrap<T> = T extends Promise<infer U> ? U : T;

const downloadMediaBankXml = async (productNumber: string) => {
  try {
    const response = await fetch(
      `https://reima.mediabank.fi/fi/extension/onesite/xml/${productNumber}`,
    );
    if (!response.ok) throw new Error(`Response ${response.status}`);
    return {
      product: productNumber,
      xml: await response.text(),
    };
  } catch (e) {
    console.error("Could not download product", productNumber);
    throw e;
  }
};

type Image = {
  product: string;
  name: string;
  url: string;
};

type ImageWithPath = Image & {
  path: string;
};

const ensureDir = async (path: string) => {
  await Deno.mkdir(dirname(path), { recursive: true });
};

const xmlToImages = (
  doc: Unwrap<ReturnType<typeof downloadMediaBankXml>>,
): Image[] => {
  const xml = parse(doc.xml);
  return xml.root?.children.map((element, i) => ({
    product: doc.product,
    name: `${i.toString().padStart(2, "0")}-${element.attributes.name}`,
    url: element.attributes.url,
  })) || [];
};

const addPath = (dir: string) =>
  (images: Image[]): ImageWithPath[] =>
    images.map((img) => ({ ...img, path: join(dir, "imgs", img.name) }));

const removeExistingImages = (logger?: Logger) =>
  async (images: ImageWithPath[]): Promise<ImageWithPath[]> => {
    const existingUndef = await Promise.all(images.map(async (img) => {
      await ensureDir(img.path);
      if (await exists(img.path)) {
        logger &&
          logger.debug(`Image ${img.path} already exists, skipping download`);
        return undefined;
      }
      return img;
    }));
    return existingUndef.filter(Boolean) as ImageWithPath[];
  };

const downloadImagesParallel = (logger?: Logger) =>
  async (
    images: ImageWithPath[],
  ): Promise<void> => {
    if (!images.length) {
      logger && logger.debug("No images to download");
      return;
    }
    logger &&
      logger.debug(`Downloading ${images.length} for ${images[0].product}`);
    await Promise.all(
      images.map(async (image) => {
        const data = (await fetch(image.url)).arrayBuffer();
        await ensureDir(image.path);
        return Deno.writeFile(
          image.path,
          new Uint8Array(await data),
        );
      }),
    );
  };

const skuToMediaBankProductNumber = (sku: ParsedSku) =>
  `${sku.product}-${sku.color}`;

export const downloadSkuImages = (dir: string, logger?: Logger) =>
  (sku: string) =>
    Promise.resolve(sku)
      .then((sku: string) => {
        logger && logger.debug(`Downloading images for ${sku}`);
        return sku;
      })
      .then(parseSku)
      .then(skuToMediaBankProductNumber)
      .then(downloadMediaBankXml)
      .then(xmlToImages)
      .then(addPath(dir))
      .then(removeExistingImages(logger))
      .then(downloadImagesParallel(logger));
