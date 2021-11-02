export type SearchResultProduct = {
  title: string;
  price: number;
  url: string;
  imageUrl: string;
};

export type SearchResultTopHit = {
  title: string;
  url: string;
};

export type SearchResults = {
  products: SearchResultProduct[];
  topHits: SearchResultTopHit[];
};

export type Searcher = (query: string) => Promise<SearchResults>;

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
};
