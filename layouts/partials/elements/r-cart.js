// immediately load shopify
const loadShopify = new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = 'https://sdks.shopifycdn.com/js-buy-sdk/v2/latest/index.umd.min.js';
  script.onload = () => resolve(
    /** @type { {ShopifyBuy: any} & typeof window} */(window).ShopifyBuy,
  );
  document.body.appendChild(script);
});

const formatPrice = (price, currency) => (price
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  : null);

const addToCartEvent = (checkout, variantId) => {
  /** @type {any} */
  const {
    ga, gaProduct, fbq, fbProduct,
  } = window;
  if (ga && gaProduct) {
    // eslint-disable-next-line prefer-object-spread
    const gaProductWithVariant = Object.assign({}, gaProduct);
    const lineItem = checkout.lineItems.find((li) => li.variant.id === variantId);
    if (lineItem) {
      gaProductWithVariant.variant = lineItem.variant.title;
    }
    ga('ec:addProduct', gaProductWithVariant);
    ga('ec:setAction', 'add');
    ga('send', 'event', 'Cart', 'Added Product');
  }
  if (fbq && fbProduct) {
    fbq('track', 'AddToCart', fbProduct);
  }
};

const settings = window.site.shopify;

export default class RCart extends HTMLElement {
  constructor() {
    super();
    this.items = this.querySelector('.items');
    /** @type {HTMLAnchorElement} */
    this.checkout = this.querySelector('.checkout');
    /** @type {HTMLElement} */
    this.subtotal = this.querySelector('.summary .price');
  }

  render(checkout) {
    this.removeAttribute('loading');
    this.items.innerHTML = '';
    if (checkout) {
      /** @type {HTMLTemplateElement} */
      const template = this.querySelector('#item');
      checkout.lineItems.forEach((li) => {
        const item = /** @type {HTMLElement} */(template.content.cloneNode(true));
        if (li.variant.image) {
          const img = item.querySelector('img');
          img.src = li.variant.image.src;
          img.alt = li.variant.image.altText;
        }
        item.querySelector('h2').innerText = li.title;
        item.querySelector('h3').innerText = li.variant.title || '';
        const input = item.querySelector('input');
        input.value = li.quantity;
        input.dataset.id = li.id;
        /** @type {HTMLElement} */(item.querySelector('.price')).innerText = formatPrice(li.variant.price, window.site.currency);
        this.items.appendChild(item);
      });
      this.checkout.href = checkout.webUrl;
      this.subtotal.innerText = formatPrice(checkout.subtotalPriceV2.amount, window.site.currency);
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

  async addVariant(variantId) {
    await this.ensureClient();
    if (!this.id) {
      const checkout = await this.client.checkout.create();
      this.id = checkout.id;
    }
    const checkout = await this.client.checkout.addLineItems(this.id, [{ variantId, quantity: 1 }]);
    this.render(checkout);
    document.cookie = `X-checkout=${checkout.id}; Path=/`;
    this.closest('.overlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    addToCartEvent(checkout, variantId);
  }

  async updateQuantity(inputElement) {
    const checkout = await this.client.checkout.updateLineItems(this.id, [{
      id: inputElement.dataset.id,
      quantity: Number.parseInt(inputElement.value, 10),
    }]);
    this.render(checkout);
  }

  async connectedCallback() {
    let checkout;
    this.id = document.cookie.replace(/(?:(?:^|.*;\s*)X-checkout\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (this.id) {
      await this.ensureClient();
      checkout = await this.client.checkout.fetch(this.id);
    }
    this.render(checkout);
    this.querySelector('.items').addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      if (t.nodeName === 'BUTTON') {
        const step = Number.parseInt(t.getAttribute('step'), 10);
        /** @type {HTMLInputElement} */
        const input = t.parentElement.querySelector('input');
        input.value = (Number.parseInt(input.value, 10) + step).toString();
        this.updateQuantity(input);
      }
    });
    this.querySelector('.items').addEventListener('change', async (e) => {
      this.updateQuantity(e.target);
    });
  }
}
RCart.elementName = 'r-cart';
