import {
  fetchFromHost,
  getEventListener,
  notFound404WhenTrailingSlash,
  rewriteForTesting,
} from "https://raw.githubusercontent.com/reima-ecom/site-worker/v0.1.1/mod.ts";

const eventListener = getEventListener({
  getAsset: notFound404WhenTrailingSlash(
    fetchFromHost("reima-demo.netlify.app"),
  ),
  responseTransformers: [
    rewriteForTesting(["exp-klarna-banner"]),
  ],
});

addEventListener("fetch", eventListener);
