/// <reference lib="dom" />

if ("loading" in HTMLImageElement.prototype) {
  document.querySelectorAll<HTMLImageElement | HTMLSourceElement>(
    'img[loading="lazy"],source[data-srcset]',
  ).forEach((element) => {
    /* eslint-disable no-param-reassign */
    if (element.dataset.src) element.src = element.dataset.src;
    if (element.dataset.srcset) element.srcset = element.dataset.srcset;
    /* eslint-enable no-param-reassign */
  });
} else {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js";
  document.body.appendChild(script);
}
