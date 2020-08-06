import dynamicImportPolyfill from 'dynamic-import-polyfill';
import { getCLS, getFID, getLCP } from 'web-vitals';
import loadElement from './helpers/load-element.js';

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

dynamicImportPolyfill.initialize({ modulePath: '/' });

if (document.querySelector('r-carousel')) loadElement('r-carousel');
if (document.querySelector('r-thumbnails')) loadElement('r-thumbnails');
// eslint-disable-next-line no-unused-expressions
if (document.forms.namedItem('subscribe')) import('./partials/elements/r-subscribe.js');

const openButtonClick = (e) => {
  e.preventDefault();
  const openId = e.currentTarget.getAttribute('openid');
  let openElement;
  if (openId === 'parent') openElement = e.currentTarget.parentElement;
  else openElement = document.getElementById(openId);
  openElement.classList.toggle('open');
  // if this is an overlay, freeze body
  if (openElement.classList.contains('overlay') || openElement.classList.contains('modal')) {
    document.body.style.overflow = 'hidden';
  }
};

document.querySelectorAll('[openid]').forEach((element) => {
  element.addEventListener('click', openButtonClick);
});

const overlayClick = (e) => {
  // close if the overlay itself was clicked
  // or if the close button was clicked
  if (e.target === e.currentTarget || e.target.closest('[close]')) {
    /** @type {HTMLElement} */(e.currentTarget).classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.querySelectorAll('.overlay').forEach((element) => {
  element.addEventListener('click', overlayClick);
});
document.querySelectorAll('.modal').forEach((element) => {
  element.addEventListener('click', overlayClick);
});

const loaderClick = async (e) => {
  const name = e.currentTarget.getAttribute('load');
  if (name.startsWith('r-')) {
    loadElement(name);
  } else {
    throw new Error(`No lazy dependency "${name}" found`);
  }
};

document.querySelectorAll('[load]').forEach((element) => {
  element.addEventListener('click', loaderClick);
});
