export type ParsedSku = {
  product: string;
  color: string;
  size: string;
};

export const parseSku = (sku: string): ParsedSku => {
  const match = sku.match(/^(\d{6}[a-zA-Z]?)(.{4})(.*)$/);
  if (!match) throw new Error(`Could not parse sku ${sku}`);
  const [, product, color, size] = match;
  return {
    product,
    color,
    size,
  };
};

export default parseSku;
