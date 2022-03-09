/// <reference lib="dom" />

import RSearchResults from "../partials/elements/r-search-results.ts";
import RSearchFilters from "../partials/elements/r-search-filters.ts";
import RSearchTitle from "../partials/elements/r-search-title.ts";

window.customElements.define("r-search-results", RSearchResults);
window.customElements.define("r-search-filters", RSearchFilters);
window.customElements.define("r-search-title", RSearchTitle);

window.customElements.whenDefined("r-search-results").then(() => {
  const search = new URLSearchParams(location.search);
  const query = search.get("q");
  let take: number | undefined = undefined;
  if (search.has("take")) {
    take = Number.parseInt(search.get("take")!);
  }
  if (!query) throw new Error("Need query parameter `q` for search");

  const resultsElement = document.querySelector<RSearchResults>(
    "main r-search-results",
  );

  // focus on first category if filter selection is true 
  const filterInput = document.querySelector<HTMLInputElement>("#show-filters");
  
  filterInput.addEventListener("click", (ev) => {
    if (filterInput.checked === true) {
      document.querySelector<HTMLInputElement>(".filters summary").focus()
    }
  });
  
  // add event listener for exit key when filters is open
  document.querySelector<HTMLElement>(".filters").addEventListener("keydown", (e) => {
    const input = document.querySelector<HTMLInputElement>("#show-filters")
    if (e.key === "Escape") {
      input.checked = false;
    }
  });

  // open filters if there are selected filters
  resultsElement?.addEventListener("search-results", (ev) => {
    const hasActiveFilters = ev.detail.results.facets.some((facet) =>
      facet.items.some((item) => item.selected)
    );
    if (hasActiveFilters) {
      document.querySelector<HTMLInputElement>("#show-filters")!.checked = true;
    }
  });
  resultsElement?.searchAndRender(query, true, take);
});
