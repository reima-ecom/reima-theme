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
      await import('https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.umd.js');
    }
    const client = w.algoliasearch(w.site.algolia.appid, w.site.algolia.apikey);
    index = client.initIndex(w.site.algolia.indexname);
  }
  return index;
};

const searchAndRender = async () => {
  // search for products
  const facetFilters = Object.values(filters);
  const { hits } = await index.search('', { facetFilters, hitsPerPage: 1000 });
  // render results
  /** @type {HTMLElement} */
  const list = document.querySelector('.product-list > ul');
  // create map of hit handles
  const hitHandles = hits.reduce((obj, hit) => ({
    ...obj,
    [hit.objectID]: true,
  }), {});
  // show or hide elements based on hits existence
  for (let i = 0; i < list.children.length; i += 1) {
    const element = /** @type {HTMLElement} */(list.children[i])
    element.style.display = hitHandles[element.getAttribute('handle')] ? 'block' : 'none';
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
