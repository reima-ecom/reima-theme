/// <reference types="../../../globals.d.ts" />

type Cart = {
  lineItems: LineItem[];
  subtotalPriceV2: { amount: number };
  webUrl: string;
};

type LineItem = {
  variant: {
    id: string;
    product: { id: string };
    price: string;
    title: string;
  };
  quantity: number;
};

// immediately load shopify
const loadShopify = new Promise<any>((resolve) => {
  const script = document.createElement("script");
  script.src =
    "https://sdks.shopifycdn.com/js-buy-sdk/v2/latest/index.umd.min.js";
  script.onload = () =>
    resolve(
      (window as any).ShopifyBuy,
    );
  document.body.appendChild(script);
});

const formatPrice = (
  price: number,
  currency: string,
) => (price
  ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    price,
  )
  : "");

const storefrontIdToLegacy = (id: string) => atob(id).split("/").pop();

const settings = window.site.shopify;

export default class RCart extends HTMLElement {
  items!: HTMLElement;
  subtotal!: HTMLElement;
  checkout!: HTMLAnchorElement;
  client: any;

  static get observedAttributes() {
    return ["open"];
  }

  get checkoutId() {
    return this.getAttribute("checkout-id") || "";
  }

  set checkoutId(val: string) {
    this.setAttribute("checkout-id", val);
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

  render(checkout: Cart) {
    this.items.innerHTML = "";
    if (checkout) {
      /** @type {HTMLTemplateElement} */
      const template = this.querySelector<HTMLTemplateElement>("#item");
      checkout.lineItems.forEach((li: any) => {
        const item = template?.content.cloneNode(true) as HTMLElement;
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
        input.value = li.quantity;
        input.dataset.id = li.id;
        item.querySelector<HTMLElement>(".price")!.innerText = formatPrice(
          li.variant.price,
          window.site.currency,
        );
        this.items.appendChild(item);
      });
      this.checkout.href = checkout.webUrl;
      this.subtotal.innerText = formatPrice(
        checkout.subtotalPriceV2.amount,
        window.site.currency,
      );
      // update dot count
      this.itemCount = checkout.lineItems.reduce(
        (count: number, li: LineItem) => count + li.quantity,
        0,
      );
    }
  }

  async ensureClient() {
    if (this.client) return;
    const ShopifyBuy = await loadShopify;
    this.client = ShopifyBuy.buildClient({
      domain: `${settings.store}.myshopify.com`,
      storefrontAccessToken: settings.token,
    });
  }

  async addVariant(variantId: string) {
    await this.ensureClient();
    if (!this.checkoutId) {
      const checkout = await this.client.checkout.create();
      this.checkoutId = checkout.id.toString();
    }
    const checkout = await this.client.checkout.addLineItems(
      this.checkoutId,
      [{ variantId, quantity: 1 }],
    );
    this.render(checkout);
    document.cookie = `X-checkout=${checkout.id}; Path=/`;
    this.open = true;

    // new way to dispatch cart add event, will bubble to document
    const basket = {
      id: checkout.id,
      url: checkout.webUrl,
      total: Number.parseFloat(checkout.totalPrice),
      currency: checkout.currencyCode,
      items: checkout.lineItems.map((li: LineItem) => ({
        productId: li.variant.product.id,
        variantId: li.variant.id,
        quantity: li.quantity,
        price: Number.parseFloat(li.variant.price),
        title: li.variant.title,
        productIdLegacy: storefrontIdToLegacy(li.variant.product.id),
        variantIdLegacy: storefrontIdToLegacy(li.variant.id),
      })),
    };
    this.dispatchEvent(
      new CustomEvent("cart-add", {
        bubbles: true,
        detail: { variantId, checkout: basket },
      }),
    );
  }

  async updateQuantity(inputElement: HTMLInputElement) {
    const checkout = await this.client.checkout.updateLineItems(
      this.checkoutId,
      [{
        id: inputElement.dataset.id,
        quantity: Number.parseInt(inputElement.value, 10),
      }],
    );
    this.render(checkout);
  }

  async loadCheckout() {
    let checkout;
    if (this.checkoutId) {
      await this.ensureClient();
      checkout = await this.client.checkout.fetch(this.checkoutId);
    }
    this.render(checkout);
    this.loading = false;
  }

  async connectedCallback() {
    this.checkoutId = document.cookie.replace(
      /(?:(?:^|.*;\s*)X-checkout\s*=\s*([^;]*).*$)|^.*$/,
      "$1",
    );

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
