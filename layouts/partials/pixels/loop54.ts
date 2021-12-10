import { EVENT_SEARCH_PRODUCT_CLICK } from "../elements/search-domain.ts";
import { createEventSender } from "../elements/search-loop54.ts";

declare global {
  interface Window {
    loop54url: string;
  }
}

document.addEventListener(EVENT_SEARCH_PRODUCT_CLICK, (ev) => {
  createEventSender(window.loop54url)("click", ev.detail.productId);
});

document.addEventListener("cart-add", (ev) => {
  createEventSender(window.loop54url)("addtocart", (ev as CustomEvent).detail.variant.productIdLegacy);
});
