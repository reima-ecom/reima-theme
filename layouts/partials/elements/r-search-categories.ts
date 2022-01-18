/// <reference lib="dom" />

import { EVENT_SEARCH_RESULTS, EventSearchResultsDetails } from "./search-domain.ts";

export default class RSearchCategories extends HTMLElement {
  get for(): HTMLElement {
    const forAttribute = this.getAttribute("for");
    if (!forAttribute) throw new Error("Please set `for` attribute");
    const element = document.querySelector<HTMLElement>(forAttribute);
    if (!element) throw new Error("Could not find element");
    return element;
  }

  get show(): boolean {
    return this.hasAttribute("show");
  }

  set show(show: boolean) {
    if (show) this.setAttribute("show", "");
    else this.removeAttribute("show");
  }

  get baseUrl(): string {
    const attr = this.getAttribute("loop-url");
    if (!attr) throw new Error("Need to set base url");
    return attr;
  }

  connectedCallback() {
    const liTemplate = this.querySelector("template");
    if (!liTemplate) throw new Error("Could not find item template");
    const createLiElement = (query: string) => (category: string): HTMLLIElement => {
      const liElement = liTemplate.content.cloneNode(true) as HTMLLIElement;
      liElement.querySelector<HTMLElement>("[query]")!.innerText = query;
      liElement.querySelector<HTMLElement>("[category]")!.innerText = category;
      liElement.querySelector("a")!.href = `/search/?q=${query}#Category=${category}`;
      return liElement;
    };
    const ulElement = this.querySelector("ul");
    if (!ulElement) throw new Error("Could not find list element");
    this.for.addEventListener(EVENT_SEARCH_RESULTS, (ev) => {
      const { results, query } = (ev as CustomEvent<EventSearchResultsDetails>).detail;
      if (!query) {
        this.show = false;
        return;
      }
      const facets = results.facets;
      const categories = facets.find(f => f.name === "Category")?.items.map(i => i.name).slice(0, 3);
      if (!categories) {
        this.show = false;
        console.warn("No categories found");
        return;
      }
      ulElement.innerHTML = "";
      ulElement.append(...categories.map(createLiElement(query)));
      this.show = true;
    });
  }
}
