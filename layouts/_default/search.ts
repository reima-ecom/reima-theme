/// <reference lib="dom" />

import RSearchResults from "../partials/elements/r-search-results.ts";
import RSearchFilters from "../partials/elements/r-search-filters.ts";

window.customElements.define("r-search-results", RSearchResults);
window.customElements.define("r-search-filters", RSearchFilters);

window.customElements.whenDefined("r-search-results").then(() => {
  const search = new URLSearchParams(location.search);
  const query = search.get("q");
  let take: number | undefined = undefined;
  if (search.has("take")) {
    take = Number.parseInt(search.get("take")!);
  }
  if (!query) throw new Error("Need query parameter `q` for search");

  document.querySelector<RSearchResults>("main r-search-results")
    ?.searchAndRender(query, true, take);
});
