import { l as loadElement } from './load-element-1f445840.js';

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
