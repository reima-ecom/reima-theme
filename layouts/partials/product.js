import loadElement from './helpers/load-element.js';

setTimeout(() => {
  loadElement('r-cart');
}, 500);

/** @type {HTMLFormElement} */
const form = document.querySelector('form#product-form');
const cartButton = form.querySelector('button');
/** @type {NodeListOf<HTMLInputElement>} */
const radioBoxes = form.querySelectorAll('input[type=radio]');
/** @type {ProductPageProperties & Window} */
const { selectedOptions, variants } = window;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const targetForm = /** @type {HTMLButtonElement} */ (e.target);
  /** @type {HTMLButtonElement} */
  const btn = targetForm.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    const { variant } = targetForm.dataset;
    /** @type {import('./elements/r-cart.js').default} */
    const cart = document.querySelector('r-cart');
    await cart.addVariant(variant);
  } finally {
    btn.disabled = false;
  }
});

const getVariant = async (options) => variants.find((v) => {
  if (Object.keys(v.options).length !== Object.keys(options).length) return false;
  return Object.keys(v.options).every((k) => options[k] === v.options[k]);
});

const inputChange = async (e) => {
  const { name } = e.currentTarget;
  const { value } = e.currentTarget;
  const isColor = e.currentTarget.closest('.selections--Color');
  selectedOptions[name] = value;
  // check if available
  const variant = await getVariant(selectedOptions);
  if (!variant) {
    cartButton.innerText = cartButton.dataset.na;
    cartButton.disabled = true;
  } else if (!variant.available) {
    cartButton.innerText = cartButton.dataset.sold;
    cartButton.disabled = true;
  } else {
    cartButton.innerText = cartButton.dataset.add;
    cartButton.disabled = false;
    form.dataset.variant = variant.id;
  }
  // update availability
  radioBoxes.forEach(async (radio) => {
    const thisSelection = Object.assign({}, selectedOptions, { [radio.name]: radio.value });
    const thisVariant = await getVariant(thisSelection);
    const thisLabel = document.querySelector(`label[for="${radio.id}"]`);
    if (thisVariant && thisVariant.available) thisLabel.classList.remove('unavailable');
    else thisLabel.classList.add('unavailable');
  });
  // set selected span text
  document.getElementById(`selected-${name}`).innerText = value;
  if (variant) {
    // update prices
    /** @type {HTMLElement} */
    const priceElement = document.querySelector('.price--actual');
    priceElement.innerText = variant.priceFormatted;
    if (variant.compareAtPrice > variant.price) priceElement.classList.add('price--sale');
    else priceElement.classList.remove('price--sale');
    /** @type {HTMLElement} */(document.querySelector('.price--was')).innerText = variant.compareAtPriceFormatted || '';
    // scroll to variant image if color change
    if (isColor) {
      /** @type {import('./elements/r-carousel').default} */(document.querySelector('r-carousel')).scrollToImage(variant.imageIndex);
      /** @type {import('./elements/r-thumbnails').default} */(document.querySelector('r-thumbnails')).setActiveThumbnail(variant.imageIndex, true);
    }
  }
};

radioBoxes.forEach((node) => {
  node.addEventListener('change', inputChange);
});

/**
 * @typedef Variant
 * @property {string} id
 * @property {boolean} available
 * @property {number} price
 * @property {string} priceFormatted
 * @property {number} compareAtPrice
 * @property {string} compareAtPriceFormatted
 * @property {number} imageIndex
 * @property {Object<string, string>} options
 */

/**
 * @typedef ProductPageProperties
 * @property {Object<string, string>} [selectedOptions]
 * @property {Variant[]} [variants]
 */
