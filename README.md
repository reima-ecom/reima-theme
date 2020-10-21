# Reima Headless

This is a [Hugo module](https://gohugo.io/hugo-modules/use-modules/) theme for use on Reima headless ecommerce sites.

- Static site is built using [Hugo](https://gohugo.io/)
- JS is built using [Rollup](https://rollupjs.org/guide/en/), so Node is used for this

## Architectural components

- Forestry.io for content management
- Shopify for products and collections
- Contentful for brand content
- Algolia for product search and filtering
- Yotpo for reviews
- Cloudflare workers for site hosting and A/B testing
- Hugo static site generator for building the site
- Web components aka custom elements for much of the client-side functionality (such as the cart)

## Folder structure

The folder structure mostly follows the default Hugo folder structure with CSS and JS files handled a bit differently.

In order to allow for CSS files to live next to their layout (HTML) counterparts, the `layouts` dir is mounted also as `assets`. This means that CSS files should be referenced relative to the `layouts` folder. I.e. the CSS for the base layout should be added as `_default/baseof.css`, because that is its path within the `layouts` folder.

JS files also live next to their corresponding layout files. However, these need to be built with rollup, which outputs the build result to `assets/js`. So JS files should be referenced accordingly. Note that rollup doesn't create any subfolders, so just reference JS files as `js/[entrypoint].js`. Note also that the `assets/js` folder is mounted as a static folder as well, to allow for chunks to be loaded correctly. Remember to build the JS files when they are updated - this is not done in connection with site builds!

Finally, a demo site is available under `demo`. When in doubt about how to configure a site, see this example implementation!

## Multilingual sites

Multilingual sites need to have their [locales specified in the site config file](https://gohugo.io/content-management/multilingual/#configure-languages). Also, you need a separate i18n file for non-English languages (also applies to sites that are not multilingual but where the language is not English). Furthermore, some site settings found in the `data` directory have language-specific content (e.g. announcements and menu). These files should have a language-specific version named `datafile.locale.ext`, e.g. `announcements.fi.yaml`.

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

## Development

### Getting Started

To make setup as easy as possible, use [vscode remote containers](https://code.visualstudio.com/docs/remote/containers) for development. After setting everything up according to the "Getting Started" section, you can clone this repository directly into a container with the vscode command `Remote-Containers: Clone Repository in Container Volume`. Vscode will build the container, clone the repo and start your coding session inside the container. Of course, you should have a working git setup and credential manager in place for this to work.

All development should be done in feature branches, and changes merged to master via GitHub pull requests. [GitHub Flow](https://guides.github.com/introduction/flow/) is used as a branching strategy / workflow.

When you are developing new features for the front-end (i.e. the theme), use the site in the `demo` folder to view changes:

```bash
> cd demo
> hugo server
```

This theme is a [hugo module](https://gohugo.io/hugo-modules/use-modules/) that is then used on the individual ecommerce sites. The sites use a "vendored" approach, so the theme is not automatically updated based on changes. All theme updates to the production sites are initiated manually, so you cannot break the live sites just by editing this theme.

Always use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) style commit messages for commits that end up on the master branch! For feature branches, the recommended workflow is:

1. commit with whatever commit messages you like, but prefer conventional commits
2. squash merge the resulting PR with a conventional commits style message

### Bugs and outages

Always when there's a bug (or outage!), the following process should be followed:

1. Write a test case to reproduce the encountered bug. Make sure this test is run at least on source changes, possibly on content changes or via cron job.
2. Fix the bug.
3. Update documentation as needed.
4. Write a post-mortem to gather learnings. Why did the bug happen? How was it fixed? What can we do to avoid similar issues in the future?

Post mortems are written in the [LEARNINGS.md](https://github.com/reima-ecom/reima-us/blob/master/LEARNINGS.md) file. See that file for a template.

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

### Releases

Releases to the theme are created using [semantic version](https://semver.org/) tags. This way, the sites using the theme (i.e. the Hugo module) can update the theme safely and automatically. The release notes in GitHub should contain the changelog from the previous release.

This is all achieved automatically by using [semantic release](https://github.com/semantic-release/semantic-release) and [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). We might at some point run this in CI, but for now, semantic release is run on demand via the command line against the `master` branch.
