export type SearchResultProduct = {
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
) => Promise<SearchResults>;

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
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
