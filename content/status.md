---
layout: status
title: Site status
noindex: true
version: "2020-09-15"
---

## Changes in 2020-09-15

- Change footer copyright text to say Reima Oy (previously mentioned us.reima.com)
- Newsletter updated for usage across all Shopify shops, and configuration moved to "announcements"

## Changes in 2020-09-09

**Add tracking pixels via forestry.io**

Now it's possible to add pixels directly via forestry. See the "Pixels" entry in the sidebar. If it's not there, it still needs to be configured (contact a developer).

## Changes in 2020-08-31

Collection page sidebar is no longer visible if there is no algolia search defined for the site.

This update includes a major rewrite in the code structure to make the code more understandable. No effects should be visible from these changes on the client end.

## Changes in 2020-08-21

**Fixed missing descriptions on collection page**

Collection page descriptions are now back.

**New status page**

The status page (this page!) will in the future include a log of changes, as well as a list of known bugs. Also, the theme is now more rigorously versioned, and you can see the version a site is running on on the status page.

## Changes in 2020-08-20

**New collection page design**

Collection pages now use the new design, and requires that collections have been imported with the new collection importer. The layout of the new collection page is the same as that for the "interstitial" page (i.e. it uses the same code).

**Other fixes**

- The `product list` module now displays all products from a collection by default. The number of products can however be limited if needed.

## Known bugs

- No breadcrumb on collection pages
- Icon button (e.g. cart icon) focus outline not according to specification
- Checkbox-based open buttons (e.g. menu icon and collection page filters) not tabbable
- Product card color dots not according to specification - dots get "squished" if there are too many of them (see toddlers collection vantti on Canada site)

## Theme demo

See the [demo site](https://reima-demo.netlify.app) for a showcase of the current theme. Note that this site might not be running the latest version of the theme. You can check this on the [status page](https://reima-demo.netlify.app/status) of the demo site
