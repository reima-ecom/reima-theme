/// <reference lib="dom" />

export default class RSearchTitle extends HTMLElement {
  static get observedAttributes() {
    return ["query", "count"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "query") {
      this.querySelector("[query]")!.textContent = `"${newValue}"`;
    }
    if (name === "count") {
      this.querySelector("[count]")!.textContent = newValue;
    }
  }
}
