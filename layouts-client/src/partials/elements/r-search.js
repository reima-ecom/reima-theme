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
        item: `
            <a href="/products/{{objectID}}" class="hit">
            <img src="{{imageSrc}}" align="left" alt="{{name}}" />
            <div>
            <div class="hit-name">{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</div>
            <div class="hit-price">\${{price}}</div>
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
