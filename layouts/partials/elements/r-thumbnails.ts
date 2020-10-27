import RCarousel from './r-carousel.ts'
import getElementIndex from '../helpers/element-index.ts';

export default class RThumbnails extends HTMLElement {
  carouselScrolling: number = 0;

  get carousel() {
    return this.getAttribute('carousel')!;
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
  setActiveThumbnail(index: number, forceScroll?: boolean) {
    if (forceScroll || !this.carouselScrolling) {
      const thumbnail = this.querySelector('.active');
      if (thumbnail) thumbnail.classList.remove('active');
      this.children.item(index)!.classList.add('active');

      const thumbnailElement = this.children.item(index) as HTMLElement;
      const thumbMiddle = thumbnailElement.offsetLeft + thumbnailElement.clientWidth / 2;
      const thumbScrollPosition = thumbMiddle - this.clientWidth / 2;
      this.scrollTo(thumbScrollPosition, 0);
    }
    // assume carousel will also start scrolling now
    if (forceScroll) this.markCarouselScroll();
  }

  connectedCallback() {
    const scrollEverything = (index: number) => {
      const carousel = document.querySelector<RCarousel>(this.carousel)!;
      carousel.scrollToImage(index);
      this.markCarouselScroll();
      this.setActiveThumbnail(index, true);
    };

    this.addEventListener('click', (e) => {
      const index = getElementIndex((e.target as HTMLElement).closest('picture')!);
      scrollEverything(index);
    });
  }
}

window.customElements.define('r-thumbnails', RThumbnails);
