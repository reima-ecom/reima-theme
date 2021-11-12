/// <reference lib="dom"/>
declare global {
  interface Window {
    site: {
      shopify: {
        store: string;
        token: string;
      };
    };
  }
}

type SortKey = "COLLECTION_DEFAULT" | "BEST_SELLING" | "PRICE";
type CollectionSortData = {
  collectionByHandle: {
    products: {
      edges: {
        node: {
          handle: string;
        };
      }[];
    };
  };
};
type CollectionSortErrors = unknown[];
type CollectionSortResult = {
  data: CollectionSortData;
  errors: CollectionSortErrors;
};

/**
  Get product handles sorted by specified key
  WARNING: Uses global properties from the window object!
*/
const getSortedCollection = async (
  collection: string,
  sortKey: SortKey,
  reverse = false,
): Promise<string[]> => {
  const query = `{
    collectionByHandle(handle: "${collection}") {
      products(first: 250, sortKey: ${sortKey}, reverse: ${reverse}) {
        edges {
          node {
            handle
          }
        }
      }
    }
  }`;
  const response = await fetch(
    `https://${window.site.shopify.store}.myshopify.com/api/2021-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": window.site.shopify.token,
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!response.ok) throw new Error("Could not fetch sort order");
  const { data, errors } = await response.json() as CollectionSortResult;
  if (errors || !data) {
    console.error(errors);
    throw new Error("Could not fetch sort order");
  }
  const handles = data.collectionByHandle.products.edges.map((
    { node: { handle } },
  ) => handle);
  return handles;
};

/** Sort specified list according to array of product handles */
const sortList = (list: HTMLUListElement, handles: string[]) => {
  handles.forEach((handle) => {
    const item = list.querySelector(`[handle=${handle}]`);
    if (item) list.appendChild(item);
  });
};

const sortSelect: NodeListOf<HTMLSelectElement> = document.querySelectorAll(
  "select[sort-collection]",
);
if (sortSelect) {
  sortSelect.forEach((selectElement) => {
    selectElement.addEventListener("change", async (ev) => {
      const selectElement = ev.target as HTMLSelectElement;
      const collection = selectElement.getAttribute("sort-collection");
      if (!collection) {
        throw new Error(
          `Element #${selectElement.id} has no \`sort-collection\` attribute`,
        );
      }
      const listElement = document.querySelector(
        'ul[data-collection="' + collection + '"]',
      ) as HTMLUListElement;
      const [key, reverse] = selectElement.value.split(":");
      sortList(
        listElement,
        await getSortedCollection(collection, key as SortKey, !!reverse),
      );
    });
  });
}

export {};
