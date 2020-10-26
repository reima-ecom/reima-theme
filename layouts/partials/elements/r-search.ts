import '../../../globals.d';

declare global {
  interface Window {
    instantsearch: any;
    algoliasearch: any;
  }
}

export default class RSearch extends HTMLElement {
  // instantsearch.js
  search: any;

  constructor() {
    super();
    const settings = window.site.algolia;
    this.search = window.instantsearch({
      indexName: settings.indexname,
      searchClient: window.algoliasearch(settings.appid, settings.apikey),
      searchFunction: (helper) => {
        document.getElementById('searchbox').querySelector('input').focus();
        helper.search();
      },
    });
  }

  connectedCallback() {
    const searchbox = window.instantsearch.widgets.searchBox({
      container: '#searchbox',
      showSubmit: false,
      showReset: false,
    });

    const hits = window.instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        item: (item) => `
            <a href="/products/${item.objectID}" class="hit">
            <img src="${item.imageSrc}" align="left" alt="${item.name}" />
            <div>
            <div class="hit-name">${item.title}</div>
            <div class="hit-price">$${item.price}</div>
            </div>
            </a>
          `,
      },
    });

    this.search.addWidgets([searchbox, hits]);

    this.search.start();
  }
}

const load = async (url: string) => new Promise((resovle, reject) => {
  const script = document.createElement('script');
  script.src = url;
  script.onload = resovle;
  script.onerror = reject;
  document.head.appendChild(script);
});

// load algolia if not defined (and thus loaded) already
if (!window.customElements.get('r-search')) {
  Promise.all([
    load('https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js'),
    load('https://cdn.jsdelivr.net/npm/instantsearch.js@4.8.3/dist/instantsearch.production.min.js')
  ]).then(() => {
    window.customElements.define('r-search', RSearch);
  }).catch(console.error);
}