(() => {
  "use strict";
  const KEY = "wcx_quote_draft_v1";
  const state = { id: "", editToken: "", requesterType: "", answers: {} };
  const roleCard = document.querySelector("#roleCard");
  const roleError = document.querySelector("#roleError");
  const form = document.querySelector("#quoteForm");
  const formError = document.querySelector("#quoteError");
  const success = document.querySelector("#quoteSuccess");
  const mcField = document.querySelector("#mcField");
  const accountForm = document.querySelector("#quoteAccountForm");
  const accountError = document.querySelector("#quoteAccountError");
  let saveChain = Promise.resolve();

  function persist() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function restore() { try { const saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved?.id && saved?.editToken) Object.assign(state, saved); } catch { localStorage.removeItem(KEY); } }
  async function begin(requesterType) {
    const response = await fetch("/api/quotes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requesterType }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to begin your quote.");
    Object.assign(state, { id: data.id, editToken: data.editToken, requesterType, answers: {} }); persist(); showForm();
  }
  function showForm() {
    roleCard.hidden = true; form.hidden = false; mcField.hidden = state.requesterType !== "broker";
    form.querySelectorAll("[data-field]").forEach((field) => { field.value = state.answers[field.dataset.field] || ""; });
  }
  function save(field, value) {
    state.answers[field] = value; persist();
    saveChain = saveChain.catch(() => undefined).then(async () => {
      const response = await fetch(`/api/quotes/${state.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ editToken: state.editToken, field, value, currentStep: 1 }) });
      if (!response.ok) throw new Error("Unable to save quote draft.");
    });
  }
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", async () => {
    roleError.textContent = ""; button.disabled = true;
    try { await begin(button.dataset.role); } catch (error) { roleError.textContent = error.message; button.disabled = false; }
  }));
  form.querySelectorAll("[data-field]").forEach((field) => {
    const eventName = field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, () => {
      let value = field.value;
      if (field.dataset.field === "total_weight" || field.dataset.field === "piece_count") { value = value.replace(/\D/g, "").slice(0, 20); field.value = value; }
      save(field.dataset.field, value);
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); formError.textContent = "";
    if (!form.reportValidity()) return;
    if (state.requesterType === "broker" && !state.answers.mc_number?.trim()) { formError.textContent = "Enter the broker MC number."; return; }
    const button = form.querySelector("button[type=submit]"); button.disabled = true;
    try {
      await saveChain;
      const response = await fetch(`/api/quotes/${state.id}/submit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ editToken: state.editToken }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to submit quote.");
      localStorage.removeItem(KEY); form.hidden = true; success.hidden = false;
      if (data.accountStatus === "active") { document.querySelector("#quoteAccountIntro").textContent = "This quote is connected to your existing account."; accountForm.hidden = true; document.querySelector("#quoteExistingLink").hidden = false; }
    } catch (error) { formError.textContent = error.message; button.disabled = false; }
  });
  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault(); accountError.textContent = ""; const button = accountForm.querySelector("button"); button.disabled = true;
    try {
      const response = await fetch("/api/account/activate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source: "quote", sourceId: state.id, editToken: state.editToken, password: document.querySelector("#quotePassword").value, confirmPassword: document.querySelector("#quoteConfirmPassword").value }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to activate account."); window.location.assign("../account/index.html");
    } catch (error) { accountError.textContent = error.message; button.disabled = false; }
  });
  document.querySelectorAll('input[type="date"]').forEach((input) => { input.min = new Date().toISOString().slice(0, 10); });
  restore(); if (state.id) showForm();
})();
