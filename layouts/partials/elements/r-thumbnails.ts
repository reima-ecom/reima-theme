import RCarousel from './r-carousel.ts'

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
      const thumbnailElement = this.querySelector<HTMLImageElement>(`img:nth-of-type(${index + 1})`)!;
      const activeThumbnail = this.querySelector('.active');
      if (activeThumbnail) activeThumbnail.classList.remove('active');
      thumbnailElement.classList.add('active');

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
      const index = Number.parseInt((e.target as HTMLElement).dataset.index!);
      scrollEverything(index);
    });
  }
}

window.customElements.define('r-thumbnails', RThumbnails);
