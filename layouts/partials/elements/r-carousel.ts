import RThumbnails from './r-thumbnails'
import getElementIndex from '../helpers/element-index.js';

const polyfill = async () => {
  if (
    !('scrollBehavior' in document.documentElement.style) ||
    !window.IntersectionObserver
  ) {
    // load polyfills via polyfill.io
    return new Promise((resovle, reject) => {
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=Element.prototype.scrollBy%2Csmoothscroll%2CIntersectionObserver';
      script.onload = resovle;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  // implicit void return
};

const scrollNext = (element) => {
  if (element.scrollLeft + element.clientWidth - element.scrollWidth < -10) {
    element.scrollBy({ left: element.clientWidth, behavior: 'smooth' });
  } else {
    element.scrollTo({ left: 0, behavior: 'smooth' });
  }
};

export default class RCarousel extends HTMLElement {
  slider: Element;
  autoScroller: number;
  thumbnailsElement: RThumbnails;

  get autoscroll() {
    return this.hasAttribute('autoscroll');
  }

  get thumbnails() {
    return this.getAttribute('thumbnails');
  }

  scrollToImage(imgIndex) {
    const imageElement = this.slider.children.item(imgIndex) as HTMLElement;
    const scrollPositionX = imageElement.offsetLeft;
    this.slider.scrollTo({ left: scrollPositionX, behavior: 'smooth' });
  }

  async connectedCallback() {
    this.slider = this.firstElementChild;

    if (this.autoscroll) {
      this.autoScroller = window.setInterval(() => {
        scrollNext(this.slider);
      }, 10000);
    }

    const carouselButtons = this.querySelectorAll('button[next], button[prev]');
    if (carouselButtons) {
      /**
       * @param {MouseEvent} e
       */
      const btnClick = (e: MouseEvent) => {
        const btn = e.target as HTMLElement;
        if (btn.hasAttribute('prev')) {
          if (this.slider.scrollLeft > 10) {
            this.slider.scrollBy({
              left: -this.slider.clientWidth,
              behavior: 'smooth',
            });
          } else {
            this.slider.scrollTo({
              left: this.slider.scrollWidth - this.slider.clientWidth,
              behavior: 'smooth',
            });
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
      this.thumbnailsElement = document.querySelector(this.thumbnails);

      const observer = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e.isIntersecting) {
            const index = getElementIndex(e.target);
            this.thumbnailsElement.setActiveThumbnail(index);
          }
        },
        {
          root: this.slider,
          threshold: 0.6,
        }
      );

      this.querySelectorAll(':scope > div > *').forEach(async (el) => {
        observer.observe(el);
      });
    }
  }
}

polyfill().then(() => {
  window.customElements.define('r-carousel', RCarousel);
}).catch(console.error);
