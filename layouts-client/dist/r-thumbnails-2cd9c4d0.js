import { g as getElementIndex } from './element-index-4cdf445e.js';

class RThumbnails extends HTMLElement {
  constructor() {
    super();
    this.carouselScrolling = 0;
  }

  get carousel() {
    return this.getAttribute('carousel');
  }

  markCarouselScroll() {
    this.carouselScrolling += 1;
    setTimeout(() => {
      this.carouselScrolling -= 1;
    }, 2000);
  }

  /**
   * @param {number} index Thumbnail image index to set as active
   * @param {boolean} [forceScroll] Force scroll even if carousel might be scrolling
   */
  setActiveThumbnail(index, forceScroll) {
    if (forceScroll || !this.carouselScrolling) {
      const thumbnail = this.querySelector('.active');
      if (thumbnail) thumbnail.classList.remove('active');
      this.children.item(index).classList.add('active');

      const thumbnailElement = /** @type {HTMLElement} */ (this.children.item(index));
      const thumbMiddle = thumbnailElement.offsetLeft + thumbnailElement.clientWidth / 2;
      const thumbScrollPosition = thumbMiddle - this.clientWidth / 2;
      this.scrollTo(thumbScrollPosition, 0);
    }
    // assume carousel will also start scrolling now
    if (forceScroll) this.markCarouselScroll();
  }

  connectedCallback() {
    const scrollEverything = (index) => {
      /** @type {import('./r-carousel').default} */
      const carousel = document.querySelector(this.carousel);
      carousel.scrollToImage(index);
      this.markCarouselScroll();
      this.setActiveThumbnail(index, true);
    };

    this.addEventListener('click', (e) => {
      const index = getElementIndex(/** @type {HTMLElement} */(e.target).closest('picture'));
      scrollEverything(index);
    });
  }
}
RThumbnails.elementName = 'r-thumbnails';

export default RThumbnails;
