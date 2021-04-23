import RCart from "./elements/r-cart.ts";
import RCarousel from "./elements/r-carousel.ts";
import RThumbnails from "./elements/r-thumbnails.ts";

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
  imageIndex: number;
  options: Options;
};

type Options = {
  [option: string]: string;
};

const form = document.querySelector<HTMLFormElement>("form#product-form")!;
const cartButton = form.querySelector("button")!;
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
  const { name, value } = e.currentTarget as HTMLInputElement;
  const isColor = (e.currentTarget as HTMLElement).closest(
    ".selections--Color",
  );
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
    // scroll to variant image if color change
    if (isColor) {
      document.querySelector<RCarousel>("r-carousel")!.scrollToImage(
        variant.imageIndex,
      );
      document.querySelector<RThumbnails>("r-thumbnails")!.setActiveThumbnail(
        variant.imageIndex,
        true,
      );
    }
  }
};

radioBoxes.forEach((node) => {
  node.addEventListener("change", inputChange);
});

// open reviews when the review link is clicked
const reviewsLink = document.querySelector('[href="#reviews"]');
const openReviews = () => {
  document.querySelectorAll('#acc-reviews, #tab-reviews').forEach((element) => {
    (element as HTMLInputElement).checked = true;
  });
}

if (reviewsLink) {
  reviewsLink.addEventListener('click', () => {
    openReviews();
  });
}

// open reviews if initial load is for reviews
if (location.hash === '#reviews') openReviews();
