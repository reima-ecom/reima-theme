/**
 * @typedef CollectionPageProperties
 * @property {string} [collection]
 * @property {function} [algoliasearch]
 */

/** @type {CollectionPageProperties & Window} */
const w = window;

const colors = JSON.parse(document.getElementById('colors').innerHTML);

let filters = {
  collections: `collections:${w.collection}`,
};

let index;
const ensureIndex = async () => {
  if (!index) {
    if (!w.algoliasearch) {
      // @ts-ignore
      await import('https://cdn.jsdelivr.net/npm/algoliasearch@3.32.0/dist/algoliasearchLite.min.js');
    }
    const client = w.algoliasearch(w.site.algolia.appid, w.site.algolia.apikey);
    index = client.initIndex(w.site.algolia.indexname);
  }
  return index;
};

const searchAndRender = async () => {
  // search for products
  const facetFilters = Object.values(filters);
  const { hits } = await index.search('', { facetFilters });
  // render results
  /** @type {HTMLElement} */
  const list = document.querySelector('.product-list > ul');
  for (let i = 0; i < list.children.length; i += 1) {
    const hit = hits[i];
    const element = /** @type {HTMLAnchorElement} */(list.children[i]);
    if (!hit) {
      element.style.display = 'none';
    } else {
      element.style.display = '';
      element.querySelector('a').href = `/collections/${window.collection}/products/${hit.objectID}`;
      /** @type {HTMLImageElement} */
      const img = element.querySelector('img');
      img.dataset.src = '';
      img.dataset.srcset = '';
      img.srcset = '';
      img.src = hit.imageSrc;
      const dots = element.querySelector('.color-dots');
      dots.innerHTML = '';
      dots.innerHTML = hit.colors.map((c) => `<div style="background-color: ${colors[c.toLowerCase()]};"></div>`).join('');
      /** @type {HTMLElement} */(element.querySelector('h3 a')).innerText = hit.title;
      /** @type {HTMLElement} */ (element.querySelector('.price')).innerText = `$${hit.price}`;
    }
  }
};

const filtersForm = document.getElementById('filters');
if (filtersForm) {
  filtersForm.addEventListener('change', async (e) => {
    const { name, value, checked } = /** @type {HTMLInputElement} */ (e.target);
    // if this is an element opener checkbox, bail out
    if (name.startsWith('open-')) return;
    await ensureIndex();
    // add to array of active filters
    const key = `${name}:${value}`;
    if (!filters[name]) filters[name] = [];
    if (checked) filters[name].push(key);
    else filters[name].splice(filters[name].indexOf(key), 1);
    searchAndRender();
  });

  filtersForm.addEventListener('reset', () => {
    filters = { collections: filters.collections };
    searchAndRender();
  });
}
