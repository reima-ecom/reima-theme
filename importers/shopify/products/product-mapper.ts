import type { ProductNode, VariantEdge } from "./product-generator.ts";
import { parseSku } from "./sku-parser.ts";

export type Product = {
  handle: string;
  collections: string[];
  title: string;
  tags: string[];
  price: number;
  priceFormatted: string;
  compareAtPrice?: number;
  compareAtPriceFormatted?: string;
  hasPriceRange: boolean;
  available: boolean;
  filtering: Record<string, string[]>;
  options: Option[];
  variants: Variant[];
  description: string;
  descriptionHtml: string;
  yotpoId: string;
};

type Option = {
  name: string;
  firstAvailable: string;
  values: OptionValue[];
};

type OptionValue = {
  value: string;
  firstAvailable: boolean;
  availableInitially: boolean;
};

type Variant = {
  id: string;
  available: boolean;
  price: number;
  compareAtPrice?: number;
  compareAtPriceFormatted?: string;
  options: Record<string, string>;
  sku: string;
  productAndColor: string;
  /** Internal color code from SKU */
  colorCode: string;
  /** Internal product code from SKU */
  productCode: string;
};

const transform = <
  R extends Partial<Product>,
  P extends Partial<Product>,
>(
  transformer: (
    poductNode: ProductNode,
    product: Partial<Product>,
  ) => R | Promise<R>,
) =>
  async (
    { productNode, product }: {
      productNode: ProductNode;
      product: P;
    },
  ) => ({
    productNode,
    product: {
      ...product,
      ...(await transformer(productNode, product)),
    },
  });

const convertToLegacyId = (id: string): string =>
  atob(id).split("/").pop() as string;

const addScalars = (p: ProductNode) => ({
  handle: p.handle,
  title: p.title,
  available: p.availableForSale,
  description: p.description,
  descriptionHtml: p.descriptionHtml,
  tags: p.tags,
  yotpoId: convertToLegacyId(p.id),
});

const addMinPriceAsPrice = (p: ProductNode) => {
  const price = Number.parseFloat(p.priceRange.minVariantPrice.amount);
  const formatter = Intl.NumberFormat("en-US", {
    currency: p.priceRange.minVariantPrice.currencyCode,
    style: "currency",
  });
  return {
    price,
    priceFormatted: formatter.format(price),
  };
};

const addHasPriceRange = (p: ProductNode) => ({
  hasPriceRange: Number.parseFloat(p.priceRange.maxVariantPrice.amount) >
    Number.parseFloat(p.priceRange.minVariantPrice.amount),
});

const addCompareAtPrice = (p: ProductNode) => {
  const compareAtPrice = Number.parseFloat(
    p.compareAtPriceRange.maxVariantPrice.amount,
  );
  if (!compareAtPrice) return {};
  const formatter = Intl.NumberFormat("en-US", {
    currency: p.compareAtPriceRange.maxVariantPrice.currencyCode,
    style: "currency",
  });
  return {
    compareAtPrice,
    compareAtPriceFormatted: formatter.format(compareAtPrice),
  };
};

const addCollections = (p: ProductNode) => ({
  collections: p.collections.edges.map(({ node }) => node.handle),
});

const addFiltering = () => ({ filtering: {} });

const getProductAndColor = (sku: string) => {
  const parsedSku = parseSku(sku);
  return `${parsedSku.product}-${parsedSku.color}`;
};

const addVariants = (formatted: CurrencyFormatter) =>
  (p: ProductNode): Pick<Product, "variants"> => ({
    variants: p.variants.edges.map(({ node: variant }) => {
      const parsedSku = parseSku(variant.sku);
      return {
        id: variant.id,
        available: variant.availableForSale,
        price: Number.parseFloat(variant.price),
        priceFormatted: formatted(
          p.priceRange.minVariantPrice.currencyCode || "",
        )(variant.price),
        compareAtPrice: variant.compareAtPrice
          ? Number.parseFloat(variant.compareAtPrice)
          : undefined,
        compareAtPriceFormatted: variant.compareAtPrice &&
          formatted(p.priceRange.minVariantPrice.currencyCode || "")(
            variant.compareAtPrice,
          ),
        options: variant.selectedOptions.reduce((obj, opt) => ({
          ...obj,
          [opt.name]: opt.value,
        }), {}),
        sku: variant.sku,
        productAndColor: getProductAndColor(variant.sku),
        colorCode: parsedSku.color,
        productCode: parsedSku.product,
      };
    }) || [],
  });

const addOptions = (p: ProductNode): Pick<Product, "options"> => {
  const findVariant = (
    variants: VariantEdge[],
    options: { [option: string]: string },
  ) => {
    const variant = variants.find(({ node: v }) => {
      if (Object.keys(options).length !== v.selectedOptions.length) {
        return false;
      }
      return v.selectedOptions.every((opt) => options[opt.name] === opt.value);
    }) || undefined;
    return variant?.node;
  };
  const allOptionsObj = p.variants.edges.reduce((obj, { node: variant }) => {
    let newObj = obj;
    variant.selectedOptions.forEach((opt) => {
      const allOptionValues = obj[opt.name] || [];
      if (!allOptionValues.includes(opt.value)) allOptionValues.push(opt.value);
      newObj = { ...newObj, [opt.name]: allOptionValues };
    });
    return newObj;
  }, {} as Record<string, string[]>);
  const firstAvailableVariant = p.variants.edges.find(
    ({ node: variant }) => variant.availableForSale,
  )?.node;
  const firstAvailableVariantOptionsObj = (firstAvailableVariant &&
    firstAvailableVariant.selectedOptions.reduce(
      (obj, opt) => ({ ...obj, [opt.name]: opt.value }),
      {} as Record<string, string>,
    )) || {};
  const options = Object.entries(allOptionsObj).map(
    ([name, values]) => ({
      name,
      firstAvailable: firstAvailableVariantOptionsObj[name],
      values: values.map((value) => ({
        value,
        firstAvailable: firstAvailableVariantOptionsObj[name] === value,
        availableInitially: findVariant(
          p.variants.edges,
          { ...firstAvailableVariantOptionsObj, [name]: value },
        )?.availableForSale || false,
      })),
    }),
  );
  return { options };
};

export type CurrencyFormatter = (
  currency: string,
) => (price: string | number) => string;

export const mapProduct = (currencyFormatter: CurrencyFormatter) =>
  (
    productNode: ProductNode,
  ): Promise<Product> =>
    Promise.resolve({ productNode, product: {} })
      .then(transform(addScalars))
      .then(transform(addMinPriceAsPrice))
      .then(transform(addCompareAtPrice))
      .then(transform(addHasPriceRange))
      .then(transform(addCollections))
      .then(transform(addFiltering))
      .then(transform(addVariants(currencyFormatter)))
      .then(transform(addOptions))
      .then(({ product }: { product: Product }) => product);
