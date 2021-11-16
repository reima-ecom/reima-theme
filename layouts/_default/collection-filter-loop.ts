/// <reference lib="dom"/>

import type { FilterQuery } from "../partials/elements/search-domain.ts";
import { createFilterer } from "../partials/elements/search-loop54.ts";

const filterQueryFromForm = (form: HTMLFormElement): FilterQuery => {
  const filters: { [attribute: string]: string[] } = {};
  const formData = new FormData(form);
  //@ts-ignore Deno type for FormData is wrong
  for (const [key, value] of formData) {
    if (key.startsWith("filtering.")) {
      const keyName = key.replace("filtering.", "Attributes_");
      filters[keyName] ??= [];
      filters[keyName].push(value);
    }
  }
  const result = Object.entries(filters).map(([attribute, selected]) => ({
    attribute,
    selected,
  }));
  return result;
};

const createFormFilterer = (form: HTMLFormElement) => {
  // this is the loop54 API url
  const baseUrl = form.getAttribute("loop-url");
  if (!baseUrl) throw new Error("Need loop-url attribute");

  // these are the product list `<ul>` elements to update when filtering with this form
  let productListSelector = "ul[data-collection]";
  const formCollectionAttribute = form.getAttribute("collection");
  if (formCollectionAttribute && formCollectionAttribute !== "*") {
    productListSelector = `ul[data-collection="${formCollectionAttribute}"]`;
  }
  const productListElements: NodeListOf<HTMLUListElement> = document
    .querySelectorAll<HTMLUListElement>(productListSelector);

  return (_event: Event) => {
    const filter = filterQueryFromForm(form);

    // filter based on id array
    productListElements.forEach(async (ul) => {
      // the collection this list is showing
      const collection = ul.dataset.collection;

      // search for products
      const results = await createFilterer(baseUrl)(collection)(filter);

      // create array of hit handles
      const filteredIds: string[] = results.map((el) => el.id);

      ul.querySelectorAll("li").forEach((li) => {
        const productId = li.getAttribute("product-id");
        if (!productId) {
          throw new Error("`product-id` not set on `<li>` element");
        }
        if (filteredIds.includes(productId)) {
          li.style.display = "block";
        } else {
          li.style.display = "none";
        }
      });
    });
  };
};

const filtersForm = document.querySelectorAll<HTMLFormElement>(
  "form.filter-list",
);
if (filtersForm) {
  filtersForm.forEach((formElement) => {
    const filterAndRender = createFormFilterer(formElement);
    formElement.addEventListener("change", (e) => {
      const element = e.target as HTMLInputElement;

      // open if this was an opening checkbox
      if (element.name === "open-filters") {
        element.parentElement!.parentElement!.parentElement!.classList.toggle(
          "active",
        );
      }

      // if this is an element opener checkbox, bail out
      if (element.name.startsWith("open-")) return;

      filterAndRender(e);
    });

    formElement.addEventListener("reset", filterAndRender);
  });
}

export {};
