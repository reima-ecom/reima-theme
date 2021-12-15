/// <reference lib="dom" />

import RSearchResults from "./r-search-results.ts";
import { EventSearchDetails, EVENT_SEARCH } from "./search-domain.ts";

const debounce = (func: (query: string) => void, timeout = 300): (query: string) => void => {
  let timer: number;
  return (query) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.call(this, query);
    }, timeout);
  };
};

export default class RSearchLoop extends HTMLElement {
  constructor() {
    super();
    this.sendEventDebounced = debounce(this.sendEvent.bind(this), 1000);
  }

  sendEventDebounced: (query: string) => void;

  sendEvent(query: string) {
    this.dispatchEvent(
      new CustomEvent<EventSearchDetails>(EVENT_SEARCH, {
        bubbles: true,
        detail: { query },
      }),
    );
  }

  get results(): RSearchResults {
    const resultsSelector = this.getAttribute("results");
    if (!resultsSelector) throw new Error("Need results element selector");
    const resultsElement = this.querySelector<RSearchResults>(resultsSelector);
    if (!resultsElement) throw new Error("Results element not found");
    return resultsElement;
  }

  search(query: string) {
    this.results.searchAndRender(query, undefined, undefined, true);
    this.sendEventDebounced(query);
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
