/// <reference lib="dom" />

import type {
  EventSearchDetails,
  SearchResultCategory,
  SearchResultProduct,
  SearchResults,
} from "./search-domain.ts";
import { EVENT_SEARCH } from "./search-domain.ts";
import { createSearcher, createSuggester } from "./search-loop54.ts";

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
    if (product.imageDimensions) {
      productItem.querySelector("img")!.width = product.imageDimensions.width;
      productItem.querySelector("img")!.height = product.imageDimensions.height;
    }
    productItem.querySelector("a")!.href = product.url;
    return productItem;
  };

const createCategoryFrom = (categoryTemplate: HTMLTemplateElement) =>
  (category: SearchResultCategory): HTMLElement => {
    const categoryItem = categoryTemplate.content.cloneNode(
      true,
    ) as HTMLElement;
    const categoryLink = categoryItem.querySelector("a");
    if (!categoryLink) throw new Error("Malformed category template");
    categoryLink.textContent = category.title;
    categoryLink.href = category.url;
    return categoryItem;
  };

const createSuggestionFrom = (suggestionTemplate: HTMLTemplateElement) =>
  (suggestion: string): HTMLElement => {
    const suggestionItem = suggestionTemplate.content.cloneNode(
      true,
    ) as HTMLElement;
    const suggestionLink = suggestionItem.querySelector("a");
    if (!suggestionLink) throw new Error("Malformed suggestion template");
    suggestionLink.textContent = suggestion;
    suggestionLink.href = `/search/?q=${suggestion}`;
    return suggestionItem;
  };

export default class RSearchResults extends HTMLElement {
  lastQuery = "";

  connectedCallback() {
    if (this.loadMore) {
      const moreLink = this.querySelector<HTMLAnchorElement>(
        "[results=more] a",
      );
      if (!moreLink) throw new Error("Show more link not found");
      moreLink.addEventListener("click", async (event) => {
        event.preventDefault();
        this.skip = this.skip + this.take;
        await this.searchAndRender(undefined, false);
        // push take to url to enable going back to the same results
        const url = new URL(location.href);
        const take = this.productList.childElementCount;
        url.searchParams.set("take", take.toString());
        history.pushState(undefined, document.title, url.toString());
      });
    }
  }

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

  get take(): number {
    const attr = this.getAttribute("take");
    if (!attr) return 15;
    return Number.parseInt(attr);
  }

  get loadMore(): boolean {
    return this.hasAttribute("load-more");
  }

  get skip(): number {
    const attr = this.getAttribute("skip");
    if (!attr) return 0;
    return Number.parseInt(attr);
  }

  set skip(value: number) {
    value && this.setAttribute("skip", value?.toString());
  }

  get productList(): HTMLUListElement {
    const list = this.querySelector<HTMLUListElement>(
      "[results=products] ul",
    );
    if (!list) throw new Error("Element not found");
    return list;
  }

  get categoryList(): HTMLUListElement {
    const list = this.querySelector<HTMLUListElement>(
      "[results=categories] ul",
    );
    if (!list) throw new Error("Element not found");
    return list;
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

  renderMore({ products, categories, hasMore, query }: SearchResults) {
    if (products.length || categories.length) {
      this.setResultVisible("suggested", false);
    } else {
      this.setResultVisible("suggested", true);
    }

    this.setResultVisible("products", !!products.length);
    if (products.length) {
      const productTemplate = this.querySelector<HTMLTemplateElement>(
        "template[product]",
      );
      this.productList.append(
        ...products.map(
          createProductItemFrom(
            productTemplate!,
            createCurrencyFormatter(this.locale, this.currency),
          ),
        ),
      );
    }

    this.setResultVisible("categories", !!categories.length);
    if (categories.length) {
      const categoryTemplate = this.querySelector<HTMLTemplateElement>(
        "template[category]",
      );
      if (!categoryTemplate) {
        throw new Error("Malformed top hits template");
      }
      this.categoryList.append(
        ...categories.map(createCategoryFrom(categoryTemplate)),
      );
    }

    this.setResultVisible("more", hasMore);
    if (hasMore) {
      const moreLink = this.querySelector<HTMLAnchorElement>(
        "[results=more] a",
      );
      if (!moreLink) throw new Error("Show more link not found");
      moreLink.href = `/search/?q=${query}`;
    }
  }

  async showSuggestions() {
    const suggestions = await createSuggester(this.loopUrl)();
    if (suggestions.length) {
      const suggestionTemplate = this.querySelector<HTMLTemplateElement>(
        "template[suggestion]",
      );
      const suggestionsElement = this.querySelector<HTMLElement>(
        "[results=suggested]",
      );
      const suggestionsList = suggestionsElement!.querySelector("ul")!;
      suggestionsList.innerHTML = "";
      suggestionsList.append(
        ...suggestions.map(
          createSuggestionFrom(suggestionTemplate!),
        ),
      );
    }
    this.setResultVisible("suggested", true);
  }

  clearResults() {
    this.productList.innerHTML = "";
    this.categoryList.innerHTML = "";
  }

  async searchAndRender(query = this.lastQuery, clear = true, take?: number) {
    const results = await createSearcher(this.loopUrl)(
      query,
      take || this.take,
      this.skip,
    );
    this.lastQuery = query;
    clear && this.clearResults();
    this.renderMore(results);
  }
}
