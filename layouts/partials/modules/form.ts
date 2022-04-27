/**
 * Form submit events
 */
const errorMsg = document.getElementById("phone_error") as HTMLElement;
const submitButton = document.getElementById("submit") as HTMLButtonElement;
const formFields = document.querySelectorAll(".form-field");
submitButton.disabled = true;

const validatePhoneNumber = (phone) => {
  if (phone === "") return true;
  const re = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  return re.test(phone);
};

const validateForm = (input) => {
  const field = input.target as HTMLFormElement;
  if (field.type === "tel" && !validatePhoneNumber(field.value)) {
    errorMsg.classList.remove("hidden");
    submitButton.disabled = true;
    return false;
  } else if (field.type === "tel" && validatePhoneNumber(field.value)) {
    errorMsg.classList.add("hidden");
    submitButton.disabled = false;
    return true;
  }
};

const changeListener = () => {
  formFields.forEach((field) => {
    field.addEventListener("change", (f) => {
      validateForm(f);
    });
  });
};

changeListener();

const formSubmit = async (e: Event) => {
  e.preventDefault();
  const data = {};
  const f = e.target as HTMLFormElement;
  const fields = f.querySelectorAll("input");

  fields.forEach((input) => {
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
