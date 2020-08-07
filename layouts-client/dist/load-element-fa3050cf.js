const getElementImport = async (name) => {
  switch (name) {
    case 'r-cart':
      return __import__('./r-cart-3a5d2705.js');
    case 'r-search':
      return __import__('./r-search-4b114e94.js');
    case 'r-carousel':
      return __import__('./r-carousel-ef47b807.js');
    case 'r-thumbnails':
      return __import__('./r-thumbnails-2cd9c4d0.js');
    default:
      throw new Error(`No such element ${name}`);
  }
};

const loadElement = async (name) => {
  // polyfill custom elements if needed
  if (!window.customElements) {
    const { polyfillCustomElements } = await __import__('./load-polyfill-170053af.js');
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
