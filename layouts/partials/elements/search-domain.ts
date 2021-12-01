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

export type SearchResultCategory = {
  title: string;
  url: string;
};

export type SearchResults = {
  products: SearchResultProduct[];
  categories: SearchResultCategory[];
  /** Search has more results to show, i.e. add link to search page. */
  hasMore: boolean;
  /** Original search query. */
  query: string;
};

export type Searcher = (
  query: string,
  take?: number,
  skip?: number,
  /** Set to true if searching based on key press */
  instant?: boolean,
) => Promise<SearchResults>;

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
};

export const EVENT_SEARCH_PRODUCT_CLICK = "search-product-click";
export type EventSearchProductClickDetails = {
  productId: string;
};

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
  "search": CustomEvent<EventSearchDetails>;
  "search-product-click": CustomEvent<EventSearchProductClickDetails>;
}
declare global {
  interface Document { //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void;
  }
}
