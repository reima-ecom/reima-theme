/// <reference lib="dom" />

import type {
  Filterer,
  FilterQuery,
  Searcher,
  SearchResultFacet,
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
      selected?: (string | number | boolean)[];
    }[];
  };
  customData?: {
    directSearch?: boolean;
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
  relatedResults: {
    count: number;
    items: LoopSearchResponseItem[];
    facets: LoopSearchResponseFacet[];
  };
  relatedQueries: {
    count: number;
    items: { query: string }[];
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

type LoopAutocompleteRequest = {
  query: string;
};

type LoopAutocompleteResponse = {
  queries: {
    count: number;
    items: { query: string }[];
  };
};

type LoopEventType = "click" | "addtocart" | "purchase";
type LoopEventRequest = {
  events: {
    type: LoopEventType;
    entity: {
      type: "Product";
      id: string;
    };
  }[];
};

type LoopEventResponse = Record<never, never>;

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

const loopItemToProduct = (
  item: LoopSearchResponseItem,
): SearchResultProduct => {
  const attributes = item.attributes.reduce(
    (obj, attr) => ({ ...obj, [attr.name]: attr.values[0] }),
    {} as Record<string, unknown>,
  );
  return {
    id: item.id,
    url: attributes["Url"] as string,
    title: attributes["Name"] as string,
    price: attributes["Price"] as number,
    imageUrl: attributes["ImageURL"] as string,
    imageDimensions: {
      width: Number.parseInt(attributes["ImageDimensionsWidth"] as string),
      height: Number.parseInt(attributes["ImageDimensionsHeight"] as string),
    },
  };
};

const loopFacetToDomain = (
  facet: LoopSearchResponseFacet,
): SearchResultFacet | undefined => {
  if (facet.type !== "distinct") {
    throw new Error("Not implemented: Non-distinct facets");
  }
  // normalized facet name
  const facetName = facetNameFromLoop(facet.name);
  return {
    name: facetName,
    items: facet.items.map((i) => ({
      name: i.item.toString(),
      selected: i.selected,
      facet: facetName,
    })),
  };
};

declare global {
  interface Window {
    cookieConsent?: boolean;
  }
}

const createUserId = (): string => Math.random().toString(36).substr(2, 9);

const getUserId = (): string => {
  // check to see if we have cookie consent
  // this window variable is set if cookies are enabled
  if (window.cookieConsent) {
    // get user id from cookie
    const userId = document.cookie
      .split("; ")
      ?.find((row) => row.startsWith("Loop54 UID="))
      ?.split("=")[1];
    if (userId) {
      return userId;
    }
    // get new user id
    const newUserId = createUserId();
    // set cookie, 6 month max age
    document.cookie =
      `Loop54 UID=${newUserId}; Path=/; Max-Age=15778800; SameSite=Lax;`;
    return newUserId;
  }
  // if no consent, just get a random id every time
  return createUserId();
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
  : E extends "/createEvents" ? {
    Request: LoopEventRequest;
    Response: LoopEventResponse;
  }
  : E extends "/autoComplete" ? {
    Request: LoopAutocompleteRequest;
    Response: LoopAutocompleteResponse;
  }
  : never;

const loopRequest = async <E extends string>(
  baseUrl: string,
  endpoint: E,
  body: LoopRequestTypes<E>["Request"],
  keepalive = false,
): Promise<LoopRequestTypes<E>["Response"]> => {
  const searchResponse = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Api-Version": "V3",
      "User-Id": getUserId(),
    },
    body: JSON.stringify(body),
    keepalive,
  });

  if (!searchResponse.ok) {
    const { error }: LoopErrorResponse = await searchResponse.json();
    console.error(error);
    throw new Error(`Loop54 returned error ${error.code}: ${error.title}`);
  }

  return await searchResponse.json();
};

const startsWithCapital = (word: string) =>
  word.charAt(0) === word.charAt(0).toUpperCase();

const facetNameToLoop = (facetName: string): string =>
  startsWithCapital(facetName) ? facetName : `Attributes_${facetName}`;
const facetNameFromLoop = (facetName: string): string =>
  facetName.replace("Attributes_", "");

export const createSearcher = (baseUrl: string, facets?: string[]): Searcher =>
  async (query, take, skip, instant, facetFilters) => {
    if (!query) {
      return {
        products: [],
        facets: [],
        relatedQueries: [],
        relatedResults: [],
        hasMore: false,
        query,
        count: 0,
      };
    }

    const requestBody: LoopSearchRequest = {
      query,
      resultsOptions: { take, skip },
    };

    // set direct search flag, issue reima-ecom/reima-us#42
    if (instant) {
      requestBody.customData = {
        directSearch: true,
      };
    }

    if (facets) {
      requestBody.resultsOptions ??= {};
      requestBody.resultsOptions.facets = facets.map((f) => ({
        attributeName: facetNameToLoop(f),
      }));
      if (facetFilters) {
        requestBody.resultsOptions.facets = requestBody.resultsOptions.facets
          .map((facet) => {
            const filter = facetFilters[facetNameFromLoop(facet.attributeName)];
            if (!filter) return facet;
            return {
              ...facet,
              selected: filter,
            };
          });
      }
    }

    const response = await loopRequest(baseUrl, "/search", requestBody);

    const products: SearchResultProduct[] = response.results.items.map(
      loopItemToProduct,
    );
    const relatedQueries: string[] = response.relatedQueries.items.map((q) =>
      q.query
    );
    const relatedResults: SearchResultProduct[] = response.relatedResults.items
      .map(loopItemToProduct);
    const resultFacets: SearchResultFacet[] = response.results.facets.map(
      loopFacetToDomain,
    ).filter(Boolean);
    const hasMore = response.results.count > (take ?? 0) + (skip ?? 0);

    return {
      products,
      relatedQueries,
      relatedResults,
      facets: resultFacets,
      hasMore,
      query,
      count: response.results.count,
    };
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

export const createEventSender = (baseUrl: string) =>
  (type: LoopEventType, productId: string) => {
    loopRequest(
      baseUrl,
      "/createEvents",
      { events: [{ type, entity: { type: "Product", id: productId } }] },
      true,
    );
  };

export const createAutocompleter = (baseUrl: string) =>
  async (query: string): Promise<string[]> => {
    const response = await loopRequest(
      baseUrl,
      "/autoComplete",
      { query },
      true,
    );
    return response.queries.items.map((loopQry) => loopQry.query);
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
