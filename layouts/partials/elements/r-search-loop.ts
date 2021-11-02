/// <reference lib="dom" />
/// <reference path="../../../globals.d.ts" />

import type {
  EventSearchDetails,
  SearchResultProduct,
  SearchResultTopHit,
  SearchResults,
} from "./search-domain.ts";
import { EVENT_SEARCH } from "./search-domain.ts";
import { search } from "./search-loop54.ts";

const currencyFmt = new Intl.NumberFormat(window.locale, {
  style: "currency",
  currency: window.site.currency,
});

const createProductItemFrom = (productTemplate: HTMLTemplateElement) =>
  (product: SearchResultProduct): HTMLElement => {
    const productItem = productTemplate.content.cloneNode(true) as HTMLElement;
    productItem.querySelector("[title]")!.textContent = product.title;
    productItem.querySelector("[price]")!.textContent = currencyFmt.format(
      product.price,
    );
    productItem.querySelector("img")!.src = product.imageUrl;
    productItem.querySelector("a")!.href = product.url;
    return productItem;
  };

const createTopHitItemFrom = (topHitTemplate: HTMLTemplateElement) =>
  (topHit: SearchResultTopHit): HTMLElement => {
    const topHitItem = topHitTemplate.content.cloneNode(true) as HTMLElement;
    const topHitLink = topHitItem.querySelector("a");
    if (!topHitLink) throw new Error("Malformed top hit template");
    topHitLink.textContent = topHit.title;
    topHitLink.href = topHit.url;
    return topHitItem;
  };

export default class RSearchLoop extends HTMLElement {
  sendEvent(query: string) {
    this.dispatchEvent(
      new CustomEvent<EventSearchDetails>(EVENT_SEARCH, {
        bubbles: true,
        detail: { query },
      }),
    );
  }

  setResultVisible(resultType: string, show: boolean) {
    const elem = this.querySelector<HTMLElement>(`[results="${resultType}"]`);
    if (!elem) throw new Error(`Search results ${resultType} not found`);
    if (show) elem.setAttribute("show", "");
    else elem.removeAttribute("show");
  }

  render({ products, topHits }: SearchResults) {
    if (products.length || topHits.length) {
      this.setResultVisible("suggested", false);
    } else {
      this.setResultVisible("suggested", true);
    }

    if (products.length) {
      this.setResultVisible("products", true);
      const productTemplate = this.querySelector<HTMLTemplateElement>(
        "template[product]",
      );
      const productsElement = this.querySelector<HTMLElement>(
        "[results=products]",
      );
      const productsList = productsElement!.querySelector("ul")!;
      productsList.innerHTML = "";
      productsList.append(
        ...products.map(createProductItemFrom(productTemplate!)),
      );
    } else {
      this.setResultVisible("products", false);
    }

    if (topHits.length) {
      this.setResultVisible("top-hits", true);
      const topHitTemplate = this.querySelector<HTMLTemplateElement>(
        "template[top-hit]",
      );
      const topHitsList = this.querySelector<HTMLUListElement>(
        "[results=top-hits] ul",
      );
      if (!topHitTemplate || !topHitsList) throw new Error("Malformed top hits template");
      topHitsList.innerHTML = "";
      topHitsList.append(
        ...topHits.map(createTopHitItemFrom(topHitTemplate)),
      );
    } else {
      this.setResultVisible("top-hits", false);
    }
  }

  async searchAndRender(query: string) {
    const results = await search(query);
    this.render(results);
  }

  connectedCallback() {
    const input = this.querySelector<HTMLInputElement>("input[type=search]");
    // add input event listener
    input?.addEventListener(
      "input",
      (e) => this.searchAndRender((<HTMLInputElement> e.target).value),
    );
    // search immediately if input has input
    if (input?.value) this.searchAndRender(input.value);
  }
}

window.customElements.define("r-search-loop", RSearchLoop);
