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
  const result = Object.entries(filters).map(([attribute, selected]) => ({ attribute, selected }));
  return result;
};

const createFormFilterer = (form: HTMLFormElement) => {
  // this is the loop54 API url
  const baseUrl = form.getAttribute("loop-url");
  if (!baseUrl) throw new Error("Need loop-url attribute");

  // these are the product list `<ul>` elements to update when filtering with this form
  const _productListElements: NodeListOf<HTMLUListElement> = document
    .querySelectorAll<HTMLUListElement>("ul[data-collection]");

  return async (event: Event) => {
    // don't know what this is, but this use case is not supported
    const { collection } = (event.target as HTMLInputElement).dataset;
    if (collection && collection !== "*") throw new Error("Not implemented");

    const filter = filterQueryFromForm(form);

    // search for products
    const results = await createFilterer(baseUrl)(filter);

    // create array of hit handles
    const _hitHandles: string[] = results.map((el) => el.handle);

    // show handles that match filters
    throw new Error("Not implemented");
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
