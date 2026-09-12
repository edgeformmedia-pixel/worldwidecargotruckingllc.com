(() => {
  "use strict";
  const requestView = document.querySelector("#requestView");
  const resetView = document.querySelector("#resetView");
  const doneView = document.querySelector("#doneView");
  const requestForm = document.querySelector("#requestForm");
  const resetForm = document.querySelector("#resetForm");
  const emailInput = document.querySelector("#recoveryEmail");
  const codeInput = document.querySelector("#resetCode");
  const requestError = document.querySelector("#requestError");
  const resetError = document.querySelector("#resetError");
  let email = "";

  codeInput.addEventListener("input", () => { codeInput.value = codeInput.value.replace(/\D/gu, "").slice(0, 5); });

  async function sendCode() {
    const response = await fetch("/api/account/request-password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to send a reset code.");
    requestView.hidden = true;
    resetView.hidden = false;
    document.querySelector("#resetMessage").textContent = data.message;
    codeInput.focus();
  }

  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault(); requestError.textContent = ""; email = emailInput.value.trim(); const button = requestForm.querySelector("button"); button.disabled = true;
    try { await sendCode(); } catch (caught) { requestError.textContent = caught.message; } finally { button.disabled = false; }
  });

  document.querySelector("#requestAnother").addEventListener("click", async (event) => {
    resetError.textContent = ""; event.currentTarget.disabled = true;
    try { await sendCode(); resetError.textContent = "A new code is on the way."; } catch (caught) { resetError.textContent = caught.message; }
    window.setTimeout(() => { event.currentTarget.disabled = false; }, 60_000);
  });

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault(); resetError.textContent = ""; const button = resetForm.querySelector("button"); button.disabled = true;
    try {
      const response = await fetch("/api/account/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, code: codeInput.value, password: document.querySelector("#resetPassword").value, confirmPassword: document.querySelector("#resetConfirmPassword").value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset your password.");
      resetView.hidden = true; doneView.hidden = false;
    } catch (caught) { resetError.textContent = caught.message; button.disabled = false; }
  });
})();
