# Reima Headless

Headless eCommerce for Reima.

## Architectural components

- Shopify for products and collections
- Contentful for content pages and strings
- Algolia for product search and filtering
- Yotpo for reviews
- Cloudflare workers for A/B testing
- Netlify for building and hosting (including cloud functions)
- Hugo static site generator for building the site
- Web components aka custom elements for much of the client-side functionality (such as the cart)

## Folder structure

The folder structure mostly follows the default Hugo folder structure with a few additions. Some folders have more detailed readme files describing e.g. development principles.

- `.forestry`: forestry.io configuration
- `.github`: github config
  - `workflows`: CI/CD in the form of action workflows
- `.vscode`: VSCode config
- `images`: upload folder for images, as well as Hugo headless page to enable resource getting
- `packages`: modules such as logic for getting content (products, pages, etc.) from the different services
- `tests`: Production tests against the website
- `themes`: Hugo themes folder
  - `theme`: default Reima headless theme
    - `content`: pages global to all sites, such as a page for outputting the Algolia index
    - `data`: data files, such as color codes
    - `layouts`: layout files and partials
    - `layouts-client`: css and js assets for the site (as well as some svg icons that should be inlined)
    - `modules`: layout "modules" (i.e. blocks) design
    - `static`: static content for the site
- `us`: content for the us site - note that much of this is not commited, since it's downloaded on build
  - `content-static`: content files that are editable in forestry
- `workers`: Cloudflare workers, such as the ones serving the sites

Other folders and root files are configuration files for the development environment or cache files.

## Browser compatibility

The site uses ES2015, such as `async/await`, rest operators `{...rest}`, etc. On the CSS side, flexbox is used heavily, and grid layout in some key places. Thus the goal is to have an optimal experience on modern browsers that support these elements.

JavaScript is only delivered to browsers using `type=module`, and thus **legacy browsers will not use JS at all**. Instead, key functionality such as the cart will be implemented using a server-side approach. (This is what we call progressive enhancement.) For browsers that support ES6 Modules but lack other key functionality, polyfills are loaded on demand.

CSS that will potentially break on legacy browsers is mainly `grid layout`, but workarounds shold be in place also for e.g. the `inherit` CSS property.

### Used features and browser support

| Feature                  | Chrome | Firefox | iOS Safari | Safari | Opera | Samsung | Edge |
| ------------------------ |:------:|:-------:|:----------:|:------:|:-----:|:-------:|:----:|
| JS Modules               | **61** | **60**  |  **10.3**  |**10.1**| **48**| **8.2** |**16**|
| JS ES6                   |   51   |   54    |     10     |   10   |   38  |    5    |  15  |
| JS Custom Elements       |   54   | **63**  |    10.3    |  10.1  |   41  |   5.4   |**79**|
| JS IntersectionObserver  |   58   |   55    |  **12.2**  |**12.1**|   45  |   7.2   |  16  |
| JS Element scrollBy      |   45   |   36    |   **n/a**  |   10   |   32  |    5    |**79**|
| JS Element Smooth Scroll |   45   | **yes** |   **n/a**  | **n/a**|   32  |    5    |**79**|
| CSS Grid Layout          |   58   |   54    |    10.3    |  10.1  |   44  |   6.2   |  16  |
| CSS Scroll Snap          | **69** | **68**  |   **11**   | **11** | **64**| **10.1**|**79**|
| *JS Dynamic Import*      |   63   |   67    |     11     |  11.1  |   50  |   8.2   |  79  |

Based on caniuse data.

*Special note on scrolling:* The carousel (and product page thumbnails) uses smooth scrolling to scroll images. Support for Safari is lacking for this feature. Support for different versions of Firefox is unknown, but it is supported. There are a few features at play here: css scroll snap, css scroll-behavior, js element scrollBy (with options, i.e. smooth scroll above). We need scrolling (as opposed to e.g. absolute positioning) so that scrolling is possible by swiping on mobile. And smooth scrolling is just nicer.

### Optimal experience

These browsers should have a blazingly fast and pixel-perfect experience using modern features. The deciding factor here is browsers supporting `type=module`, `ES2015 (ES6)`, `IntersectionObserver` and CSS `display:grid`. Unfortunately, we cannot use dynamic imports, since these are not supported universally. Also, Safari doesn't support customized built-in elements, so those cannot be used either.

Development is done on Chrome stable branch and occasionally Firefox stable.

- Chrome 69+
- Firefox 68+
- Opera 64+
- Samsung Internet 8.2+
- Edge 79+

### Working experience with JavaScript

These browsers should work, but will load slower polyfills for some of the functionality that is not supported natively. Polyfills needed are visible in the support table above.

- Chrome 61-68
- Firefox 60-67
- iOS Safari 10.3+
- Safari 10.1+
- Opera 48-63
- Edge 16-18

Note that scroll snapping is difficult and there are no good polyfills for this. So this feature will not be polyfilled.

### Working experience without JavaScript

All browsers should have a working experience without JavaScript (see above about progressive enhancement). The main caveat here is not only JavaScript, but also providing fallback CSS for these browsers (see above about css support). Browsers listed below *should* work, "work" being a question of how the UI looks. Other browsers may or may not work.

Development is done mainly on Chrome with JavaScript disabled. Manual testing for CSS is occasionally done in IE11. If it works there, it works everywhere!

- All browsers listed above
- IE 11
- Opera Mini
- UC Browser for Android

These features are supported without JS. Functionality that is not supported should when possible be hidden from the user (such as hiding the search button).

**Supported functionality**

- Cart and ordering (via separate cart page rendered in CloudFlare worker)
- Desktop menu (via css :hover selector)
- Mobile menu (via css checkboxes and :checked selector)

**Not supported**

- Search
- Filtering
- Newsletter signup
- Carousel
- Product thumbnails

## Development standards

### Bugs and outages

Always when there's a bug (or outage!), the following process should be followed:

1. Write a test case to reproduce the encountered bug. Make sure this test is run at least on source changes, possibly on content changes or via cron job. 
2. Fix the bug.
3. Update documentation as needed.
4. Write a post-mortem to gather learnings. Why did the bug happen? How was it fixed? What can we do to avoid similar issues in the future?

Post mortems are written in the [LEARNINGS.md](https://github.com/reima-solution-sales/reima-us/blob/master/LEARNINGS.md) file. See that file for a template.

### Documentation

All packages and independent pieces of logic should have a README or other independent documentation. A feature is considered done only when it's properly documented.

Specific thoughts on how to document different things:

- npm-style packages in `packages`
  - describe architecture / design specs in README.md
  - create proper typings for at least every exported pieces of logic (even exports used only inside the package itself)
- design modules in `themes/theme/modules`
  - create demo page describing usage and demoing design
- layout designs in `themes/theme/layouts`
  - describe what each file does at the top of the file (applies especially to partials!)
  - if creating complex logic (i.e. anything more than ifs or ranges), write a detailed description of the logic and why there is complexity

If not listed here and it's not practical, at least document what each file does at the top of the file.

### Using APIs

Don't ever assume other peoples code or endpoints is bug-free and work the way you want. Test your assumptions and logic end-to-end manually before implementing solution. Postman can be used for APIs for instance. Write down your assumptions and if possible, write run-time checks for them. Document logic on how your code uses the APIs.

### Process

- Critical bugs are of course fixed asap.
- Other bugs are also fixed before new features are developed. Remember that a bug is not complete without tests, documentation, and a post mortem.
- New features are developed, and again not complete without documentation. "Bug-driven development" is ok in non-mission critical parts, but for instance package modules should always have unit tests for exported members.

In addition, tests and documentation should be prioritized for mission-critical existing features (such as site worker). Documentation for existing features should be improved regularly.

## Development

Tools needed: Node.js, git, Hugo, etc.