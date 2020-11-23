/// <reference lib="dom" />

/**
 * @param {Event} e
 */
const addToCart = (e) => {
  e.preventDefault();
  const variantId = e.currentTarget.getAttribute("href")
    .replace("/cart?add=", "");
  document.querySelector<RCart>("r-cart").addVariant(variantId);
};

document.querySelectorAll('[href^="/cart?add="]').forEach(
  (element) => {
    element.addEventListener("click", addToCart);
  },
);
