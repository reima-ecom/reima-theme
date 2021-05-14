/// <reference lib="dom"/>
// algoliasearch typings
type AlgoliaResults = {
  hits: { objectID: string }[];
};
type AlgoliaParams = {
  facetFilters: (string | string[])[];
  hitsPerPage: number;
};
type AlgoliaIndex = {
  search: (search: string, params: AlgoliaParams) => Promise<AlgoliaResults>;
};
type AlgoliaClient = {
  initIndex: (indexName: string) => AlgoliaIndex;
};
type AlgoliaSearch = (appId: string, apiKey: string) => AlgoliaClient;
// these properties are expected to exist on the window object
declare global {
  interface Window {
    algoliasearch: AlgoliaSearch;
    collection: string;
    site: {
      shopify: {
        store: string;
        token: string;
      };
      algolia: {
        apikey: string;
        appid: string;
        indexname: string;
      };
    };
  }
}

const w = window;
const { document } = window;

let filters: { [facetFilter: string]: string | string[] } = {
  collections: "",
};

let index: AlgoliaIndex;
const ensureIndex = async () => {
  if (!index) {
    if (!w.algoliasearch) {
      await new Promise((resovle, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.umd.js";
        script.onload = resovle;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const client = w.algoliasearch(w.site.algolia.appid, w.site.algolia.apikey);
    index = client.initIndex(w.site.algolia.indexname);
  }
  return index;
};

const searchAndRender = async (collection) => {
  // search for products
  const facetFilters = Object.values(filters);
  const { hits } = await index.search("", { facetFilters, hitsPerPage: 1000 });
  const collections = collection.split(",");

  // create map of hit handles
  const hitHandles: { [handle: string]: true } = hits.reduce(
    (obj, hit) => ({
      ...obj,
      [hit.objectID]: true,
    }),
    {}
  );

  collections.map((collection) => {
    // render results
    const list: HTMLElement = document.querySelector(
      'ul[data-collection="' + collection + '"]'
    ) as HTMLUListElement;

    // show or hide elements based on hits existence
    for (let i = 0; i < list.children.length; i += 1) {
      const element = list.children[i] as HTMLElement;
      element.style.display = hitHandles[element.getAttribute("handle")!]
        ? "block"
        : "none";
    }
  });
};

const filtersForm: NodeListOf<HTMLFormElement> = document.querySelectorAll(
  "form.filter-list"
);
if (filtersForm) {
  filtersForm.forEach((formElement) => {
    formElement.addEventListener("change", async (e) => {
      const element = e.target as HTMLInputElement;
      const { name, value, checked } = element;

      if (name === "open-filters") {
        element.parentElement.parentElement.parentElement.classList.toggle(
          "active"
        );
      }

      // if this is an element opener checkbox, bail out
      if (name.startsWith("open-")) return;
      await ensureIndex();

      // add to array of active filters
      const key = `${name}:${value}`;
      if (!filters[name]) filters[name] = [];
      const filter = filters[name] as string[];
      if (checked) filter.push(key);
      else filter.splice(filter.indexOf(key), 1);
      let collection = element.getAttribute("data-collection");

      if (collection === "*") {
        const productLists = document.querySelectorAll(".product-list > ul");
        if (productLists) {
          const collections = [];
          const collectionsFilters = [];
          for (let i = 0; i < productLists.length; i++) {
            let collection = productLists[i].getAttribute("data-collection");
            collections.push(collection);
            collectionsFilters.push(`collections:${collection}`);
          }
          collection = collections.join();
          filters.collections = collectionsFilters;
        }
      } else {
        filters.collections = [`collections:${collection}`];
      }

      searchAndRender(collection);
    });

    formElement.addEventListener("reset", (e) => {
      filters = { collections: filters.collections };
      const element = e.target as HTMLInputElement;
      const collection = element.getAttribute("data-collection");
      searchAndRender(collection);
    });
  });
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
type CollectionSortErrors = any[];
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
  reverse = false
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
    }
  );
  if (!response.ok) throw new Error("Could not fetch sort order");
  const { data, errors } = (await response.json()) as CollectionSortResult;
  if (errors || !data) {
    console.error(errors);
    throw new Error("Could not fetch sort order");
  }
  const handles = data.collectionByHandle.products.edges.map(
    ({ node: { handle } }) => handle
  );
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
  "select[sort-collection]"
);
if (sortSelect) {
  sortSelect.forEach((selectElement) => {
    selectElement.addEventListener("change", async (ev) => {
      const selectElement = ev.target as HTMLSelectElement;
      const collection = selectElement.getAttribute("sort-collection");
      const listElement = document.querySelector(
        'ul[data-collection="' + collection + '"]'
      ) as HTMLUListElement;
      const [key, reverse] = selectElement.value.split(":");
      sortList(
        listElement,
        await getSortedCollection(collection, key as SortKey, !!reverse)
      );
    });
  });
}

export {};
