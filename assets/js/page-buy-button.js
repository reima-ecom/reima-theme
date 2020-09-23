import { l as loadElement } from './load-element-b03c5bd5.js';

setTimeout(() => {
  loadElement('r-cart');
}, 500);


/**
 * @param {Event} e
 */
const addToCart = (e) => {
  e.preventDefault();
  const [, variantId] = /** @type {HTMLElement} */(e.currentTarget).getAttribute('href').split('=');
  /** @type {Cart} */(document.querySelector('r-cart')).addVariant(variantId);
};

document.querySelectorAll('[href^="#buy="]').forEach((element) => {
  element.addEventListener('click', addToCart);
});

/** @typedef {import('../partials/elements/r-cart').default} Cart */
