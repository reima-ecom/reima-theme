const newsletterSubmit = async (e: Event) => {
  e.preventDefault();
  const f = e.target as HTMLFormElement;
  const data = {
    email: f.querySelector<HTMLInputElement>("[name=email]")!.value,
    tags: f.querySelector<HTMLInputElement>("[name=tags]")!.value,
    consent: f.querySelector<HTMLInputElement>("[name=consent]")!.checked,
    marketing: f.querySelector<HTMLInputElement>("[name=marketing]")!.checked,
  };
  const resp = await fetch(f.action, {
    method: "post",
    body: JSON.stringify(data),
  });
  if (resp.ok) {
    f.setAttribute("success", "");
    f.dispatchEvent(
      new CustomEvent("subscribe", { bubbles: true, detail: data }),
    );
  } else {
    const msg = await resp.text();
    f.querySelector<HTMLElement>("[failure]")!.innerText = msg;
  }
};

const emailFocus = (e: FocusEvent) => {
  (e.target as HTMLInputElement).form!.setAttribute("consent", "");
};

export default class RNewsletter extends HTMLElement {
  connectedCallback() {
    this.querySelector("form")!.addEventListener("submit", newsletterSubmit);
    this.querySelector<HTMLInputElement>("input[name=email]")!.addEventListener(
      "focus",
      emailFocus,
    );
  }
}

window.customElements.define("r-newsletter", RNewsletter);
