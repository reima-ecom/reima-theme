const newsletterSubmit = async (e) => {
  e.preventDefault();
  const f = /** @type {HTMLFormElement} */(e.target);
  const data = {
    email: /** @type {HTMLInputElement} */(f.querySelector('[name=email]')).value,
    tags: /** @type {HTMLInputElement} */(f.querySelector('[name=tags]')).value,
    consent: /** @type {HTMLInputElement} */(f.querySelector('[name=consent]')).checked,
    marketing: /** @type {HTMLInputElement} */(f.querySelector('[name=marketing]')).checked,
  };
  const resp = await fetch(f.action, {
    method: 'post',
    body: JSON.stringify(data),
  });
  if (resp.ok) {
    f.setAttribute('success', '');
    f.dispatchEvent(new CustomEvent('subscribe', { bubbles: true, detail: data }));
  } else {
    const msg = await resp.text();
    /** @type {HTMLElement} */(f.querySelector('[failure]')).innerText = msg;
  }
};

/**
 * @param {FocusEvent} e
 */
const emailFocus = (e) => {
  /** @type {HTMLInputElement} */(e.target).form.setAttribute('consent', '');
};

class RNewsletter extends HTMLElement {
  connectedCallback() {
    this.querySelector('form').addEventListener('submit', newsletterSubmit);
    this.querySelector('input[name=email]').addEventListener('focus', emailFocus);
  }
}

window.customElements.define('r-newsletter', RNewsletter);

export default RNewsletter;
