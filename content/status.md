---
layout: status
title: Site status
noindex: true
version: "2020-09-23"
---

## Changes in 2020-09-23

- New module: image grid. Although specifically designed for the baby kit product page, you can use this on any page.
- Increased margin between modules.
- New [help page](https://reima-demo.netlify.app/content-management-help) for content creators. The help page, along with this changelog page should also be visible in the forestry sidebar (if not, contact a developer).
- Improved multilingual mode: sites can now be made multilingual. This requires set-up from a developer, but after that everything should be editable for the new language (locale). See the help page for more information.

## Changes in 2020-09-22

### Product page links now editable

Now you can edit the links on the product page however you like. These are e.g. "Size Chart" and "Delivery Info" links visible between the product description and the features list. You can create either links to existing pages (these open in a new tab) or a popup modal with the desired content.

This configuration is done via the sidebar in forestry, through the item named "Product Page" or something similar. If you can't find this sidebar item, it is probably not configured for your site, in which case contact a developer. :)

### Product page feature tags now editable

Now you can edit the tags that should show as "features" on the product page. You can specify the heading, icons and description as needed. Also, the titles of the accordion (e.g. "Features" / "Materials") are now editable. Configuration as per above.

### Turn off product page reviews if needed

The reviews element on the product page can now be enabled as needed from the same "Product Page" file as described above. Review importing needs to be enabled by a developer, and if this has not been done, you probably want to disable the reviews element altogether.

## Changes in 2020-09-15

- Change footer copyright text to say Reima Oy (previously mentioned us.reima.com)
- Newsletter updated for usage across all Shopify shops, and configuration moved to "announcements"

## Changes in 2020-09-09

### Add tracking pixels via forestry.io

Now it's possible to add pixels directly via forestry. See the "Pixels" entry in the sidebar. If it's not there, it still needs to be configured (contact a developer).

## Changes in 2020-08-31

Collection page sidebar is no longer visible if there is no algolia search defined for the site.

This update includes a major rewrite in the code structure to make the code more understandable. No effects should be visible from these changes on the client end.

## Changes in 2020-08-21

### Fixed missing descriptions on collection page

Collection page descriptions are now back.

### New status page

The status page (this page!) will in the future include a log of changes, as well as a list of known bugs. Also, the theme is now more rigorously versioned, and you can see the version a site is running on on the status page.

## Changes in 2020-08-20

### New collection page design

Collection pages now use the new design, and requires that collections have been imported with the new collection importer. The layout of the new collection page is the same as that for the "interstitial" page (i.e. it uses the same code).

### Other fixes

- The `product list` module now displays all products from a collection by default. The number of products can however be limited if needed.

## Known bugs

- No breadcrumb on collection pages
- Icon button (e.g. cart icon) focus outline not according to specification
- Checkbox-based open buttons (e.g. menu icon and collection page filters) not tabbable
- Product card color dots not according to specification - dots get "squished" if there are too many of them (see toddlers collection vantti on Canada site)

## Theme demo

See the [demo site](https://reima-demo.netlify.app) for a showcase of the current theme. Note that this site might not be running the latest version of the theme. You can check this on the [status page](https://reima-demo.netlify.app/status) of the demo site
