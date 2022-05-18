/// <reference lib="dom" />

import type {
  EventSearchFilterChange,
  SearchResultFacet,
  SearchResultFacetItem,
} from "./search-domain.ts";
import { EVENT_FILTER_CHANGE, EVENT_FILTER_RESET } from "./search-domain.ts";
import type RSearchResults from "./r-search-results.ts";

const createItemFrom =
  (itemTemplate: HTMLTemplateElement) =>
  (item: SearchResultFacetItem): HTMLElement => {
    const findTranslation = (arr, string) => {
      return arr.find((element) => element.name === string)?.translation;
    };
    const itemElement = itemTemplate.content.cloneNode(true) as HTMLElement;
    const id = `${item.facet}:${item.name}`;
    const label = itemElement.querySelector("label")!;
    label.innerText =
      typeof loop54Categories !== "undefined" &&
      findTranslation(loop54Categories.category, item.name)
        ? findTranslation(loop54Categories.category, item.name)
        : item.name;
    label.setAttribute("for", id);
    const checkbox = itemElement.querySelector("input")!;
    checkbox.id = id;
    checkbox.name = id;
    checkbox.checked = item.selected;
    return itemElement;
  };

const createFacetFrom =
  (
    facetTemplate: HTMLTemplateElement,
    itemTemplate: HTMLTemplateElement,
    facetTitles: Record<string, string>
  ) =>
  (facet: SearchResultFacet): HTMLElement | undefined => {
    //hacky way of translating category to jp
    const categoryTranslate =
      facet.name === "Category" && typeof loop54Categories !== "undefined"
        ? "カテゴリー"
        : facet.name;
    // bail if no items in facet
    if (!facet.items.length) return;
    const facetItem = facetTemplate.content.cloneNode(true) as HTMLElement;
    facetItem.querySelector("[title]")!.textContent =
      facetTitles[facet.name] || categoryTranslate;
    const createItem = createItemFrom(itemTemplate);
    const items = facet.items.map((i) => createItem(i));
    const detailsElement = facetItem.querySelector("details")!;
    detailsElement.open = facet.items.some((i) => i.selected);
    detailsElement.append(...items);
    return facetItem;
  };

export default class RSearchFilters extends HTMLElement {
  get facetList(): HTMLElement {
    const list = this.querySelector<HTMLElement>("form > div");
    if (!list) throw new Error("Element not found");
    return list;
  }

  get facetTitles(): Record<string, string> {
    const filterTitles = JSON.parse(
      this.querySelector("script[facetTitles]")!.textContent!
    );
    return filterTitles;
  }

  get results(): RSearchResults {
    const resultsElement = document.querySelector<RSearchResults>(
      this.getAttribute("results") || ""
    );
    if (!resultsElement) {
      throw new Error("Need results element (specify selector in attribute)");
    }
    return resultsElement;
  }

  render(facets: SearchResultFacet[]) {
    const facetCreator = createFacetFrom(
      this.querySelector("template[facet]")!,
      this.querySelector("template[item]")!,
      this.facetTitles
    );
    const facetElements = facets
      .map((facet) => facetCreator(facet))
      .filter(Boolean);
    this.facetList.innerHTML = "";
    this.facetList.append(...facetElements);
  }

  connectedCallback() {
    const form = this.querySelector("form")!;
    form.addEventListener("change", (ev) => {
      const input = ev.target as HTMLInputElement;
      const [facet, item] = input.name.split(":");
      const selected = input.checked;
      // fire filter change event
      this.dispatchEvent(
        new CustomEvent<EventSearchFilterChange>(EVENT_FILTER_CHANGE, {
          bubbles: true,
          detail: { facet, item, selected },
        })
      );
    });
    form.addEventListener("reset", (_) => {
      this.dispatchEvent(
        new CustomEvent(EVENT_FILTER_RESET, { bubbles: true })
      );
    });
  }
}
