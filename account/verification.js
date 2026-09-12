(() => {
  "use strict";

  window.WCXEmailVerification = {
    setup({ container, onVerified }) {
      const form = container.querySelector("form");
      const code = container.querySelector("[data-verification-code]");
      const emailCopy = container.querySelector("[data-verification-email]");
      const error = container.querySelector("[data-verification-error]");
      const resend = container.querySelector("[data-resend-code]");
      let email = "";

      code.addEventListener("input", () => { code.value = code.value.replace(/\D/gu, "").slice(0, 5); });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        error.textContent = "";
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        try {
          const response = await fetch("/api/account/verify-email", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, code: code.value }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to verify your email.");
          await onVerified(data);
        } catch (caught) {
          error.textContent = caught.message || "Unable to verify your email.";
          button.disabled = false;
        }
      });

      resend.addEventListener("click", async () => {
        error.textContent = "";
        resend.disabled = true;
        try {
          const response = await fetch("/api/account/resend-code", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to send another code.");
          error.textContent = "A new code is on the way.";
        } catch (caught) {
          error.textContent = caught.message || "Unable to send another code.";
        } finally {
          window.setTimeout(() => { resend.disabled = false; }, 60_000);
        }
      });

      return {
        show(details) {
          email = details.email;
          emailCopy.textContent = details.maskedEmail || details.email;
          container.hidden = false;
          code.focus();
        },
      };
    },
  };
})();
