// This is a proof of concept, and as such not transformed to TS yet

const query = async (graphQl) => {
  const resp = await fetch('https://reima-us.myshopify.com/api/2020-01/graphql', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': 'd2990d8e29e763239f8e8ff6cefc9ebe',
    },
    method: 'POST',
    body: JSON.stringify({ query: graphQl }),
  });
  if (!resp.ok) throw new Error('Could not log in');
  return resp.json();
};

class RAccount extends HTMLElement {
  static get observedAttributes() {
    return ['status'];
  }

  get status() {
    return this.getAttribute('status');
  }

  set status(val) {
    this.setAttribute('status', val);
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'status' && newValue === 'info') {
      const { data } = await query(`
      {
        customer(customerAccessToken: "${this.id}") {
          displayName
          email
        }
      }
      `);
      /** @type {HTMLElement} */(this.querySelector('[display-name]')).innerText = data.customer.displayName;
      /** @type {HTMLElement} */(this.querySelector('[display-email]')).innerText = data.customer.email;
    }
  }

  connectedCallback() {
    this.id = document.cookie.replace(/(?:(?:^|.*;\s*)X-account-token\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (this.id) this.status = 'info';
    else this.status = 'login';
    // wire up login form
    this.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = /** @type {HTMLElement} */(e.target);
      const submitButton = /** @type {HTMLButtonElement} */(t.querySelector('form [type=submit]'));
      submitButton.disabled = true;
      const email = /** @type {HTMLInputElement} */(t.querySelector('[name=email]')).value;
      const password = /** @type {HTMLInputElement} */(t.querySelector('[name=pass]')).value;
      const { data } = await query(`
      mutation {
        customerAccessTokenCreate(input: {email: "${email}", password: "${password}"}) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
      `);
      if (data.customerAccessTokenCreate.customerAccessToken) {
        this.id = data.customerAccessTokenCreate.customerAccessToken.accessToken;
        document.cookie = `X-account-token=${this.id}; Path=/`;
        this.status = 'info';
      }
      submitButton.disabled = false;
    });
    this.querySelector('button[logout]').addEventListener('click', () => {
      document.cookie = 'X-account-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      this.id = '';
      this.status = 'login';
    });
  }
}
RAccount.elementName = 'r-account';

window.customElements.define(RAccount.elementName, RAccount);
