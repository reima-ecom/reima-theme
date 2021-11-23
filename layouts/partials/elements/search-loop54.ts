import type {
  Filterer,
  FilterQuery,
  Searcher,
  SearchResultCategory,
  SearchResultProduct,
  Suggester,
} from "./search-domain.ts";

type LoopSearchRequest = {
  query: string;
  resultsOptions?: {
    skip?: number;
    take?: number;
    facets?: {
      attributeName: string;
      selected: (string | number | boolean)[];
    }[];
  };
};

/** https://docs.loop54.com/latest/api/docs.html#tag/User-initiated/paths/~1search/post */
type LoopSearchResponse = {
  makesSense: boolean;
  results: {
    count: number;
    items: LoopSearchResponseItem[];
    facets: LoopSearchResponseFacet[];
  };
};

type LoopEntityRequest = {
  resultsOptions?: {
    skip?: number;
    take?: number;
    facets?: {
      attributeName: string;
      selected: (string | number | boolean)[];
    }[];
  };
};

type LoopEntityResponse = {
  results: {
    count: number;
    items: LoopSearchResponseItem[];
    facets: LoopSearchResponseFacet[];
  };
};

type LoopSearchResponseItem = {
  type: string;
  id: string;
  attributes: {
    name: string;
    type: string;
    values: string[];
  }[];
};

type LoopSearchResponseFacet =
  | LoopSearchResponseDistinctFacet
  | LoopSearchResponseRangeFacet;

type LoopSearchResponseDistinctFacet = {
  name: string;
  type: "distinct";
  approximated: boolean;
  items: {
    item: string | number | boolean;
    count: number;
    selected: boolean;
  }[];
};

type LoopSearchResponseRangeFacet = {
  name: string;
  type: "range";
  approximated: boolean;
  min: string | number | boolean;
  max: string | number | boolean;
  selectedMin: string | number | boolean;
  selectedmax: string | number | boolean;
};

type LoopSuggestionRequest = {
  customData: {
    queriesOptions: {
      skip: number;
      take: number;
    };
  };
};

type LoopSuggestionResponse = {
  customData: {
    commonSearches: {
      key: string;
      value: number;
    }[];
  };
};

type LoopErrorResponse = {
  error: {
    /** The HTTP status code of the response. */
    code: number;
    /** The HTTP status string of the response. */
    status: string;
    /** The name of the error. */
    title: string;
    /** The more detailed information about the error. Note: not always shown. */
    detail: string;
    /** The input parameter, if any, that caused the error. */
    parameter: string;
  };
};

const productsDemo: SearchResultProduct[] = [
  {
    title: "Reflecting winter mittens Vilkku",
    price: 32.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/14_01_01.jpg",
  },
  {
    title: "Kids’ waterproof trousers Lammikko",
    price: 26.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/522233-2350.jpg",
  },
  {
    title: "Kids’ hooded raincoat Lampi",
    price: 34.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/02_01_01.jpg",
  },
  {
    title: "Kids’ Jacket Frebben",
    price: 109.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/03_02_01.jpg",
  },
  {
    title: "Kids’ fleece jacket Hopper",
    price: 109.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/526355-2850.jpg",
  },
  {
    title: "Kids’ winter shoes Freddo",
    price: 74.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/07_01_01.jpg",
  },
  {
    title: "Snowsuit Gotland",
    price: 129.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/08_01_01.jpg",
  },
  {
    title: "Reimatec Kiddo overall Kapelli",
    price: 89.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/520242A-2400.jpg",
  },
  {
    title: "Anti-Bite Pants Sillat",
    price: 59.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/532225-3880.jpg",
  },
  {
    title: "Xylitol Cool t-shirt Vauhdikas",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536545-9990.jpg",
  },
  {
    title: "Xylitol Cool shorts Ilmassa",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536543-7330.jpg",
  },
  {
    title: "Xylitol Cool jacket Harkat",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536548-4607.jpg",
  },
];
const categoriesDemo: SearchResultCategory[] = [
  { title: "Kid's Jackets", url: "#" },
  { title: "Rain jackets", url: "#" },
  { title: "Winter Jackets", url: "#" },
  { title: "Fleece Jackets", url: "#" },
  { title: "Ski & Snowboard Jackets", url: "#" },
  { title: "Light Jackets", url: "#" },
];

const loopItemToProduct = (
  item: LoopSearchResponseItem,
): SearchResultProduct => {
  const attributes = item.attributes.reduce(
    (obj, attr) => ({ ...obj, [attr.name]: attr.values[0] }),
    {} as Record<string, unknown>,
  );
  return {
    url: attributes["Url"] as string,
    title: attributes["Name"] as string,
    price: attributes["Price"] as number,
    imageUrl: attributes["ImageURL"] as string,
  };
};

const loopFacetToCategory = (
  facet: LoopSearchResponseFacet,
): SearchResultCategory | undefined => {
  console.warn("Not implemented: facet to category", facet);
  return;
};

type LoopRequestTypes<E> = E extends "/search" ? {
  Request: LoopSearchRequest;
  Response: LoopSearchResponse;
}
  : E extends "/getEntities" ? {
    Request: LoopEntityRequest;
    Response: LoopEntityResponse;
  }
  : E extends "/Client.Requests.GetCommonSearches" ? {
    Request: LoopSuggestionRequest;
    Response: LoopSuggestionResponse;
  }
  : never;

const loopRequest = async <E extends string>(
  baseUrl: string,
  endpoint: E,
  body: LoopRequestTypes<E>["Request"],
): Promise<LoopRequestTypes<E>["Response"]> => {
  const searchResponse = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Api-Version": "V3", "User-Id": "Test" },
    body: JSON.stringify(body),
  });

  if (!searchResponse.ok) {
    const { error }: LoopErrorResponse = await searchResponse.json();
    console.error(error);
    throw new Error(`Loop54 returned error ${error.code}: ${error.title}`);
  }

  return await searchResponse.json();
};

export const createSearcher = (baseUrl: string): Searcher =>
  async (query, take, skip) => {
    if (!query) {
      return {
        products: [],
        categories: [],
        hasMore: false,
        query,
      };
    } else if (query === "test") {
      return {
        products: productsDemo,
        categories: categoriesDemo,
        hasMore: true,
        query,
      };
    }

    const requestBody: LoopSearchRequest = { query, resultsOptions: { take, skip } };

    const response = await loopRequest(baseUrl, "/search", requestBody);

    const products: SearchResultProduct[] = response.results.items.map(
      loopItemToProduct,
    );
    const categories: SearchResultCategory[] = response.results.facets.map(
      loopFacetToCategory,
    ).filter(Boolean);
    const hasMore = response.results.count > (take ?? 0) + (skip ?? 0);

    if (!response.results.facets.length) console.log("No facets returned");

    return { products, categories, hasMore, query };
  };

export const createFilterer = (baseUrl: string): Filterer =>
  (collection) =>
    async (filter) => {
      let filterWithCollection: FilterQuery = filter;
      if (collection) {
        filterWithCollection = filterWithCollection.concat({
          attribute: "Collections",
          selected: [collection],
        });
      }

      const response = await loopRequest(baseUrl, "/getEntities", {
        resultsOptions: {
          take: 5000,
          facets: filterWithCollection.map((f) => ({
            attributeName: f.attribute,
            selected: f.selected,
          })),
        },
      });

      return response.results.items.map((item) => ({
        id: item.id,
      }));
    };

export const createSuggester = (baseUrl: string): Suggester =>
  async () => {
    const response = await loopRequest(
      baseUrl,
      "/Client.Requests.GetCommonSearches",
      { customData: { queriesOptions: { skip: 0, take: 5 } } },
    );
    return response.customData.commonSearches.map((s) => s.key);
  };

/**
 * Fixes https://github.com/microsoft/TypeScript/issues/16655 for `Array.prototype.filter()`
 * For example, using the fix the type of `bar` is `string[]` in the below snippet as it should be.
 *
 *  const foo: (string | null | undefined)[] = [];
 *  const bar = foo.filter(Boolean);
 *
 * For related definitions, see https://github.com/microsoft/TypeScript/blob/master/src/lib/es5.d.ts
 *
 * Original licenses apply, see
 *  - https://github.com/microsoft/TypeScript/blob/master/LICENSE.txt
 *  - https://stackoverflow.com/help/licensing
 */

/** See https://stackoverflow.com/a/51390763/1470607  */
type Falsy = false | 0 | "" | null | undefined;

declare global {
  interface Array<T> {
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(
      predicate: BooleanConstructor,
      thisArg?: unknown,
    ): Exclude<S, Falsy>[];
  }
}
