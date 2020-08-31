import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

export default class RSearch extends HTMLElement {
  constructor() {
    super();
    const settings = window.site.algolia;
    this.search = instantsearch({
      indexName: settings.indexname,
      searchClient: algoliasearch(settings.appid, settings.apikey),
      searchFunction: (helper) => {
        document.getElementById('searchbox').querySelector('input').focus();
        helper.search();
      },
    });
  }

  connectedCallback() {
    const searchbox = instantsearch.widgets.searchBox({
      container: '#searchbox',
      showSubmit: false,
      showReset: false,
    });

    const hits = instantsearch.widgets.hits({
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
RSearch.elementName = 'r-search';
