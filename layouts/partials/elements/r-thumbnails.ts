import type RCarousel from "./r-carousel.ts";

export default class RThumbnails extends HTMLElement {
  carouselScrolling = 0;
  carouselElement: RCarousel;

  constructor() {
    super();
    const element = document.querySelector<RCarousel>(this.carousel);
    if (!element) throw new Error("Thumbnails need an associated carousel");
    this.carouselElement = element;
  }

  get carousel() {
    return this.getAttribute("carousel")!;
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
  setActiveThumbnail(path: string, forceScroll?: boolean) {
    if (forceScroll || !this.carouselScrolling) {
      const thumbnailElement = this.querySelector<HTMLImageElement>(
        `img[data-path="${path}"]`
      )!;
      const activeThumbnail = this.querySelector(".active");
      if (activeThumbnail) activeThumbnail.classList.remove("active");
      thumbnailElement.classList.add("active");

      const thumbMiddle =
        thumbnailElement.offsetLeft + thumbnailElement.clientWidth / 2;
      const thumbScrollPosition = thumbMiddle - this.clientWidth / 2;
      this.scrollTo(thumbScrollPosition, 0);
    }
    // assume carousel will also start scrolling now
    if (forceScroll) this.markCarouselScroll();
  }

  connectedCallback() {
    const scrollEverything = (path: string) => {
      this.carouselElement.scrollToImage(path);
      this.markCarouselScroll();
      this.setActiveThumbnail(path, true);
    };

    this.carouselElement.addEventListener("image-changed", (e) => {
      const { path } = e.detail;
      this.setActiveThumbnail(path);
    });

    this.addEventListener("click", (e) => {
      const path = (e.target as HTMLElement).dataset.path!;
      if (path) {
        scrollEverything(path);
      }
    });
  }
}

window.customElements.define("r-thumbnails", RThumbnails);
