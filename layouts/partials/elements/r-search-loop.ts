/// <reference lib="dom" />

import type {
  EventSearchDetails,
  SearchResultProduct,
  SearchResults,
  SearchResultCategory,
} from "./search-domain.ts";
import { EVENT_SEARCH } from "./search-domain.ts";
import { createSearcher } from "./search-loop54.ts";

const createCurrencyFormatter = (locale: string, currency: string) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  return (amount: number) => formatter.format(amount);
};

const createProductItemFrom = (
  productTemplate: HTMLTemplateElement,
  formatCurrency: (amount: number) => string,
) =>
  (product: SearchResultProduct): HTMLElement => {
    const productItem = productTemplate.content.cloneNode(true) as HTMLElement;
    productItem.querySelector("[title]")!.textContent = product.title;
    productItem.querySelector("[price]")!.textContent = formatCurrency(
      product.price,
    );
    productItem.querySelector("img")!.src = product.imageUrl;
    productItem.querySelector("a")!.href = product.url;
    return productItem;
  };

const createCategoryFrom = (categoryTemplate: HTMLTemplateElement) =>
  (category: SearchResultCategory): HTMLElement => {
    const categoryItem = categoryTemplate.content.cloneNode(true) as HTMLElement;
    const categoryLink = categoryItem.querySelector("a");
    if (!categoryLink) throw new Error("Malformed category template");
    categoryLink.textContent = category.title;
    categoryLink.href = category.url;
    return categoryItem;
  };

export default class RSearchLoop extends HTMLElement {
  get loopUrl(): string {
    const attr = this.getAttribute("loop-url");
    if (!attr) throw new Error("Mandatory argument missing");
    return attr;
  }

  get currency(): string {
    const attr = this.getAttribute("currency");
    if (!attr) throw new Error("Mandatory argument missing");
    return attr;
  }

  get locale(): string {
    const attr = this.getAttribute("locale");
    if (!attr) throw new Error("Mandatory argument missing");
    return attr;
  }

  get take(): number | undefined {
    const attr = this.getAttribute("take");
    if (!attr) return undefined;
    return Number.parseInt(attr);
  }


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

  render({ products, categories, hasMore }: SearchResults) {
    if (products.length || categories.length) {
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
        ...products.map(createProductItemFrom(productTemplate!, createCurrencyFormatter(this.locale, this.currency))),
      );
    } else {
      this.setResultVisible("products", false);
    }

    if (categories.length) {
      this.setResultVisible("categories", true);
      const categoryTemplate = this.querySelector<HTMLTemplateElement>(
        "template[category]",
      );
      const categorysList = this.querySelector<HTMLUListElement>(
        "[results=categories] ul",
      );
      if (!categoryTemplate || !categorysList) {
        throw new Error("Malformed top hits template");
      }
      categorysList.innerHTML = "";
      categorysList.append(
        ...categories.map(createCategoryFrom(categoryTemplate)),
      );
    } else {
      this.setResultVisible("categories", false);
    }

    this.setResultVisible("more", hasMore);
  }

  async searchAndRender(query: string) {
    const results = await createSearcher(this.loopUrl, this.take)(query);
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
