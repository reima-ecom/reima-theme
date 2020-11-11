# Incident reports and learnings

## Cart not working on all targeted browsers

A bug was released to production breaking shopping cart functionality on some browsers. The affected browsers were most notably Mobile Safari prior to 13.7 and Chrome for Android prior to 80.

The affected browser versions are marked in red in [this caniuse table](https://caniuse.com/mdn-javascript_operators_optional_chaining). Alternatively, see the browser compatibility section [on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

### What was the impact?

The bug was introduced in theme version 1.4.0, which was released 28.10. It was reported on 10.11. and fixed within hours in version 2.0.3. So the bug was live for 13 days. This impacted using the cart and buying on the two very important mobile platforms. It is impossible to say what the actual business impact was. But considering that Facebook ads did not convert for the affected versions (thus also the algorithmic optimization became skewed at least temporarily), one could characterize the business impact as "significant".

### Why did this happen?

The bug was the result of using the [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), which is not supported in all targeted browser versions. The operator was introduced when moving from Javascript to Typescript and in connection with that from Rollup to ESBuild. This was purely a refactor, i.e. only a change in the code structure, not functionality itself.

When making this change, the assumption was that there would be sufficient browser support, and while all current versions support the operator, enough care was not taken to ensure continued functionality on previous versions still in wide use.

### How was it fixed?

The optional chaining operator (which was annoyingly enough only needed for linting purposes, not functionality), was removed and the [Typescript non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator) was used instead. The former is not transpiled in ESBuild, but the latter is a Typescript-specific operator that is removed when compiling to Javascript.

### How can we avoid similar issues in the future?

Firstly, we need to implement the cart (and possibly other features as well) so that it works without Javascript. This will enable the cart to work on non-supported browsers, for instance in this case when the cart JS threw a syntax error. This is tracked in issue #63.

Secondly, we need to enable error reporting from client-side code running in production. This enables us to monitor the functionality of the client-side code and fix these kinds of errors early. We should not rely on user bug reports, since these can take a long time to surface, as witnessed by the timeline of this bug. This is tracked in issue #72.

While either of these fixes will prevent bugs like this from breaking the most important flow of the whole site, we should definitely do both. The first one ensures that the cart is always usable, and the second one ensures that the site is working as expected on targeted browsers.

## Newsletter subscription not working

A bug was released to production resulting in users not being able to sign up for the newsletter. Clicking the email input box should open the whole form including the submit button but this did not work anymore.

### What was the impact?

Due to a very fast bug report this bug was fixed within a few hours from releasing, so the amount of time users weren't able to subscribe was short. Thus the business impact was fairly low.

### Why did this happen?

This happened because the context passed to the newsletter partial template was changed. Previously the context was the entire page but this was changed to passing just the announcements data. This resulted in the `$.Scratch` call to add the TypeScript dependency not working anymore, since it did not reference the correct instance of `Scratch`. I.e. the script needed for the newsletter to work was never loaded on the page.

(Weirdly, this did not cause a build error. It seems that `$.Scratch` is always available regardless of context.)

### How was it fixed?

The call to `$.Scratch` was moved to the base layout, where the correct page context is always available.

### How can we avoid similar issues in the future?

We should have automatic testing in place for all key functionality. This can be done with e.g. [Puppeteer](https://pptr.dev/), because these checks are not for browser compatibility, but rather just regression tests to make sure features are working as intended. This is tracked in issue #71.

## Self-hosted CI (GitHub Actions runner) keeps crashing

The runner keeps crashing. Thus builds are failing.

### Why did this happen?

This happens because the runner has too little memory allocated to it.

### How can we avoid similar issues in the future?

Short-term solution is to add more memory to the runner. Unclear how much memory is actually needed, so go with some very hight amount like 8 GB for now.

Long-term solution is to add enough memory to the runner but also keep costs down. This can be achieved via starting the runner on demand (via REST?), and using a file share for storing the git repos (caching). Unclear how fast the file shares are.

Another possibility is to ditch the self-hosted runner altogether. This might be viable if we can get the images out of git (making checkout fast), at least the processed images. It might be a good option to do the publish builds in Netlify, but the cache there is not super fast either.

## Yotpo reviews missing

A lot of reviews were missing from the product pages when we moved from product-specific review getting to a bulk all reviews call. Unfortunately, many reviews did not have the correct sku set in the response, but were instead classified as site reviews with no way to link back to the product in question. This was fixed by moving back to product-specific review fetching, which seems to include all reviews and work as expected.

### Why did this happen?

This happened because of an assumption in how the Yotpo API works. Furthermore, this behavior was not documented in the API docs. Only through testing did this issue present itself.

### How can we avoid similar issues in the future?

When dealing with APIs, always document assumptions and test with real data. This is especially important when doing mapping from one system to another. Testing with Postman is very easy and should be done every time to validate assumptions and check the responses.

Always test the resulting changes to the website manually before releasing.

## Site server error on redirect

The site (worker) returned a server error for all pages that were not found in the worker KV store. The reason was that the KV getter, which has the form `NAMESPACE.get(key)`, was passed as an argument to the handler function (`arg: REDIRECTS.get`), but the getter uses `this` internally. So this resulted in an error. Passing the argument by using `bind` fixed the issue.

### Why did this happen?

Because of lacking understanding of how the KV getter works. JS `this` handling can be tricky, and when passing (class) functions as arguments, `this` is not what it's supposed to be. This behavior was not tested.

### How can we avoid similar issues in the future?

Always test changes in production. At the very least, manual testing is needed, but the best case is of course to write integration tests for the future.

<!--
## Template

Short description of the bug from a user perspective.

### What was the impact?

### Why did this happen?

### How was it fixed?

### How can we avoid similar issues in the future?
-->
