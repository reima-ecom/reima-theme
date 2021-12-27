/// <reference lib="dom" />

import type {
  EventSearchFilterChange,
  SearchResultFacet,
  SearchResultFacetItem,
  SearchResults,
} from "./search-domain.ts";
import { EVENT_FILTER_CHANGE } from "./search-domain.ts";
import type RSearchResults from "./r-search-results.ts";

const createItemFrom = (itemTemplate: HTMLTemplateElement) =>
  (item: SearchResultFacetItem): HTMLElement => {
    const itemElement = itemTemplate.content.cloneNode(true) as HTMLElement;
    const id = `${item.facet}:${item.name}`;
    const label = itemElement.querySelector("label")!;
    label.innerText = item.name;
    label.setAttribute("for", id);
    const checkbox = itemElement.querySelector("input")!;
    checkbox.id = id;
    checkbox.name = id;
    checkbox.checked = item.selected;
    return itemElement;
  };

const createFacetFrom = (
  facetTemplate: HTMLTemplateElement,
  itemTemplate: HTMLTemplateElement,
  facetTitles: Record<string, string>,
) =>
  (facet: SearchResultFacet): HTMLElement => {
    const facetItem = facetTemplate.content.cloneNode(true) as HTMLElement;
    facetItem.querySelector("[title]")!.textContent = facetTitles[facet.name] ||
      facet.name;
    const createItem = createItemFrom(itemTemplate);
    const items = facet.items.map((i) => createItem(i));
    facetItem.querySelector("details")!.append(...items);
    return facetItem;
  };

export default class RSearchFilters extends HTMLElement {
  get facetList(): HTMLElement {
    const list = this.querySelector("form");
    if (!list) throw new Error("Element not found");
    return list;
  }

  get facetTitles(): Record<string, string> {
    const filterTitles = JSON.parse(
      this.querySelector("script[facetTitles]")!.textContent!,
    );
    return filterTitles;
  }

  get results(): RSearchResults {
    const resultsElement = document.querySelector<RSearchResults>(
      this.getAttribute("results") || "",
    );
    if (!resultsElement) {
      throw new Error("Need results element (specify selector in attribute)");
    }
    return resultsElement;
  }

  render(results: SearchResults) {
    const facetCreator = createFacetFrom(
      this.querySelector("template[facet]")!,
      this.querySelector("template[item]")!,
      this.facetTitles,
    );
    const facetElements = results.facets.map((facet) => facetCreator(facet));
    this.facetList.innerHTML = "";
    this.facetList.append(...facetElements);
  }

  connectedCallback() {
    this.querySelector("form")!.addEventListener("change", (ev) => {
      const input = ev.target as HTMLInputElement;
      const [facet, item] = input.name.split(":");
      const selected = input.checked;
      // fire filter change event
      this.dispatchEvent(
        new CustomEvent<EventSearchFilterChange>(EVENT_FILTER_CHANGE, {
          bubbles: true,
          detail: { facet, item, selected },
        }),
      );
    });
  }
}
