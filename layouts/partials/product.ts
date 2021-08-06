import type RCart from "./elements/r-cart.ts";
import type RCarousel from "./elements/r-carousel.ts";

declare global {
  interface Window {
    selectedOptions: {
      [option: string]: string;
    };
    variants: Variant[];
    priceTemplate: string;
  }
}

type Variant = {
  id: string;
  available: boolean;
  price: number;
  priceFormatted: string;
  compareAtPrice: number;
  compareAtPriceFormatted: string;
  imagePath: string;
  options: Options;
};

type Options = {
  [option: string]: string;
};

const form = document.querySelector<HTMLFormElement>("form#product-form")!;
const cartButton = form.querySelector("button[type=submit]")!;
const radioBoxes = form.querySelectorAll<HTMLInputElement>(
  "input[type=radio]",
)!;
const { selectedOptions, variants } = window;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetForm = e.target as HTMLButtonElement;
  const btn = targetForm.querySelector<HTMLButtonElement>("[type=submit]")!;
  btn.disabled = true;
  try {
    const { variant } = targetForm.dataset;
    const cart = document.querySelector<RCart>("r-cart")!;
    await cart.addVariant(variant!);
  } finally {
    btn.disabled = false;
  }
});

const renderPrice = (price: string) => {
  const { priceTemplate } = window;
  return priceTemplate.replace("PRICE", price);
};

const getVariant = (options: Options) =>
  variants.find((v) => {
    if (Object.keys(v.options).length !== Object.keys(options).length) {
      return false;
    }
    return Object.keys(v.options).every((k) => options[k] === v.options[k]);
  });

const inputChange = (e: Event) => {
  const previousVariant = getVariant(selectedOptions);
  const { name, value } = e.currentTarget as HTMLInputElement;
  selectedOptions[name] = value;
  // check if available
  const variant = getVariant(selectedOptions);
  if (!variant) {
    cartButton.innerText = cartButton.dataset.na!;
    cartButton.disabled = true;
  } else if (!variant.available) {
    cartButton.innerText = cartButton.dataset.sold!;
    cartButton.disabled = true;
  } else {
    cartButton.innerText = cartButton.dataset.add!;
    cartButton.disabled = false;
    form.dataset.variant = variant.id;
  }
  // update availability
  radioBoxes.forEach((radio) => {
    const thisSelection = Object.assign(
      {},
      selectedOptions,
      { [radio.name]: radio.value },
    );
    const thisVariant = getVariant(thisSelection);
    const thisLabel = document.querySelector(`label[for="${radio.id}"]`)!;
    if (thisVariant && thisVariant.available) {
      thisLabel.classList.remove("unavailable");
    } else thisLabel.classList.add("unavailable");
  });
  // set selected span text
  document.getElementById(`selected-${name}`)!.innerText = value;
  if (variant) {
    // update prices
    const priceElement = document.querySelector<HTMLElement>(".price--actual")!;
    priceElement.innerText = renderPrice(variant.priceFormatted);
    if (variant.compareAtPrice > variant.price) {
      priceElement.classList.add("price--sale");
    } else priceElement.classList.remove("price--sale");
    document.querySelector<HTMLElement>(".price--was")!.innerText =
      variant.compareAtPriceFormatted
        ? renderPrice(variant.compareAtPriceFormatted)
        : "";
    // change product image if needed
    if (previousVariant && previousVariant.imagePath !== variant.imagePath) {
      const carouselSelector = form.dataset.productImages;
      if (!carouselSelector) throw new Error("No carousel specified");
      const carousel = document.querySelector<RCarousel>(carouselSelector);
      if (!carousel) throw new Error("Carousel not found");
      carousel.scrollToImage(variant.imagePath);
    }
    // send variant change event (for analytics)
    document.dispatchEvent(
      new CustomEvent("variant-changed", {
        detail: variant,
        bubbles: true,
      }),
    );
  }
};

radioBoxes.forEach((node) => {
  node.addEventListener("change", inputChange);
});

// open reviews when the review link is clicked
const reviewsLink = document.querySelector('[href="#reviews"]');
const openReviews = () => {
  document.querySelectorAll("#acc-reviews, #tab-reviews").forEach((element) => {
    (element as HTMLInputElement).checked = true;
  });
};

if (reviewsLink) {
  reviewsLink.addEventListener("click", () => {
    openReviews();
  });
}

// open reviews if initial load is for reviews
if (location.hash === "#reviews") openReviews();

// see if we're trying to link to a specific variant
if (window.location.search) {
  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    if (window.selectedOptions[key]) {
      const input = document.querySelector<HTMLInputElement>(
        `input[name="${key}"][value="${value}"]`,
      );
      if (input) {
        console.log(input);
        input.checked = true;
        input.dispatchEvent(new InputEvent("change"));
      }
    }
  });
}
