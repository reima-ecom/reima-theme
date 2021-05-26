/// <reference lib="dom" />
/// <reference path="../../../globals.d.ts" />

declare global {
  interface Window {
    instantsearch: any;
    algoliasearch: any;
  }
}

type HitItem = {
  objectID: any;
  imageSrc: any;
  name: any;
  title: any;
  price: any;
};

type SearchHelper = {
  search: () => void;
};

type UiState = {
  [indexName: string]: {
    [s: string]: unknown;
    query: string | undefined;
  };
};

export const EVENT_SEARCH = "search";
export type EventSearchDetails = {
  query: string | undefined;
};

const debounce = (func: (...args: any[]) => unknown, timeout = 300) => {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const currencyFmt = new Intl.NumberFormat(window.locale, {
  style: "currency",
  currency: window.site.currency,
});

export default class RSearch extends HTMLElement {
  // instantsearch.js
  search: any;

  constructor() {
    super();
    const settings = window.site.algolia!;
    this.search = window.instantsearch({
      indexName: settings.indexname,
      searchClient: window.algoliasearch(settings.appid, settings.apikey),
      searchFunction: (helper: SearchHelper) => {
        document!.getElementById("searchbox")!.querySelector("input")!.focus();
        helper.search();
      },
    });
  }

  sendEvent(uiState: UiState) {
    const firstIndex = Object.values(uiState)[0];
    this.dispatchEvent(
      new CustomEvent<EventSearchDetails>(EVENT_SEARCH, {
        bubbles: true,
        detail: { query: firstIndex.query },
      }),
    );
  }

  connectedCallback() {
    const searchbox = window.instantsearch.widgets.searchBox({
      container: "#searchbox",
      showSubmit: false,
      showReset: false,
    });

    const hits = window.instantsearch.widgets.hits({
      container: "#hits",
      templates: {
        item: (item: HitItem) =>
          `
            <a href="/products/${item.objectID}" class="hit">
            <img src="${item.imageSrc}" align="left" alt="${item.title}" />
            <div>
            <div class="hit-name">${item.title}</div>
            <div class="hit-price">${currencyFmt.format(item.price)}</div>
            </div>
            </a>
          `,
      },
    });

    this.search.addWidgets([searchbox, hits]);
    const sendEventDebounced = debounce(this.sendEvent.bind(this), 1000);
    this.search.use(() => ({
      onStateChange({ uiState }: unknown) {
        sendEventDebounced(uiState);
      },
      subscribe() {},
      unsubscribe() {},
    }));

    this.search.start();
  }
}

const load = (url: string) =>
  new Promise((resovle, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resovle;
    script.onerror = reject;
    document.head.appendChild(script);
  });

// load algolia if not defined (and thus loaded) already
if (!window.customElements.get("r-search")) {
  Promise.all([
    load(
      "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
    ),
    load(
      "https://cdn.jsdelivr.net/npm/instantsearch.js@4.8.3/dist/instantsearch.production.min.js",
    ),
  ]).then(() => {
    window.customElements.define("r-search", RSearch);
  }).catch(console.error);
}
