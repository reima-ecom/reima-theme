import { ensureScrollBehavior, ensureIntersectionObserver, ensureScopeSelector } from '../helpers/load-polyfill.js';
import getElementIndex from '../helpers/element-index.js';

const scrollNext = (element) => {
  if ((element.scrollLeft + element.clientWidth - element.scrollWidth) < -10) {
    element.scrollBy({ left: element.clientWidth, behavior: 'smooth' });
  } else {
    element.scrollTo({ left: 0, behavior: 'smooth' });
  }
};

export default class RCarousel extends HTMLElement {
  constructor() {
    super();
    this.slider = this.firstElementChild;
  }

  get autoscroll() {
    return this.hasAttribute('autoscroll');
  }

  get thumbnails() {
    return this.getAttribute('thumbnails');
  }

  scrollToImage(imgIndex) {
    const imageElement = /** @type {HTMLElement} */ (this.slider.children.item(imgIndex));
    const scrollPositionX = imageElement.offsetLeft;
    this.slider.scrollTo({ left: scrollPositionX, behavior: 'smooth' });
  }

  async connectedCallback() {
    if (this.autoscroll) {
      this.autoScroller = window.setInterval(() => {
        scrollNext(this.slider);
      }, 10000);
    }

    // we need a polyfill for the :scope selector on old Edge
    await ensureScopeSelector();

    const carouselButtons = this.querySelectorAll(':scope > button');
    if (carouselButtons) {
      // polyfill smooth scroll behavior
      ensureScrollBehavior();

      /**
       * @param {MouseEvent} e
       */
      const btnClick = (e) => {
        const btn = /** @type {HTMLElement} */(e.target);
        if (btn.hasAttribute('prev')) {
          if (this.slider.scrollLeft > 10) {
            this.slider.scrollBy({ left: -this.slider.clientWidth, behavior: 'smooth' });
          } else {
            this.slider.scrollTo({ left: this.slider.scrollWidth - this.slider.clientWidth, behavior: 'smooth' });
          }
        } else if (btn.hasAttribute('next')) {
          scrollNext(this.slider);
        }
        if (this.autoScroller) window.clearInterval(this.autoScroller);
      };
      carouselButtons.forEach((element) => {
        element.addEventListener('click', btnClick);
      });
    }

    if (this.thumbnails) {
      /** @type {import('./r-thumbnails').default} */
      this.thumbnailsElement = document.querySelector(this.thumbnails);

      await ensureIntersectionObserver();

      const observer = new IntersectionObserver((entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          const index = getElementIndex(e.target);
          this.thumbnailsElement.setActiveThumbnail(index);
        }
      }, {
        root: this.slider,
        threshold: 0.6,
      });

      this.querySelectorAll(':scope > div > *').forEach(async (el) => {
        observer.observe(el);
      });
    }
  }
}
RCarousel.elementName = 'r-carousel';
