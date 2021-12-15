/// <reference lib="dom" />

import type {
  EventSearchDetails,
  EventSearchProductClickDetails,
  SearchResultProduct,
  SearchResults,
} from "./search-domain.ts";
import { EVENT_SEARCH, EVENT_SEARCH_PRODUCT_CLICK } from "./search-domain.ts";
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
    if (product.imageDimensions?.width) {
      productItem.querySelector("img")!.width = product.imageDimensions.width;
    }
    if (product.imageDimensions?.height) {
      productItem.querySelector("img")!.height = product.imageDimensions.height;
    }
    const linkElement = productItem.querySelector("a")!;
    linkElement.href = product.url;
    linkElement.setAttribute("product-id", product.id);
    return productItem;
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
    // add handling of button to load more results (if enabled)
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
    // add event listener for product click
    this.productList.addEventListener("click", (ev) => {
      const linkElement = (ev.target as HTMLElement).closest("a");
      if (linkElement) {
        const productId = linkElement.getAttribute("product-id");
        if (!productId) throw new Error("Product id not found");
        this.dispatchEvent(
          new CustomEvent<EventSearchProductClickDetails>(
            EVENT_SEARCH_PRODUCT_CLICK,
            {
              bubbles: true,
              detail: { productId },
            },
          ),
        );
      }
    });
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

  get showRelated(): boolean {
    return this.hasAttribute("show-related");
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

  get relatedList(): HTMLUListElement {
    const list = this.querySelector<HTMLUListElement>(
      "[results=related] ul",
    );
    if (!list) throw new Error("Element not found");
    return list;
  }

  sendSearchEvent(query: string) {
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

  renderMore({ products, relatedQueries, hasMore, query }: SearchResults) {
    if (products.length) {
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

    if (this.showRelated) {
      this.setResultVisible("related", !!relatedQueries.length);
      if (relatedQueries.length) {
        const suggestionTemplate = this.querySelector<HTMLTemplateElement>(
          "template[suggestion]",
        );
        if (!suggestionTemplate) {
          throw new Error("Malformed suggestion template");
        }
        this.relatedList.append(
          ...relatedQueries.map(createSuggestionFrom(suggestionTemplate)),
        );
      }
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
    this.relatedList.innerHTML = "";
  }

  async searchAndRender(
    query = this.lastQuery,
    clear = true,
    take?: number,
    instant = false,
  ) {
    const results = await createSearcher(this.loopUrl)(
      query,
      take || this.take,
      this.skip,
      instant,
    );
    this.lastQuery = query;
    clear && this.clearResults();
    this.renderMore(results);
  }
}
