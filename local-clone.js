(() => {
  const CONTACT_ENDPOINT =
    "https://www.cardiocarecr.com/wp-json/contact-form-7/v1/contact-forms/91/feedback";
  const WHATSAPP_PHONE = "50660382565";
  const EMAIL = "secretaria@cardiocarecr.com";

  const requiredMessage = "Por favor, complete los campos requeridos.";
  const sendingMessage = "Enviando solicitud...";
  const fallbackMessage =
    "No fue posible confirmar el envío en el servidor original desde este clon local.";
  const successMessage =
    "Solicitud enviada correctamente. Pronto deberían ponerse en contacto contigo.";

  function updateResponse(output, message, tone = "info", html = false) {
    if (!output) return;
    output.style.display = "block";
    output.style.borderColor =
      tone === "success" ? "#2e7d32" : tone === "error" ? "#d30000" : "#0c71c3";
    output.style.color = tone === "success" ? "#2e7d32" : "#333";
    output[html ? "innerHTML" : "textContent"] = message;
  }

  function buildContactMessage(data) {
    return [
      "Hola, deseo reservar una consulta en CardioCare.",
      "",
      `Nombre: ${data.get("your-name") || ""}`,
      `Correo: ${data.get("your-email") || ""}`,
      `Motivo: ${data.get("menu-446") || ""}`,
      `Telefono: ${data.get("number-983") || ""}`,
      `Mensaje: ${data.get("your-message") || "Sin mensaje adicional"}`,
    ].join("\n");
  }

  function validate(formData) {
    return ["your-name", "your-email", "menu-446", "number-983"].every((field) =>
      String(formData.get(field) || "").trim(),
    );
  }

  async function submitToOrigin(formData) {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  function buildFallbackLinks(message) {
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    const mailtoUrl = `mailto:${EMAIL}?subject=${encodeURIComponent(
      "Solicitud desde clon local de CardioCare",
    )}&body=${encodeURIComponent(message)}`;

    return `
      ${fallbackMessage}
      <br /><br />
      <a href="${whatsappUrl}" target="_blank" rel="noopener">Continuar por WhatsApp</a>
      <br />
      <a href="${mailtoUrl}">Continuar por correo</a>
    `;
  }

  window.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".wpcf7-form");
    if (!form) return;

    const output = form.querySelector(".wpcf7-response-output");

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const formData = new FormData(form);

        if (!validate(formData)) {
          updateResponse(output, requiredMessage, "error");
          return;
        }

        updateResponse(output, sendingMessage);

        try {
          const result = await submitToOrigin(formData);

          if (result.status === "mail_sent") {
            form.reset();
            updateResponse(output, successMessage, "success");
            return;
          }

          const fallbackText = buildContactMessage(formData);
          updateResponse(output, buildFallbackLinks(fallbackText), "error", true);
        } catch (error) {
          const fallbackText = buildContactMessage(formData);
          updateResponse(output, buildFallbackLinks(fallbackText), "error", true);
        }
      },
      true,
    );
  });
})();
