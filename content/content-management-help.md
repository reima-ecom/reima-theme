---
layout: page
noindex: true
---

# Content Management Help

See the [demo site](https://reima-demo.netlify.app) for a showcase of the theme and the modules you can use. Under "Modules" you will find a showcase of the different modules and how they can be configured. Forestry should include enough help descriptions for the module fields to achieve the showcased designs. If you have any questions, though, contact a developer for details! 😊

This document describes content management in general, as well as specific information on the content structure where needed.

## Site publishing

You should be able to publish your site by going to `https://your-site-url/status`. Currently the publishing process refreshes everything, including products from Shopify, so it can take a while (up to about 20 minutes as of writing).

## Site preview

Remember that you can see a preview of your site by clicking the eye icon in the upper-right corner in forestry (visible when editing a page). This allows you to view both draft content, as well as unsaved edits without publishing the whole site. The preview server might take a while to start up if not used in a while, so be patient when you're getting started for the day.

## Page URLs

Pages receive their URL based on the filename and possible parent folders. So based on the page's location within the `Pages` section will determine its url. Here are some examples:

| Page path | URL |
|-----------|-----|
| /\_index.md | / |
| /help.md | /help |
| /tips/index.md | /tips |
| /tips/sizing.md | /tips/sizing |

*Note that the home page should be named `_index.md` (with the underscore).*

You can rename a page when you are *editing that page*. When a page is open in forestry, you can click the ellipsis in the top right corner and select "rename". Note that you cannot move pages between folders - if you need to move a page, contact a developer.

## Product page

There should be an item in the forestry sidebar named "Product Page Settings" (or something similar) where you can edit product page specific things. If you can't find this sidebar item, it is probably not configured for your site, in which case contact a developer. :)

### Links below the description

These are e.g. "Size Chart" and "Delivery Info" links visible between the product description and the features list. You can create either links to existing pages (these open in a new tab) or a popup modal with the desired content.

### Feature icons and descriptions

Edit the tags (i.e. product tags in Shopify) that should show as "features" on the product page. You can specify the heading, icons and description as needed. Also, the titles of the accordion (e.g. "Features" / "Materials") can also be edited (e.g. for sites not in English).

### Product page reviews

The reviews element on the product page can be enabled as needed. Review importing needs to be enabled by a developer, and if this has not been done, you probably want to disable the reviews element altogether.

## Translations

Translations need to be enabled by a developer. After this, content should be completely translatable into the enabled languages. See below for specifics.

*Note that language and locale are used quite interchangably here, although they are not the same thing. When refering to "language" here the more correct term would usually be "locale".*

### Specifying language

If multilingual mode is enabled, the language (locale) of a page is specified in the filename. The format of the filename is then `slug.locale.md`, where slug is the last part of the URL. Note that the filename of the page in the default language (e.g. English) can omit the locale. Here are some examples for an example site in English with translations in French:

| Page type | Filename English | Filename French |
|-----------|------------------|-----------------|
| Home page | \_index.md | \_index.fr.md |
| Regular page | help.md | help.fr.md |

Note that, by default, the URL of the default language is `/slug` and in the translated languages `/locale/slug`.

### Menu and other settings

Menus and e.g. product page settings in different languages should have their own sections in forestry. So there should be two menu sidebar items "Menu" and "Menu French" or something similar. If this is not the case, contact a developer.

## Product data in Shopify

### Products

All product-related content is managed in Shopify and imported from there. Because of the limitations in Shopify, there is some special handling needed:

- **Product description**: This needs to be formatted with pre-defined separators in order to create the details, care, etc. views. See a working example product for details.
- **Product tags**:
  - Feature icons are added as tags according to the description above. 
  - A visual "tag" can be applied to products in the product list (see design demo, link in issue #141). This is created with a tag `Site Tag:<tag>` where "<tag>" is the textual tag you want to show (don't include the <>).
