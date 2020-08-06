export const polyfillCustomElements = () => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@webcomponents/webcomponentsjs@2.4.3/webcomponents-bundle.js';
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

export const ensureScrollBehavior = async () => {
  if (!('scrollBehavior' in document.documentElement.style)) {
    const p = await import('smoothscroll-polyfill');
    p.polyfill();
  }
};

export const ensureIntersectionObserver = async () => {
  if (!window.IntersectionObserver) {
    await import('intersection-observer');
  }
};

export const ensureScopeSelector = async () => {
  try {
    document.querySelector(':scope *');
  } catch (error) {
    await import('element-qsa-scope');
  }
};
