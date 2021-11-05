export type SearchResultProduct = {
  title: string;
  price: number;
  url: string;
  imageUrl: string;
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

export type Searcher = (query: string, limit?: number) => Promise<SearchResults>;

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
};
