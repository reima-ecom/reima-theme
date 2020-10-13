const getElementImport = async (name) => {
  switch (name) {
    case 'r-cart':
      return __import__('./r-cart-60229991.js');
    case 'r-search':
      return __import__('./r-search-6f71c299.js');
    case 'r-carousel':
      return __import__('./r-carousel-978139e5.js');
    case 'r-thumbnails':
      return __import__('./r-thumbnails-de053413.js');
    default:
      throw new Error(`No such element ${name}`);
  }
};

const loadElement = async (name) => {
  // polyfill custom elements if needed
  if (!window.customElements) {
    const { polyfillCustomElements } = await __import__('./load-polyfill-accb015b.js');
    await polyfillCustomElements();
  }
  // define element if not defined
  if (!window.customElements.get(name)) {
    const imported = await getElementImport(name);
    const element = imported.default;
    window.customElements.define(element.elementName, element);
  }
};

export { loadElement as l };
