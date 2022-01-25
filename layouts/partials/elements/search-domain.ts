export type SearchResultProduct = {
  id: string;
  title: string;
  price: number;
  url: string;
  imageUrl: string;
  imageDimensions?: {
    width: number;
    height: number;
  };
};

export type SearchResultFacetItem = {
  name: string;
  facet: string;
  selected: boolean;
};

export type SearchResultFacet = {
  name: string;
  items: SearchResultFacetItem[];
};

export type SearchResults = {
  products: SearchResultProduct[];
  facets: SearchResultFacet[];
  relatedQueries: string[];
  relatedResults: SearchResultProduct[];
  /** Search has more results to show, i.e. add link to search page. */
  hasMore: boolean;
  /** Original search query. */
  query: string;
  /** Total number of matched products */
  count: number;
};

export type Searcher = (
  query: string,
  take?: number,
  skip?: number,
  /** Set to true if searching based on key press */
  instant?: boolean,
  facetFilters?: { [facet: string]: string[] },
) => Promise<SearchResults>;

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
};

export const EVENT_SEARCH_RESULTS = "search-results";
export type EventSearchResultsDetails = {
  query: string | undefined;
  results: SearchResults;
};

export const EVENT_SEARCH_PRODUCT_CLICK = "search-product-click";
export type EventSearchProductClickDetails = {
  productId: string;
};

export const EVENT_FILTER_CHANGE = "search-filter-change";
export type EventSearchFilterChange = {
  facet: string;
  item: string;
  selected: boolean;
};

export const EVENT_FILTER_RESET = "search-filter-reset";

export type FilterQuery = {
  attribute: string;
  selected: string[];
}[];
export type FilterResult = {
  id: string;
};

export type Filterer = (
  collection?: string,
) => (filters: FilterQuery) => Promise<FilterResult[]>;

export type Suggester = () => Promise<string[]>;

interface CustomEventMap {
  [EVENT_SEARCH]: CustomEvent<EventSearchDetails>;
  [EVENT_SEARCH_PRODUCT_CLICK]: CustomEvent<EventSearchProductClickDetails>;
  [EVENT_FILTER_CHANGE]: CustomEvent<EventSearchFilterChange>;
  [EVENT_SEARCH_RESULTS]: CustomEvent<EventSearchResultsDetails>;
}
declare global {
  interface Document { //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void;
  }
  interface HTMLElement { //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: CustomEventMap[K]) => void,
    ): void;
  }
}
