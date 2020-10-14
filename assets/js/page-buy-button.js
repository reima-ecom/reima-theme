import { l as loadElement } from './load-element-32e01943.js';

setTimeout(() => {
  loadElement('r-cart');
}, 500);


/**
 * @param {Event} e
 */
const addToCart = (e) => {
  e.preventDefault();
  const variantId = /** @type {HTMLElement} */(e.currentTarget).getAttribute('href').replace('#buy=', '');
  /** @type {Cart} */(document.querySelector('r-cart')).addVariant(variantId);
};

document.querySelectorAll('[href^="#buy="]').forEach((element) => {
  element.addEventListener('click', addToCart);
});

/** @typedef {import('../partials/elements/r-cart').default} Cart */
