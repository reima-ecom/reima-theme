/**
 * Form submit events
 */
const formSubmit = async (e: Event) => {
  e.preventDefault();

  const data = {};
  const f = e.target as HTMLFormElement;
  const formFields = f.querySelectorAll("input");
  formFields.forEach((input) => {
    if (input.name && input.type && input.value) {
      data[input.name.toLowerCase().replace(/ /g, "_")] =
        input.type === "checkbox" ? input.checked : input.value;
    }
  });
  const resp = await fetch(f.action, {
    method: "post",
    body: JSON.stringify(data),
  });

  if (resp.ok) {
    f.setAttribute("success", "");
    f.dispatchEvent(
      new CustomEvent("subscribe", { bubbles: true, detail: data })
    );
  } else {
    const msg = await resp.text();
    f.querySelector<HTMLElement>("[failure]")!.innerText = msg;
  }
};

document.querySelectorAll(".module-form").forEach((form) => {
  form.addEventListener("submit", formSubmit);
});
