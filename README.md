# Reima Headless Theme

This is a [Hugo module](https://gohugo.io/hugo-modules/use-modules/) theme for use on Reima headless ecommerce sites. See [Hugo](https://gohugo.io/) documentation for details.

## Architecture

Each site (e.g. us.reima.com) is its own isolated environment, although it uses this themes and many tools provided in this repository. I.e. the sites are built and managed independently, but depend on this repository and the data from external providers. The main building blocks for the sites are:

- Forestry.io for content management
- Shopify for products and collections
- Contentful for brand content
- Algolia for product search and filtering
- Yotpo for reviews
- Cloudflare workers for CDN and A/B testing
- Netlify is used for hosting
- Hugo static site generator for building the site
- Web components aka custom elements for much of the client-side functionality (such as the cart)

### Content management

Content is managed by the merchants in [Forestry](https://www.forestry.io). Forestry commits directly to the `main` branch of the respective site repo. The building blocks in Forestry are called "Front Matter Templates", and define the parameters for each type of page, module, configuration file, etc. This "Front Matter" configuration lives inside the `.forestry/front_matter/templates` folder of each repo (including this one, and can be edited manually or inside the Forestry admin. **The frontmatter configuration for each site repo is automatically synced with this repository.**

### Hosting

The sites are built and hosted on [Netlify](https://www.netlify.com). On each push to the `main` branch, Netlify re-builds the site and publishes it to production. This can happen e.g. when content is updated, data such as products are updated, or the theme is updated.

We use [Cloudflare](https://www.cloudflare.com) in front of the Netlify deployment, and specifically Cloudflare Workers. This way, we have complete control over what is transmitted to the visitors, and can rewrite responses at will. This is how the cookie consent banners work. See the `reima-ecom/site-worker` repo for more information.

### External data

Data such as product information from Shopify, or reviews from Yotpo, are updated from the `/status` page of each site. See [us.reima.com/status](https://us.reima.com/status) for an example. This runs as a GitHub action on the site repo, and updates the `main` branch with new data. This, in turn, will trigger a site re-build.

## Performance

This theme is designed to be blazingly fast. It should easily pass the [web vitals](https://web.dev/vitals/) test. It's optimized for modern browsers (cleaner and better performing code), but makes no assumption of this. Furthermore, [accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/) and [semantic document markup](https://www.google.com/search?q=semantic+html) are a priority. These are the main performance principles to use:

### Properly size images

Images are arguably the most important part of a web page to optimize, at least when it comes to network traffic. You can deliver the rigth resolution with `srcset` and the right format with `source`. But the most important and most easily forgotten part about this is the `sizes` attribute on images. It tells the browser what size to consider from `srcset`. Without this the browser considers the entire viewport as the width for choosing an image to load.

The `sizes` attribute is extremely important. Consider three images that are shown in a 900px wide container side-by-side. Each image is 300 (CSS) pixels wide. Let's say the whole viewport is 1400px wide with a DPR of 2. That means that the image is selected based on a width of 2800px. But we only need a 600px wide image. The difference is massive - the requested image is almost 22 times too big. Read that again: it's 22 times too big!

> The `sizes` attribute should *always* be used. (Unless the image is always 100vw wide, of course.)

Another very useful tool in the image optimization toolbox is the use of [client hints](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/client-hints). Using client hints, it's possible to serve exactly the right resolution to every user. (This is of course not very practical from a caching perspective, but still.) Not only that, images can be varied based on the network connection and `save-data` header as needed. This has a nice side-effect of making the code easier, because now `srcset` is not needed anymore. So instead of developers choosing the right images for the `srcset`, they can devote all their time to get `sizes` right.

> Use client hints and server-side image processing for optimal performance.

### Lazy load below-the-fold images

Images below the fold should be lazy loaded. This is possible via the native `loading=lazy` attribute, but it needs a JS polyfill, because it's at the time of writing not universally supported (damn Safari!). Above the fold, images should be loaded semi-eagerly with `loading=lazy` but with the `src` set as well. (In contrast to the polyfill, which is loaded at the end of the page.)

> Use `loading=lazy` and Javascript lazy loading

### Make it usable on every device

Usable on every device means every device indeed. It means usable on older versions of mobile Safari, usable on IE, usable on Opera Mini, and usable even on the text-based [Lynx browser](https://lynx.browser.org/). This *does not*, however, mean that we need polyfills for every device, and post-css autoprefixers and such. Because usable is not the same as optimal.

The first and arguably most important part of this is: the main flow (happy path?) of the site should work without Javascript. This enables us to [optimize for modern browsers](#optimize-for-modern-browsers), because we know that the most important features will work when our Javascript is not supported or turned off completely.

The other part is: the site should work without most CSS features, and even without CSS at all. For instance `grid` layout can be used, but make sure the site looks ok without it. Make sure the site looks ok without CSS as well (e.g. link to skip to main content at the top, images with sane default dimensions, etc).

> Be aggressive with new features, but make the site progressively enhanced.

### Lazy load below-the-fold CSS

Below the fold CSS can be lazy loaded. Here it's important to create good CSS bundles and cache those efficiently. For instance, non-critical global CSS should be in one file with a long cache duration. That way subsequent page loads will be fast. Thanks to HTTP/2 (?), each component used on a page can have its own CSS file. In practice, this means:

- Internalize all critical CSS related to the main layout
- Internalize the CSS of the first few components of a page
- Create one CSS bundle for all "global" layout CSS
- Create one CSS file for each module
- Cache CSS files with efficient caching

Remember that the fold can be in very different places for different users. Some might have the browser next to another window, and some might even have the whole screen in portrait mode. Test without the external styles, and always, always try to avoid layout shifts.

> Internalize critical CSS, lazy load the rest with efficient browser caching

### Optimize for modern browsers

Since we are making the site [usable without Javascript](#make-it-usable-on-every-device), we can focus on making it pixel-perfect for modern browsers. While this includes both CSS and JS (and HTML in a lesser degree), we'll focus on JS here.

A very good way to ensure JS capabilities is to use `type=module`. Using this we know that browsers executing JS will support at least ES2015, including Promises, fetch, and so on. Other features can just fail - we still have the no-JS fallback.

This means we should avoid using polyfills, because the small amount of users needing them can just use the site without JS. However, some important features are still not universally supported, so polyfills are ok in some cases. For instance smooth scrolling is still not available in Safari, and IntersectionObserver came in pretty late.

Using progressive enhancement, we can enhance the experience of the majority of users while ensuring a working experience for the few on legacy browsers.

> Avoid polyfills and instead make JS features progressively enhanced

### Use web workers where appropriate

When you don't need the DOM, consider using web workers for your computing. However, this is quite a new approach and doesn't affect load times very much if sane Javascript loading is used. But worth keeping in mind.

## Multilingual sites

Multilingual sites need to have their [locales specified in the site config file](https://gohugo.io/content-management/multilingual/#configure-languages). Also, you need a separate i18n file for non-English languages (also applies to sites that are not multilingual but where the language is not English). Furthermore, some site settings found in the `data` directory have language-specific content (e.g. announcements and menu). These files should have a language-specific version named `datafile.locale.ext`, e.g. `announcements.fi.yaml`.

## Folder structure

The folder structure mostly follows the default Hugo folder structure with CSS and JS files handled a bit differently.

In order to allow for CSS files to live next to their layout (HTML) counterparts, the `layouts` dir is mounted also as `assets`. This means that CSS files should be referenced relative to the `layouts` folder. I.e. the CSS for the base layout should be added as `_default/baseof.css`, because that is its path within the `layouts` folder.

A demo site is available under `demo`. When in doubt about how to configure a site, see this example implementation!

## Browser compatibility

The site uses ES2015, such as `async/await`, rest operators `{...rest}`, etc. On the CSS side, grid and flexbox are used for laying out content. Thus the goal is to have an optimal experience on modern browsers that support these elements.

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

These browsers should have a blazingly fast and pixel-perfect experience using modern features. The deciding factor here is browsers supporting `type=module`, `ES2015 (ES6)`, `IntersectionObserver` and CSS `display:grid`. Safari doesn't support customized built-in elements, so these need [a polyfill](https://github.com/WebReflection/custom-elements-builtin#readme), but this feature is currently not used.

Development is done on Chrome stable and/or Firefox stable.

- Chrome 69+
- Firefox 68+
- Opera 64+
- Samsung Internet 10.1+
- Edge 79+

### Working experience with JavaScript

These browsers should work, but will load slower polyfills for some of the functionality that is not supported natively. Polyfills needed are visible in the support table above.

- Chrome 61-68
- Firefox 60-67
- iOS Safari 10.3+
- Safari 10.1+
- Opera 48-63
- Samsung Internet 8.2-10.0
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

#### Supported functionality

- Cart and ordering (via separate cart page rendered in CloudFlare worker)
- Desktop menu (via css :hover selector)
- Mobile menu (via css checkboxes and :checked selector)

#### Not supported

- Search
- Filtering
- Newsletter signup
- Carousel (only regular scrolling supported)
- Product thumbnails (only regular scrolling supported)

## Development

### Getting Started

The only mandatory tool when developing is the [Hugo static site builder](https://gohugo.io).

All development should be done in feature branches, and changes merged to master via GitHub pull requests. [GitHub Flow](https://guides.github.com/introduction/flow/) is used as a branching strategy / workflow.

When you are developing new features for the front-end (i.e. the theme), use the site in the `demo` folder to view changes:

```bash
> cd demo
> hugo server
```

This theme is a [hugo module](https://gohugo.io/hugo-modules/use-modules/) that is then used on the individual ecommerce sites. The theme is automatically updated based on changes and [semantic versioning](https://semver.org/).

Always use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) style commit messages for commits that end up on the master branch! For feature branches, the recommended workflow is:

1. commit with whatever commit messages you like, but prefer conventional commits
2. squash merge the resulting PR with a conventional commits style message

We're [creating release notes automatically based on commit messages](#releases). So the commit messages should be well written and understandable by users. If you want to add notes for developers, that's of course great! Just remember to also explain the commit so everyone understands what has changed.

### Designing pages and modules

Please take a moment to understand how [Hugo](https://gohugo.io/documentation) works, as this theme tries to follow Hugo conventions as much as possible. In general, content lives in the `content` directory and layouts in the `layouts` directory. The main layout template is `layouts/_default/baseof.html` as per Hugo convention.

The main way to create pages is to use the `page` type on content pages (`layouts/_default/page.html`). This template allows content creators to add "modules" to pages. Modules, in turn, are defined under the `layouts/partials/modules/` directory. For most updates, you only need to update the module in question.

In general, the corresponding CSS files live next to their HTML layout template with the same name. They are added to the page using a Hugo scratchpad either in the base layout, or the page layout. It is unfortunately not possible to add CSS from partials (e.g. a "module") because that partial will be executed after the `head` has already been rendered.

If you need to update the content structure of a module (or page), remember to update the corresponding frontmatter template. If you're creating a new module, remember to add this module to the list of allowed module types on the main `page` frontmatter template (`layouts/.forestry/front_matter/templates/page.yml`) and any other page types that support modules, such as `collection`. You can do this either by hand or via the Forestry GUI. If you want to configure and/or test your feature branch in the Forestry admin GUI, you can add that as a personal "site" in Forestry.

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

- design modules in `themes/theme/modules`
  - create demo page describing usage and demoing design in `demo/modules`
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

This is all achieved automatically by using [semantic release](https://github.com/semantic-release/semantic-release) and [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). This is run on each push (and PR merge) to the `main` branch. New releases are thus created automatically based on conventional commit messages. The sites that use this theme are automatically updated to the latest version according to go modules rules (breaking changes that result in major version bumps are not upgraded automatically).
