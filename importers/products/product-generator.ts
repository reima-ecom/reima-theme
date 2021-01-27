/// <reference path="./domain.d.ts" />

type ProductGeneratorOptions = { shop: string; token: string };

export async function* createProductGenerator(
  { shop, token }: ProductGeneratorOptions,
): AsyncGenerator<ProductNode> {
  const url = `https://${shop}.myshopify.com/api/2021-01/graphql.json`;
  const headers = {
    "X-Shopify-Storefront-Access-Token": token,
    "Content-Type": "application/graphql",
    "Accept": "application/json",
  };
  let hasNextPage: boolean;
  let cursor: string | undefined;
  do {
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
    console.log("Got", data.products.edges.length, "products from Shopify");
    for (const edge of data.products.edges) {
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

const query = (count: number, cursor?: string) =>
  `
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
        tags
        images(first: 50) {
          edges {
            node {
              id
              originalSrc
            }
          }
        }
        priceRange {
          minVariantPrice { amount, currencyCode }
          maxVariantPrice { amount }
        }
        compareAtPriceRange {
          maxVariantPrice { amount }
        }
        options {
          name
          values
        }
        variants(first: 50) {
          edges {
            node {
              id
              availableForSale
              compareAtPrice
              price
              image { originalSrc }
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
