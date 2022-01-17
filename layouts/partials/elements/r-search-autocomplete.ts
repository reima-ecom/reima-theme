/// <reference lib="dom" />

import { createAutocompleter } from "./search-loop54.ts";

export default class RSearchAutocomplete extends HTMLElement {
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
    const autocomplete = createAutocompleter(this.baseUrl);
    const liTemplate = this.querySelector("template");
    if (!liTemplate) throw new Error("Could not find item template");
    const createLiElement = (query: string): HTMLLIElement => {
      const liElement = liTemplate.content.cloneNode(true) as HTMLLIElement;
      const linkElement = liElement.querySelector("a")!;
      linkElement.innerText = query;
      linkElement.href = `/search/?q=${query}`;
      return liElement;
    };
    const ulElement = this.querySelector("ul");
    if (!ulElement) throw new Error("Could not find list element");
    this.for.addEventListener("input", async (ev) => {
      const inputElement = ev.currentTarget as HTMLInputElement;
      const query = inputElement.value;
      if (query) {
        const autocompletes = await autocomplete(query);
        if (autocompletes.length) {
          this.show = true;
          ulElement.innerHTML = "";
          ulElement.append(...autocompletes.map(createLiElement));
          return;
        }
      }
      this.show = false;
    });
  }
}
