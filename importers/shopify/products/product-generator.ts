import type { ShopifyConfig } from "../cmd.ts";
import type { Logger } from "../deps.ts";

type ProductGeneratorOptions = ShopifyConfig;

export async function* createProductGenerator(
  { store, token }: ProductGeneratorOptions,
  logger?: Logger,
): AsyncGenerator<ProductNode> {
  const url = `https://${store}.myshopify.com/api/2021-01/graphql.json`;
  const headers = {
    "X-Shopify-Storefront-Access-Token": token,
    "Content-Type": "application/graphql",
    "Accept": "application/json",
  };
  let hasNextPage: boolean;
  let cursor: string | undefined;
  do {
    const startTime = Date.now();
    const response = await fetch(
      url,
      { method: "POST", headers, body: query(5, cursor) },
    );
    if (!response.ok) {
      throw new Error(`Could not query, status code ${response.status}`);
    }
    const { data, errors } = await response.json() as ProductQueryResult;
    if (!data) {
      if (errors) console.error(errors);
      throw new Error("Could not get product data");
    }
    const { products: { edges: { length } } } = data;
    const elapsed = (Date.now() - startTime);
    logger && logger.info(
      `Got ${length} products from Shopify, average ${Math.round(elapsed / length)} ms per product`,
    );
    for (const edge of data.products.edges) {
      if (edge.node.variants.pageInfo.hasNextPage) {
        throw new Error(`Product ${edge.node.handle} has more variants`);
      }
      yield edge.node;
      cursor = edge.cursor;
    }
    hasNextPage = data.products.pageInfo.hasNextPage;
  } while (hasNextPage);
}

const getPagination = (count: number, cursor?: string) => {
  let pagination = `first: ${count}`;
  if (cursor) {
    pagination += `, after: "${cursor}"`;
  }
  return pagination;
};

const query = (count: number, cursor?: string) => `
{
  products(${getPagination(count, cursor)}) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        handle
        title
        availableForSale
        descriptionHtml
        description
        collections(first: 100) {
          edges {
            node {
              handle
            }
          }
        }
        tags
        priceRange {
          minVariantPrice { amount, currencyCode }
          maxVariantPrice { amount }
        }
        compareAtPriceRange {
          maxVariantPrice { amount, currencyCode }
        }
        options {
          name
          values
        }
        variants(first: 100) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              availableForSale
              compareAtPrice
              price
              sku
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
`;

type Decimal = string;

type Money = {
  amount: Decimal;
  currencyCode?: string;
};

export type ProductNode = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  descriptionHtml: string;
  description: string;
  collections: {
    edges: {
      node: {
        handle: string;
      };
    }[];
  };
  tags: string[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    maxVariantPrice: Money;
  };
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: VariantEdge[];
  };
  media: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      node: ProductVideoNode;
    }[];
  };
};

export type VariantEdge = {
  node: {
    id: string;
    availableForSale: boolean;
    compareAtPrice: string;
    price: string;
    sku: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
  };
};
type ProductQueryResult = {
  data?: {
    products: {
      pageInfo: { hasNextPage: boolean };
      edges: {
        cursor: string;
        node: ProductNode;
      }[];
    };
  };
  errors?: {
    message: string;
  }[];
};
