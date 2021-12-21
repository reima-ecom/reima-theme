/// <reference lib="dom" />

import type {
  SearchResultFacet,
  SearchResultFacetItem,
  SearchResults,
} from "./search-domain.ts";

const createItemFrom = (itemTemplate: HTMLTemplateElement) =>
  (item: SearchResultFacetItem): HTMLElement => {
    const itemElement = itemTemplate.content.cloneNode(true) as HTMLElement;
    itemElement.querySelector("li")!.innerText = item.name;
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
    facetItem.querySelector("ul")!.append(...items);
    return facetItem;
  };

export default class RSearchFilters extends HTMLElement {
  get facetList(): HTMLUListElement {
    const list = this.querySelector<HTMLUListElement>(
      "ul",
    );
    if (!list) throw new Error("Element not found");
    return list;
  }

  get facetTitles(): Record<string, string> {
    const filterTitles = JSON.parse(
      this.querySelector("script[facetTitles]")!.textContent!,
    );
    return Object.fromEntries(
      Object.entries(filterTitles).map((
        [name, title],
      ) => [`Attributes_${name}`, title as string]),
    );
  }

  render(results: SearchResults) {
    const facetCreator = createFacetFrom(
      this.querySelector("template[facet]")!,
      this.querySelector("template[item]")!,
      this.facetTitles,
    );
    const facetElements = results.facets.map((facet) => facetCreator(facet));
    this.facetList.append(...facetElements);
  }
}
