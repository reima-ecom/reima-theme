const getElementImport = async (name) => {
  switch (name) {
    case 'r-search':
      return import('../elements/r-search.js');
    case 'r-carousel':
      return import('../elements/r-carousel.js');
    case 'r-thumbnails':
      return import('../elements/r-thumbnails.js');
    default:
      throw new Error(`No such element ${name}`);
  }
};

const loadElement = async (name) => {
  // polyfill custom elements if needed
  if (!window.customElements) {
    const { polyfillCustomElements } = await import('./load-polyfill');
    await polyfillCustomElements();
  }
  // define element if not defined
  if (!window.customElements.get(name)) {
    const imported = await getElementImport(name);
    const element = imported.default;
    window.customElements.define(element.elementName, element);
  }
};

export default loadElement;
