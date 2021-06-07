import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { ParsedSku, parseSku } from "./sku-parser.ts";

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

const xmlToImages = (
  doc: Unwrap<ReturnType<typeof downloadMediaBankXml>>,
): Image[] | undefined => {
  const xml = parse(doc.xml);
  return xml.root?.children.map((element, i) => ({
    product: doc.product,
    name: `${i.toString().padStart(2, "0")}-${element.attributes.name}`,
    url: element.attributes.url,
  }));
};

const downloadImagesParallel = (dir: string) =>
  async (
    images: Unwrap<ReturnType<typeof xmlToImages>>,
  ): Promise<void> => {
    await Promise.all(
      images?.map(async (image) => {
        const data = (await fetch(image.url)).arrayBuffer();
        Deno.mkdir(dir, { recursive: true });
        return Deno.writeFile(
          `${dir}/${image.name}`,
          new Uint8Array(await data),
        );
      }) || [],
    );
  };

const skuToMediaBankProductNumber = (sku: ParsedSku) =>
  `${sku.product}-${sku.color}`;

export const downloadSkuImages = (dir: string) =>
  (sku: string) =>
    Promise.resolve(sku)
      .then(parseSku)
      .then(skuToMediaBankProductNumber)
      .then(downloadMediaBankXml)
      .then(xmlToImages)
      .then(downloadImagesParallel(dir));
