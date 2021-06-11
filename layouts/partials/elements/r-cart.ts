/// <reference lib="dom" />

import type {
  Checkout,
  LineItem,
  Money,
} from "https://raw.githubusercontent.com/reima-ecom/cart-worker/main/lib/checkout.ts";
import type { UpdateQuantityPutRequestBody } from "https://raw.githubusercontent.com/reima-ecom/cart-worker/main/handler.ts";

const formatPrice = (
  { amount, currency }: Money,
) => (amount
  ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  )
  : "");

const storefrontIdToLegacy = (id: string) => atob(id).split("/").pop();

export default class RCart extends HTMLElement {
  items!: HTMLElement;
  subtotal!: HTMLElement;
  checkout!: HTMLAnchorElement;

  static get observedAttributes() {
    return ["open"];
  }

  get url() {
    return this.getAttribute("url") || "/cart";
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(val) {
    if (val) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    if (val) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "open") {
      // set body overflow for scrolling
      document.body.style.overflow = this.open ? "hidden" : "";
      // load cart if not loaded
      if (this.loading) {
        this.loadCheckout();
      }
    }
  }

  get itemCount(): number {
    return Number.parseInt(localStorage.getItem("cart-item-count") || "");
  }

  set itemCount(count: number) {
    localStorage.setItem("cart-item-count", count.toString());
    // update indicator
    this.updateIndicatorDotCount(count);
  }

  updateIndicatorDotCount(count: number = this.itemCount) {
    this.querySelector<HTMLElement>("[count]")!.innerHTML = this.itemCount
      ? this.itemCount.toString()
      : "";
  }

  render(checkout?: Checkout) {
    this.items.innerHTML = "";
    if (checkout) {
      /** @type {HTMLTemplateElement} */
      const template = this.querySelector<HTMLTemplateElement>("#item")!;
      checkout.items.forEach((li) => {
        const item = template.content.cloneNode(true) as HTMLElement;
        if (li.variant.image) {
          const img = item.querySelector("img")!;
          img.src = li.variant.image.src;
          img.alt = li.variant.image.altText;
        }
        item.querySelector("h2")!.innerText = li.title;
        if (li.variant.title && li.variant.title !== "Default Title") {
          item.querySelector("h3")!.innerText = li.variant.title;
        }
        const input = item.querySelector("input")!;
        input.value = li.quantity.toString();
        input.dataset.id = li.id;
        item.querySelector<HTMLElement>(".price")!.innerText = formatPrice(
          li.variant.price,
        );
        this.items.appendChild(item);
      });
      this.checkout.href = checkout.url;
      this.subtotal.innerText = formatPrice(
        checkout.subtotal,
      );
      // update dot count
      this.itemCount = checkout.items.reduce(
        (count: number, li: LineItem) => count + li.quantity,
        0,
      );
    } else {
      this.itemCount = 0;
    }
  }

  async addVariant(variantId: string) {
    const response = await fetch(`${this.url}?add=${variantId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    const checkout: Checkout = await response.json();
    this.render(checkout);
    this.open = true;

    // new way to dispatch cart add event, will bubble to document
    const basket = {
      id: checkout.id,
      url: checkout.url,
      total: checkout.subtotal.amount,
      currency: checkout.subtotal.currency,
      items: checkout.items.map((li) => ({
        variantId: li.variant.id,
        title: li.variant.title,
        quantity: li.quantity,
        price: li.variant.price.amount,
        productId: li.variant.product.id,
        productHandle: li.variant.product.handle,
        productTitle: li.title,
        productIdLegacy: storefrontIdToLegacy(li.variant.product.id),
        variantIdLegacy: storefrontIdToLegacy(variantId),
      })),
    };
    const variant = basket.items.find((li: any) => li.variantId === variantId);
    this.dispatchEvent(
      new CustomEvent("cart-add", {
        bubbles: true,
        detail: { variantId, variant, checkout: basket },
      }),
    );
  }

  async updateQuantity(inputElement: HTMLInputElement) {
    const updates: UpdateQuantityPutRequestBody = {
      itemId: inputElement.dataset.id!,
      quantity: Number.parseInt(inputElement.value, 10),
    };
    const response = await fetch(this.url, {
      method: "PUT",
      body: JSON.stringify(updates),
      headers: {
        "Accept": "application/json",
      },
    });
    const checkout = await response.json();
    this.render(checkout);
  }

  async loadCheckout() {
    const response = await fetch(this.url, {
      headers: {
        "Accept": "application/json",
      },
    });
    let checkout: Checkout | undefined;
    if (response.status === 200) {
      checkout = await response.json();
    }
    console.log(checkout);
    this.render(checkout);
    this.loading = false;
  }

  connectedCallback() {
    this.items = this.querySelector<HTMLElement>(".items")!;
    this.checkout = this.querySelector<HTMLAnchorElement>(".checkout")!;
    this.subtotal = this.querySelector<HTMLElement>(".summary .price")!;

    // make cart open on icon link click (instead of going to the cart page)
    this.querySelector("a.icon")!.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.open = true;
    });

    // listen for close buttons
    this.addEventListener("click", (e) => {
      const self = e.target as HTMLElement;
      if (self.hasAttribute("close") || self.closest("[close]")) {
        this.open = false;
      }
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.open = false;
      }
    });

    // set indicator dot count
    this.updateIndicatorDotCount();

    // listen for plus and minus quantity button clicks
    this.items.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t.nodeName === "BUTTON") {
        const step = Number.parseInt(t.getAttribute("step")!, 10);
        /** @type {HTMLInputElement} */
        const input = t.parentElement!.querySelector("input")!;
        input.value = (Number.parseInt(input.value, 10) + step).toString();
        this.updateQuantity(input);
      }
    });
    this.items.addEventListener("change", async (e) => {
      this.updateQuantity(e.target as HTMLInputElement);
    });
  }
}

window.customElements.define("r-cart", RCart);
