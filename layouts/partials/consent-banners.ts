/// <reference lib="dom" />

const gdprButtonClick = (e: Event) => {
  const element = e.target as HTMLElement;
  // read which button was clicked, i.e. consent value (yes|no)
  const [, consent] = element.getAttribute("href")!.split("=");
  // set consent cookie (one month)
  document.cookie = `GDPR-Consent=${consent}; Path=/; Max-Age=2629746`;
  // if consent, load analytics
  if (consent === "yes") {
    document.querySelectorAll("[uses-cookies]").forEach((element) => {
      // load src
      if (element.hasAttribute("load-on-consent")) {
        element.setAttribute("src", element.getAttribute("load-on-consent")!);
        element.removeAttribute("load-on-consent");
      }
      // load inline scripts
      if (
        element.tagName === "SCRIPT" &&
        element.hasAttribute("type") &&
        !element.hasAttribute("src")
      ) {
        element.removeAttribute("type");
        document.body.append(element);
      }
    });
  }
  // hide banner
  element.closest("aside")?.removeAttribute("show");
  // don't follow link
  e.preventDefault();
};

document.querySelectorAll('aside[gdpr] a[href^="?gdpr-consent="]').forEach(
  (element) => {
    element.addEventListener("click", gdprButtonClick);
  },
);

document.querySelector('aside[ccpa] a[href="."]')!.addEventListener(
  "click",
  (e: Event) => {
    // no need to set notice given cookie, worker already sets that
    // hide banner
    (e.target as HTMLElement).closest("aside")?.removeAttribute("show");
    // don't follow link
    e.preventDefault();
  },
);

export {};
