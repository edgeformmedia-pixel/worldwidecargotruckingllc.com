(() => {
  "use strict";

  const STORAGE_KEY = "wcx_driver_application_v1";
  const state = {
    driverType: "",
    id: "",
    editToken: "",
    step: 0,
    submitted: false,
    answers: {},
  };
  let captchaToken = "";
  let captchaWidgetId = null;
  let turnstileSiteKey = "";

  const ui = {
    card: document.querySelector("#questionCard"),
    completion: document.querySelector("#completion"),
    form: document.querySelector("#questionForm"),
    answer: document.querySelector("#answerArea"),
    title: document.querySelector("#questionTitle"),
    help: document.querySelector("#questionHelp"),
    label: document.querySelector("#stepLabel"),
    error: document.querySelector("#formError"),
    next: document.querySelector("#continueButton"),
    back: document.querySelector("#backButton"),
    progressWrap: document.querySelector("#progressWrap"),
    progressBar: document.querySelector("#progressBar"),
    progressText: document.querySelector("#progressText"),
    saveStatus: document.querySelector("#saveStatus"),
    accountForm: document.querySelector("#activateAccountForm"),
    accountIntro: document.querySelector("#accountIntro"),
    accountError: document.querySelector("#accountError"),
    existingAccountLink: document.querySelector("#existingAccountLink"),
    newPassword: document.querySelector("#newPassword"),
    confirmPassword: document.querySelector("#confirmPassword"),
    verification: document.querySelector("#applicationVerification"),
  };

  const verification = window.WCXEmailVerification.setup({
    container: ui.verification,
    onVerified: async () => { window.location.assign("../account/index.html"); },
  });

  const choices = {
    driverType: [
      ["owner_operator", "Owner-operator", "I operate my own truck"],
      ["company_driver", "Company driver", "I want to drive company equipment"],
    ],
    gender: [
      ["female", "Female"], ["male", "Male"], ["non_binary", "Non-binary"], ["prefer_not_to_say", "Prefer not to say"],
    ],
    experience: [
      ["under_1", "Less than 1 year"], ["1_plus", "1+ year"], ["2_plus", "2+ years"], ["3_plus", "3+ years"], ["4_plus", "4+ years"],
    ],
    yesNo: [["yes", "Yes"], ["no", "No"]],
    availability: [["tomorrow", "Tomorrow"], ["this_week", "This week"], ["more_than_week", "More than a week from now"]],
  };

  const commonSteps = [
    { field: "full_name", label: "About you", title: "Let’s start with your name.", help: "Enter your full legal name.", type: "text", inputType: "text", placeholder: "Full name", autocomplete: "name" },
    { field: "phone", label: "Contact details", title: "What’s the best phone number to reach you?", help: "Include your area code.", type: "text", inputType: "tel", placeholder: "(555) 555-5555", autocomplete: "tel" },
    { field: "email", label: "Contact details", title: "What’s your email address?", help: "We’ll use this only to contact you about your application.", type: "text", inputType: "email", placeholder: "you@example.com", autocomplete: "email" },
    { field: "gender", label: "About you", title: "How do you describe your gender?", help: "Choose the option that fits you best.", type: "choices", options: choices.gender },
  ];

  const ownerSteps = [
    { field: "experience", label: "Owner-operator", title: "How many years of driving experience do you have?", help: "Choose your total professional truck-driving experience.", type: "choices", options: choices.experience },
    { field: "truck_year", label: "Your equipment", title: "What year was your truck made?", help: "Enter the four-digit model year.", type: "text", inputType: "number", placeholder: "2022", inputMode: "numeric" },
    { field: "truck_mileage", label: "Your equipment", title: "How many miles are on your truck?", help: "An estimate is okay. Enter numbers only.", type: "text", inputType: "number", placeholder: "350000", inputMode: "numeric" },
    { field: "has_plate", label: "Your equipment", title: "Do you currently have a plate for your truck?", help: "Choose yes or no.", type: "choices", options: choices.yesNo },
  ];

  const companySteps = [
    { field: "experience", label: "Driving experience", title: "How many years of driving experience do you have?", help: "Choose your total professional truck-driving experience.", type: "choices", options: choices.experience },
    { field: "amazon_relay_experience", label: "Driving experience", title: "Do you have experience with Amazon Relay?", help: "Choose yes or no.", type: "choices", options: choices.yesNo },
    { field: "start_availability", label: "Availability", title: "When can you start?", help: "Choose the earliest option that works for you.", type: "choices", options: choices.availability },
  ];

  function steps() {
    if (!state.driverType) return [];
    return [...commonSteps, ...(state.driverType === "owner_operator" ? ownerSteps : companySteps), { field: "cdl_upload", label: "Optional documents", title: "Want to get ahead?", help: "You can securely upload your CDL and DOT medical card now, or continue without them.", type: "documents" }, { type: "review" }];
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object" || saved.submitted) return;
      Object.assign(state, saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  let saveChain = Promise.resolve();
  function queueSave(field, value) {
    if (!state.id || !state.editToken) return Promise.resolve();
    state.answers[field] = value;
    persist();
    ui.saveStatus.textContent = "Saving…";
    ui.saveStatus.className = "saving";
    saveChain = saveChain
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch(`/api/applications/${state.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ editToken: state.editToken, field, value, currentStep: state.step }),
        });
        if (!response.ok) throw new Error("Unable to save");
        ui.saveStatus.textContent = "Saved";
        ui.saveStatus.className = "";
      })
      .catch(() => {
        ui.saveStatus.textContent = "Not saved — retrying";
        ui.saveStatus.className = "save-error";
        throw new Error("Unable to save");
      });
    return saveChain;
  }

  async function createDraft(driverType) {
    ui.error.textContent = "";
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ driverType }),
    });
    if (!response.ok) throw new Error("We couldn’t start your application. Please try again.");
    const data = await response.json();
    Object.assign(state, { driverType, id: data.id, editToken: data.editToken, step: 0, answers: {} });
    persist();
    render();
  }

  function makeChoices(options, selected, onChoose) {
    for (const [value, text, detail] of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `choice${selected === value ? " selected" : ""}`;
      const copy = document.createElement("span");
      copy.textContent = text;
      if (detail) {
        const small = document.createElement("small");
        small.textContent = detail;
        copy.append(small);
      }
      button.append(copy);
      button.addEventListener("click", () => onChoose(value, button));
      ui.answer.append(button);
    }
  }

  function renderStart() {
    ui.progressWrap.hidden = true;
    ui.back.hidden = true;
    ui.label.textContent = "First, choose the opportunity that fits you.";
    ui.title.textContent = "Are you an owner-operator or a company driver?";
    ui.help.textContent = "By entering your information, you agree that Worldwide Cargo Express may contact you about this driver job opportunity. We’ll tailor the next few questions to your selection.";
    ui.next.hidden = true;
    makeChoices(choices.driverType, "", async (value, button) => {
      document.querySelectorAll(".choice").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      button.disabled = true;
      try { await createDraft(value); } catch (error) { ui.error.textContent = error.message; button.disabled = false; }
    });
  }

  function renderInput(step) {
    const input = document.createElement("input");
    input.className = "text-input";
    input.type = step.inputType;
    input.placeholder = step.placeholder;
    input.autocomplete = step.autocomplete || "off";
    if (step.inputMode) input.inputMode = step.inputMode;
    if (step.field === "truck_year") { input.min = "1980"; input.max = String(new Date().getFullYear() + 1); }
    if (step.field === "truck_mileage") input.min = "0";
    input.value = state.answers[step.field] || "";
    input.addEventListener("input", () => {
      let value = input.value;
      if (step.field === "truck_year") value = value.replace(/\D/g, "").slice(0, 4);
      if (step.field === "truck_mileage") value = value.replace(/\D/g, "").slice(0, 12);
      if (input.value !== value) input.value = value;
      queueSave(step.field, value);
    });
    ui.answer.append(input);
    const note = document.createElement("p");
    note.className = "input-note";
    note.textContent = "Saved automatically as you type";
    ui.answer.append(note);
    ui.next.hidden = false;
    setTimeout(() => input.focus(), 50);
  }

  function renderDocuments() {
    const choice = state.answers.cdl_upload || "";
    makeChoices([["yes", "Yes, upload my documents"], ["no", "No, continue without them"]], choice, (value) => {
      state.answers.cdl_upload = value;
      persist();
      render();
    });
    if (choice !== "yes") { ui.next.hidden = false; return; }

    const consent = document.createElement("label");
    consent.className = "document-consent";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.required = true;
    checkbox.checked = state.answers.cdl_consent === "yes";
    checkbox.addEventListener("change", () => {
      state.answers.cdl_consent = checkbox.checked ? "yes" : "";
      persist();
    });
    const copy = document.createElement("span");
    copy.textContent = "I agree to the secure processing of my CDL and medical card solely to evaluate my driver application.";
    consent.append(checkbox, copy);

    function uploadControl(kind, label) {
      const wrap = document.createElement("div");
      wrap.className = "document-upload-group";
      const heading = document.createElement("strong");
      heading.textContent = label;
      let expiration;
      if (kind === "medical-card") {
        expiration = document.createElement("input");
        expiration.className = "document-input";
        expiration.type = "date";
        expiration.setAttribute("aria-label", "Medical card expiration date");
        expiration.value = state.answers.medical_card_expiration || "";
        expiration.addEventListener("input", () => {
          state.answers.medical_card_expiration = expiration.value;
          persist();
        });
      }
      const input = document.createElement("input");
      input.className = "document-input";
      input.type = "file";
      input.accept = "application/pdf,image/jpeg,image/png";
      input.setAttribute("aria-label", `Upload ${label}`);
      const note = document.createElement("p");
      note.className = "input-note";
      note.textContent = kind === "medical-card" ? "Enter the expiration date, then choose a JPG, PNG, or PDF up to 5 MB." : "Choose a JPG, PNG, or PDF up to 5 MB.";
      const status = document.createElement("p");
      status.className = "input-note document-status";
      if (state.answers[`${kind}_uploaded`] === "yes") status.textContent = `${label} uploaded.`;
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (!checkbox.checked) { status.textContent = "Please confirm consent before uploading."; input.value = ""; return; }
        if (expiration && !expiration.value) { status.textContent = "Enter the medical card expiration date first."; input.value = ""; expiration.focus(); return; }
        if (file.size > 5 * 1024 * 1024) { status.textContent = "Choose a file smaller than 5 MB."; input.value = ""; return; }
        const data = new FormData();
        data.append("editToken", state.editToken);
        data.append("consent", "yes");
        data.append("file", file);
        if (expiration) data.append("expiration", expiration.value);
        input.disabled = true;
        if (expiration) expiration.disabled = true;
        ui.next.disabled = true;
        status.textContent = "Uploading securely…";
        try {
          const response = await fetch(`/api/applications/${state.id}/documents/${kind}`, { method: "POST", body: data });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Upload failed.");
          state.answers[`${kind}_uploaded`] = "yes";
          persist();
          status.textContent = `${label} uploaded.`;
        } catch (error) {
          status.textContent = error.message || "Upload failed. Please try again.";
          input.disabled = false;
          if (expiration) expiration.disabled = false;
        } finally { ui.next.disabled = false; }
      });
      wrap.append(heading);
      if (expiration) wrap.append(expiration);
      wrap.append(input, note, status);
      return wrap;
    }

    ui.answer.append(consent, uploadControl("cdl", "CDL"), uploadControl("medical-card", "DOT medical card"));
    ui.next.hidden = false;
  }

  function renderChoices(step) {
    makeChoices(step.options, state.answers[step.field] || "", (value) => {
      state.answers[step.field] = value;
      queueSave(step.field, value);
      state.step += 1;
      persist();
      render();
    });
    ui.next.hidden = true;
  }

  const labels = {
    driverType: { owner_operator: "Owner-operator", company_driver: "Company driver" },
    gender: { female: "Female", male: "Male", non_binary: "Non-binary", prefer_not_to_say: "Prefer not to say" },
    experience: { under_1: "Less than 1 year", "1_plus": "1+ year", "2_plus": "2+ years", "3_plus": "3+ years", "4_plus": "4+ years" },
    yesNo: { yes: "Yes", no: "No" },
    availability: { tomorrow: "Tomorrow", this_week: "This week", more_than_week: "More than a week" },
  };

  function answerLabel(field, value) {
    if (field === "gender") return labels.gender[value] || value;
    if (field === "experience") return labels.experience[value] || value;
    if (field === "has_plate" || field === "amazon_relay_experience") return labels.yesNo[value] || value;
    if (field === "start_availability") return labels.availability[value] || value;
    if (field === "truck_mileage" && value) return `${Number(value).toLocaleString()} miles`;
    return value || "—";
  }

  function renderReview() {
    ui.label.textContent = "Final step";
    ui.title.textContent = "Review your application.";
    ui.help.textContent = "Use Back to make a change, or submit when everything looks right.";
    const items = [
      ["Driver type", labels.driverType[state.driverType]], ["Name", state.answers.full_name], ["Phone", state.answers.phone],
      ["Email", state.answers.email], ["Gender", answerLabel("gender", state.answers.gender)], ["Experience", answerLabel("experience", state.answers.experience)],
    ];
    if (state.driverType === "owner_operator") {
      items.push(["Truck year", state.answers.truck_year], ["Truck mileage", answerLabel("truck_mileage", state.answers.truck_mileage)], ["Has plate", answerLabel("has_plate", state.answers.has_plate)]);
    } else {
      items.push(["Amazon Relay", answerLabel("amazon_relay_experience", state.answers.amazon_relay_experience)], ["Can start", answerLabel("start_availability", state.answers.start_availability)]);
    }
    const review = document.createElement("div");
    review.className = "review";
    for (const [label, value] of items) {
      const item = document.createElement("div");
      item.className = "review-item";
      const heading = document.createElement("span"); heading.textContent = label;
      const answer = document.createElement("strong"); answer.textContent = value || "—";
      item.append(heading, answer); review.append(item);
    }
    ui.answer.append(review);
    const captcha = document.createElement("div");
    captcha.className = "captcha-wrap";
    captcha.innerHTML = '<p class="input-note">Complete this security check before submitting.</p>';
    const widget = document.createElement("div");
    captcha.append(widget);
    ui.answer.append(captcha);
    renderCaptcha(widget);
    ui.next.textContent = "Submit application";
    ui.next.hidden = false;
  }

  async function renderCaptcha(container) {
    try {
      if (!turnstileSiteKey) {
        const response = await fetch("/api/config", { cache: "force-cache" });
        const data = await response.json();
        if (!response.ok || !data.turnstileSiteKey) throw new Error();
        turnstileSiteKey = data.turnstileSiteKey;
      }
      for (let attempt = 0; attempt < 50 && !window.turnstile; attempt += 1) await new Promise((resolve) => window.setTimeout(resolve, 100));
      if (!window.turnstile || !container.isConnected) throw new Error();
      captchaWidgetId = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: "light",
        callback: (token) => { captchaToken = token; ui.error.textContent = ""; },
        "expired-callback": () => { captchaToken = ""; },
        "error-callback": () => { captchaToken = ""; },
      });
    } catch {
      ui.error.textContent = "The security check could not load. Refresh the page and try again.";
    }
  }

  function validate(step) {
    const value = String(state.answers[step.field] || "").trim();
    if (!value) return "Please answer this question to continue.";
    if (step.field === "cdl_upload" && value === "yes" && state.answers.cdl_consent !== "yes") return "Please check the consent box to continue, or choose No.";
    if (step.field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) return "Enter a valid email address.";
    if (step.field === "phone" && value.replace(/\D/g, "").length < 10) return "Enter a valid phone number with area code.";
    if (step.field === "truck_year") {
      const year = Number(value);
      if (year < 1980 || year > new Date().getFullYear() + 1) return "Enter a valid four-digit truck year.";
    }
    return "";
  }

  async function submitFinal() {
    if (!captchaToken) throw new Error("Please complete the CAPTCHA before submitting.");
    ui.next.disabled = true;
    ui.next.textContent = "Submitting…";
    await saveChain.catch(() => undefined);
    const response = await fetch(`/api/applications/${state.id}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ editToken: state.editToken, captchaToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to submit your application.");
    state.submitted = true;
    localStorage.removeItem(STORAGE_KEY);
    ui.card.hidden = true;
    ui.progressWrap.hidden = true;
    ui.completion.hidden = false;
    if (data.accountStatus === "active") {
      ui.accountIntro.textContent = "Your application is connected to an existing account. Sign in to track its status and view load offers.";
      ui.accountForm.hidden = true;
      ui.existingAccountLink.hidden = false;
    }
  }

  function render() {
    if (captchaWidgetId !== null && window.turnstile) {
      try { window.turnstile.remove(captchaWidgetId); } catch { /* Widget was already removed. */ }
    }
    captchaWidgetId = null;
    captchaToken = "";
    ui.answer.replaceChildren();
    ui.error.textContent = "";
    ui.next.disabled = false;
    ui.next.textContent = "Continue →";
    if (!state.driverType) { renderStart(); return; }
    const allSteps = steps();
    state.step = Math.max(0, Math.min(state.step, allSteps.length - 1));
    persist();
    const step = allSteps[state.step];
    ui.progressWrap.hidden = false;
    ui.back.hidden = false;
    ui.progressText.textContent = `Step ${state.step + 1} of ${allSteps.length}`;
    ui.progressBar.style.width = `${((state.step + 1) / allSteps.length) * 100}%`;
    ui.label.textContent = step.label || "Review";
    ui.title.textContent = step.title || "Review your application.";
    ui.help.textContent = step.help || "";
    if (step.type === "text") renderInput(step);
    else if (step.type === "documents") renderDocuments();
    else if (step.type === "choices") renderChoices(step);
    else renderReview();
  }

  ui.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.error.textContent = "";
    const step = steps()[state.step];
    if (step.type === "review") {
      try { await submitFinal(); } catch (error) {
        ui.error.textContent = error.message;
        ui.next.disabled = false;
        ui.next.textContent = "Submit application";
        captchaToken = "";
        if (captchaWidgetId !== null && window.turnstile) window.turnstile.reset(captchaWidgetId);
      }
      return;
    }
    const validationError = validate(step);
    if (validationError) { ui.error.textContent = validationError; return; }
    await saveChain.catch(() => undefined);
    state.step += 1;
    persist();
    render();
  });

  ui.back.addEventListener("click", () => {
    if (state.step > 0) state.step -= 1;
    else {
      localStorage.removeItem(STORAGE_KEY);
      Object.assign(state, { driverType: "", id: "", editToken: "", step: 0, answers: {} });
    }
    render();
  });

  ui.accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.accountError.textContent = "";
    const button = ui.accountForm.querySelector("button");
    button.disabled = true;
    try {
      const response = await fetch("/api/account/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "application", sourceId: state.id, editToken: state.editToken, password: ui.newPassword.value, confirmPassword: ui.confirmPassword.value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to activate your account.");
      ui.accountForm.hidden = true;
      ui.accountIntro.textContent = "Check your email to finish activating your account.";
      verification.show(data);
    } catch (error) {
      ui.accountError.textContent = error.message;
      button.disabled = false;
    }
  });

  restore();
  render();
})();
