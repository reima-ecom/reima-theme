if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('[loading="lazy"]').forEach((/** @type {HTMLImageElement | HTMLSourceElement} */img) => {
    /* eslint-disable no-param-reassign */
    if (img.dataset.src) img.src = img.dataset.src;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    /* eslint-enable no-param-reassign */
  });
} else {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js';
  document.body.appendChild(script);
}
