# Custom elements

This folder contains custom elements (i.e. "web components") that can be used on every site.

The folder should be mounted as `layouts/partials/elements` as well as `assets/elements`. 

JS should be built into the `dist` folder. The plan is to build using [deno](https://deno.land).

Then, you can include the element code as:

- html: `{{partial "elements/[elementname]"}}`
- css: `{{$.Scratch.Add "css-async" "elements/[elementname]"}}`
- js: `{{$.Scratch.Add "js-async" "elements/[elementname]"}}`
