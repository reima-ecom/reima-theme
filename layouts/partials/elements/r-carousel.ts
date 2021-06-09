/// <reference lib="dom" />

const polyfill = () => {
  if (
    !("scrollBehavior" in document.documentElement.style) ||
    !window.IntersectionObserver
  ) {
    // load polyfills via polyfill.io
    return new Promise((resovle, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://polyfill.io/v3/polyfill.min.js?features=Element.prototype.scrollBy%2Csmoothscroll%2CIntersectionObserver";
      script.onload = resovle;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return Promise.resolve();
};

const scrollNext = (element: HTMLElement) => {
  if (element.scrollLeft + element.clientWidth - element.scrollWidth < -10) {
    element.scrollBy({ left: element.clientWidth, behavior: "smooth" });
  } else {
    element.scrollTo({ left: 0, behavior: "smooth" });
  }
};

export default class RCarousel extends HTMLElement {
  /** Overflowing and scrollable element with "slides" */
  slider!: HTMLElement;

  get lastVariantImagePath() {
    return this.dataset.lastVariantImagePath || "";
  }

  set lastVariantImagePath(path: string) {
    this.dataset.lastVariantImagePath = path;
  }

  scrollToImage(path: string) {
    const imageElement = this.slider.querySelector<HTMLImageElement>(
      `img[data-path="${path}"]`,
    )!;
    const scrollPositionX = imageElement.offsetLeft;
    this.slider.scrollTo({ left: scrollPositionX, behavior: "smooth" });
  }

  connectedCallback() {
    this.slider = this.firstElementChild as HTMLElement;

    // add event listeners for next and prev buttons
    const carouselButtons = this.querySelectorAll("button[next], button[prev]");
    if (carouselButtons) {
      const btnClick = (e: Event) => {
        const btn = e.target as HTMLElement;
        if (btn.hasAttribute("prev")) {
          if (this.slider.scrollLeft > 10) {
            this.slider.scrollBy({
              left: -this.slider.clientWidth,
              behavior: "smooth",
            });
          } else {
            this.slider.scrollTo({
              left: this.slider.scrollWidth - this.slider.clientWidth,
              behavior: "smooth",
            });
          }
        } else if (btn.hasAttribute("next")) {
          scrollNext(this.slider);
        }
      };
      carouselButtons.forEach((element) => {
        element.addEventListener("click", btnClick);
      });
    }

    // create observer that fires image change event
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          const path = (e.target as HTMLElement).dataset.path!;
          this.dispatchEvent(
            new CustomEvent("image-changed", { detail: { path } }),
          );
        }
      },
      {
        root: this.slider,
        threshold: 0.6,
      },
    );
    this.querySelectorAll(":scope > div > *").forEach((el) => {
      observer.observe(el);
    });
  }
}

polyfill().then(() => {
  window.customElements.define("r-carousel", RCarousel);
}).catch(console.error);
