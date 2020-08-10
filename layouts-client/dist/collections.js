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
      await __import__('https://cdn.jsdelivr.net/npm/algoliasearch@3.32.0/dist/algoliasearchLite.min.js');
    }
    const client = w.algoliasearch('6FDKJXBLR9', '3cc34311314307aa6cc876263de9e486');
    index = client.initIndex('reima-us-dev');
  }
  return index;
};

const searchAndRender = async () => {
  // search for products
  const facetFilters = Object.values(filters);
  const { hits } = await index.search('', { facetFilters });
  // render results
  /** @type {HTMLElement} */
  const list = document.querySelector('.product-list');
  for (let i = 0; i < list.children.length; i += 1) {
    const hit = hits[i];
    const element = /** @type {HTMLAnchorElement} */(list.children[i]);
    if (!hit) {
      element.style.display = 'none';
    } else {
      element.style.display = '';
      element.href = `/collections/${window.collection}/products/${hit.objectID}`;
      /** @type {HTMLImageElement} */
      const img = element.querySelector('img');
      img.dataset.src = '';
      img.dataset.srcset = '';
      img.srcset = '';
      img.src = hit.imageSrc;
      const dots = element.querySelector('.color-dots');
      dots.innerHTML = '';
      dots.innerHTML = hit.colors.map((c) => `<div style="background-color: ${colors[c.toLowerCase()]};"></div>`).join('');
      element.querySelector('h2').innerText = hit.title;
      /** @type {HTMLElement} */ (element.querySelector('.price')).innerText = `$${hit.price}`;
    }
  }
};

const filtersElement = document.getElementById('filters');
if (filtersElement) {
  filtersElement.addEventListener('change', async (e) => {
    await ensureIndex();
    const { name, value, checked } = /** @type {HTMLInputElement} */ (e.target);
    // add to array of active filters
    const key = `${name}:${value}`;
    if (!filters[name]) filters[name] = [];
    if (checked) filters[name].push(key);
    else filters[name].splice(filters[name].indexOf(key), 1);
    searchAndRender();
  });

  document.getElementById('clear').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('#filters input').forEach((input) => {
      // eslint-disable-next-line no-param-reassign
      /** @type {HTMLInputElement} */ (input).checked = false;
    });
    filters = { collections: filters.collections };
    searchAndRender();
  });
}
