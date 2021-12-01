/// <reference lib="dom" />

import RSearchResults from "./r-search-results.ts";

export default class RSearchLoop extends HTMLElement {
  get results(): RSearchResults {
    const resultsSelector = this.getAttribute("results");
    if (!resultsSelector) throw new Error("Need results element selector");
    const resultsElement = this.querySelector<RSearchResults>(resultsSelector);
    if (!resultsElement) throw new Error("Results element not found");
    return resultsElement;
  }

  search(query: string) {
    this.results.searchAndRender(query, undefined, undefined, true);
  }

  async connectedCallback() {
    const input = this.querySelector<HTMLInputElement>("input[type=search]");
    // add input event listener
    input?.addEventListener(
      "input",
      (e) => this.search((<HTMLInputElement> e.target).value),
    );

    // wait for the element to be defined first
    await window.customElements.whenDefined("r-search-results");
    // search immediately if input has input, otherwise get suggestions
    if (input?.value) {
      this.search(input.value);
    } else {
      this.results.showSuggestions();
    }
  }
}

window.customElements.define("r-search-loop", RSearchLoop);
if (!window.customElements.get("r-search-results")) {
  window.customElements.define("r-search-results", RSearchResults);
}
