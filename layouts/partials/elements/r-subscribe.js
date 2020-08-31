const newsletterForm = document.forms.namedItem('subscribe');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
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
    } else {
      const msg = await resp.text();
      /** @type {HTMLElement} */(f.querySelector('[failure]')).innerText = msg;
    }
  });
  // show the whole form when focusing email input
  newsletterForm.querySelector('input[name=email]').addEventListener('focus', () => {
    newsletterForm.setAttribute('consent', '');
  });
}

export default null;
