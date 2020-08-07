const polyfillCustomElements = () => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@webcomponents/webcomponentsjs@2.4.3/webcomponents-bundle.js';
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

const ensureScrollBehavior = async () => {
  if (!('scrollBehavior' in document.documentElement.style)) {
    const p = await __import__('./smoothscroll-aa583bfd.js').then(function (n) { return n.s; });
    p.polyfill();
  }
};

const ensureIntersectionObserver = async () => {
  if (!window.IntersectionObserver) {
    await __import__('./intersection-observer-bbe41965.js');
  }
};

const ensureScopeSelector = async () => {
  try {
    document.querySelector(':scope *');
  } catch (error) {
    await __import__('./index-796c6b86.js');
  }
};

export { ensureIntersectionObserver, ensureScopeSelector, ensureScrollBehavior, polyfillCustomElements };
