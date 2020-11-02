import RCart from '../partials/elements/r-cart';

/**
 * @param {Event} e
 */
const addToCart = (e) => {
  e.preventDefault();
  const variantId = e.currentTarget.getAttribute('href').replace('#buy=', '');
  document.querySelector<RCart>('r-cart').addVariant(variantId);
};

document.querySelectorAll('[href^="#buy="]').forEach((element) => {
  element.addEventListener('click', addToCart);
});
