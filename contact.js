export function initContact(tr) {
  const form = document.getElementById("contactForm");
  const direct = document.getElementById("waButton");
  const feedback = document.getElementById("status");
  const fallback = document.getElementById("chatLink");
  const directFallback = document.getElementById("contactFallback");
  const submit = form.querySelector('button[type="submit"]');
  const { nombre, empresa, email, telefono, servicio, mensaje } = form.elements;
  let issue = "";
  let draft = null;

  function autoMessage(project) {
    return tr("inquiry").replace("{solution}", () => tr(project));
  }

  function clearStatus() {
    issue = "";
    feedback.textContent = "";
    feedback.classList.remove("ok");
    fallback.hidden = true;
    fallback.removeAttribute("href");
    for (const field of form.querySelectorAll('[aria-invalid="true"]')) {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function showError(key, ...fields) {
    issue = key;
    feedback.textContent = tr(key);
    for (const field of fields) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", "status");
    }
    fields[0].focus();
  }

  function chatURL() {
    const contactInfo = [
      tr("hello"),
      `${tr("name")}: ${nombre.value.trim()}`,
      empresa.value.trim() && `${tr("company")}: ${empresa.value.trim()}`,
      email.value.trim() && `${tr("email")}: ${email.value.trim()}`,
      telefono.value.trim() && `${tr("phone")}: ${telefono.value.trim()}`,
      servicio.value && `${tr("interest")}: ${tr(servicio.value)}`,
      `${tr("message")}: ${mensaje.value.trim()}`,
    ].filter(Boolean);
    const url = new URL(direct.href);
    url.searchParams.set("text", contactInfo.join("\n"));
    return url.href;
  }

  form.noValidate = true;
  form.addEventListener("input", (event) => {
    if (event.target === mensaje) draft = null;
    clearStatus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearStatus();
    const address = email.value.trim();
    const phone = telefono.value.trim().normalize("NFKC");
    const digits = phone.replace(/\D/g, "");
    if (!nombre.value.trim()) return showError("errName", nombre);
    if (!mensaje.value.trim()) return showError("errProject", mensaje);
    if (!address && !phone) return showError("errContact", email, telefono);
    if (
      address &&
      (email.validity.typeMismatch ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
    ) {
      return showError("errEmail", email);
    }
    if (
      phone &&
      (!/^\+?(?:\d|[ .-]|\(\d+\))+$/.test(phone) ||
        !/^\d{8,15}$/.test(digits) ||
        !/[1-9]/.test(digits))
    ) {
      return showError("errPhone", telefono);
    }

    const href = chatURL();
    issue = "success";
    feedback.textContent = tr(issue);
    feedback.classList.add("ok");
    fallback.href = href;
    fallback.hidden = false;
    window.open(href, "_blank", "noopener,noreferrer");
  });
  submit.disabled = false;
  submit.hidden = false;
  directFallback.hidden = true;

  return {
    prefill(project, service) {
      clearStatus();
      servicio.value = service;
      if (!mensaje.value.trim() || draft?.text === mensaje.value) {
        mensaje.value = autoMessage(project);
        draft = { project, text: mensaje.value };
      }
    },
    translate() {
      if (draft?.text === mensaje.value) {
        mensaje.value = autoMessage(draft.project);
        draft.text = mensaje.value;
      }
      if (issue) feedback.textContent = tr(issue);
      if (issue === "success") fallback.href = chatURL();
    },
  };
}
