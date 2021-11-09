/// <reference lib="dom" />

import RSearchResults from "../partials/elements/r-search-results.ts";

window.customElements.define("r-search-results", RSearchResults);

window.customElements.whenDefined("r-search-results").then(() => {
  const query = new URLSearchParams(location.search).get("q");
  if (!query) throw new Error("Need query parameter `q` for search");

  document.querySelector<RSearchResults>("main r-search-results")
    ?.searchAndRender(query);
});
