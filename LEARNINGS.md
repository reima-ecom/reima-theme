# Yotpo reviews missing

A lot of reviews were missing from the product pages when we moved from product-specific review getting to a bulk all reviews call. Unfortunately, many reviews did not have the correct sku set in the response, but were instead classified as site reviews with no way to link back to the product in question. This was fixed by moving back to product-specific review fetching, which seems to include all reviews and work as expected.

## Why did this happen?

This happened because of an assumption in how the Yotpo API works. Furthermore, this behavior was not documented in the API docs. Only through testing did this issue present itself.

## How can we avoid similar issues in the future?

When dealing with APIs, always document assumptions and test with real data. This is especially important when doing mapping from one system to another. Testing with Postman is very easy and should be done every time to validate assumptions and check the responses.

Always test the resulting changes to the website manually before releasing.

# Site server error on redirect

The site (worker) returned a server error for all pages that were not found in the worker KV store. The reason was that the KV getter, which has the form `NAMESPACE.get(key)`, was passed as an argument to the handler function (`arg: REDIRECTS.get`), but the getter uses `this` internally. So this resulted in an error. Passing the argument by using `bind` fixed the issue.

## Why did this happen?

Because of lacking understanding of how the KV getter works. JS `this` handling can be tricky, and when passing (class) functions as arguments, `this` is not what it's supposed to be. This behavior was not tested.

## How can we avoid similar issues in the future?

Always test changes in production. At the very least, manual testing is needed, but the best case is of course to write integration tests for the future.


# Template

Short description of the bug and how it was fixed.

## Why did this happen?

## How can we avoid similar issues in the future?