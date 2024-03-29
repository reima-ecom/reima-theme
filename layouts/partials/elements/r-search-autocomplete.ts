/// <reference lib="dom" />

import { createAutocompleter, createSuggester } from "./search-loop54.ts";


export default class RSearchAutocomplete extends HTMLElement {
  suggestions: string[] = [];
  
  constructor() {
    super();
    this.createLiElement = this.createLiElement.bind(this);
  }

  get for(): HTMLElement {
    const forAttribute = this.getAttribute("for");
    if (!forAttribute) throw new Error("Please set `for` attribute");
    const element = document.querySelector<HTMLElement>(forAttribute);
    if (!element) throw new Error("Could not find element");
    return element;
  }

  get baseUrl(): string {
    const attr = this.getAttribute("loop-url");
    if (!attr) throw new Error("Need to set base url");
    return attr;
  }

  get suggestionsTranslation(): string {
    // const attr = this.getAttribute("loop-suggestions");
    return this.getAttribute("loop-suggestions");
  }

  get topHitsTranslation(): string {
    // const attr = this.getAttribute("loop-top-hits");
    return this.getAttribute("loop-top-hits");
  }

  get headingElement(): HTMLElement {
    return this.querySelector("h3")!;
  }

  get listElement(): HTMLElement {
    return this.querySelector("ul")!;
  }

  createLiElement(query: string): HTMLLIElement {
    const liElement = this.querySelector("template")!.content.cloneNode(
      true,
    ) as HTMLLIElement;
    const linkElement = liElement.querySelector("a")!;
    linkElement.innerText = query;
    linkElement.href = `/search/?q=${query}`;
    return liElement;
  }

  async showSuggestions() {
    const suggest = createSuggester(this.baseUrl);
    if (!this.suggestions.length) {
      this.suggestions = await suggest();
    }
    this.headingElement.textContent = (this.suggestionsTranslation);
    this.listElement.innerHTML = "";
    this.listElement.append(...this.suggestions.map(this.createLiElement));
  }

  connectedCallback() {
    // immediately show suggestions
    this.showSuggestions();
    const autocomplete = createAutocompleter(this.baseUrl);
    this.for.addEventListener("input", async (ev) => {
      const inputElement = ev.currentTarget as HTMLInputElement;
      const query = inputElement.value;
      if (query) {
        const autocompletes = await autocomplete(query);
        this.headingElement.textContent = (this.topHitsTranslation);
        if (autocompletes.length) {
          this.listElement.innerHTML = "";
          this.listElement.append(...autocompletes.map(this.createLiElement));
          return;
        }
      }
      this.showSuggestions();
    });
  }
}
