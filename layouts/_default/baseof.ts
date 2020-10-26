import { getCLS, getFID, getLCP } from './baseof-web-vitals.es5.min.js';

function sendToAnalytics({ name, value, id }) {
  const body = JSON.stringify({
    name,
    value,
    id,
    timestamp: new Date(),
    page: window.location.pathname,
    host: window.location.hostname,
    experiment: window.experiment,
  });
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  const url = 'https://us.reima.com/api/rum';
  if (navigator.sendBeacon) navigator.sendBeacon(url, body);
  else fetch(url, { body, method: 'POST', keepalive: true });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);

/**
 * @param {MouseEvent} e
 */
const openButtonClick = (e) => {
  e.preventDefault();
  const current = /** @type {HTMLElement} */(e.currentTarget);
  const openId = current.getAttribute('openid');
  let openElement;
  if (openId === 'parent') openElement = current.parentElement;
  else openElement = document.getElementById(openId);
  openElement.classList.toggle('open');
  // if this is an overlay, freeze body
  if (openElement.classList.contains('overlay') 
    || openElement.classList.contains('modal')
    || openElement.hasAttribute('modal-opener')
  ) {
    document.body.style.overflow = 'hidden';
  }
};

document.querySelectorAll('[openid]').forEach((element) => {
  element.addEventListener('click', openButtonClick);
});

/**
 * @param {MouseEvent} e 
 */
const overlayClick = (e) => {
  // close if the overlay itself was clicked
  // or if the close button was clicked
  if (e.target === e.currentTarget || /** @type {HTMLElement} */(e.target).closest('[close]')) {
    /** @type {HTMLElement} */(e.currentTarget).closest('.open').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.querySelectorAll('.overlay').forEach((element) => {
  element.addEventListener('click', overlayClick);
});
document.querySelectorAll('.modal').forEach((element) => {
  element.addEventListener('click', overlayClick);
});

const load = async (url: string) => new Promise((resovle, reject) => {
  const script = document.createElement('script');
  script.src = url;
  script.onload = resovle;
  script.onerror = reject;
  script.type = 'module';
  document.head.appendChild(script);
});

const loaderClick = async (e) => {
  const name = e.currentTarget.getAttribute('load');
  const url = window.lazy[name];
  if (url) {
    load(url);
  } else {
    throw new Error(`No lazy dependency "${name}" found`);
  }
};

document.querySelectorAll('[load]').forEach((element) => {
  element.addEventListener('click', loaderClick);
});
