(() => {
  "use strict";

  const dialog = document.querySelector("#callbackDialog");
  const openButton = document.querySelector("#openCallback");
  const closeButton = document.querySelector("#closeCallback");
  const form = document.querySelector("#callbackForm");
  const dateInput = document.querySelector("#callbackDate");
  const timeSelect = document.querySelector("#callbackTime");
  const status = document.querySelector("#callbackStatus");
  const contactMenu = document.querySelector(".contact-menu");

  if (!(dialog instanceof HTMLDialogElement) || !(form instanceof HTMLFormElement) || !(dateInput instanceof HTMLInputElement) || !(timeSelect instanceof HTMLSelectElement)) return;

  const centralDate = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  };

  const currentCentralMinutes = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return Number(value.hour) * 60 + Number(value.minute);
  };

  const labelForMinutes = (minutes) => {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  for (let minutes = 9 * 60; minutes <= 21 * 60; minutes += 30) {
    const option = document.createElement("option");
    option.value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    option.textContent = labelForMinutes(minutes);
    timeSelect.append(option);
  }

  dateInput.min = centralDate();

  const refreshTimeAvailability = () => {
    const today = centralDate();
    const nowMinutes = currentCentralMinutes();
    for (const option of Array.from(timeSelect.options).slice(1)) {
      const [hour, minute] = option.value.split(":").map(Number);
      option.disabled = dateInput.value === today && hour * 60 + minute <= nowMinutes;
    }
    if (timeSelect.selectedOptions[0]?.disabled) timeSelect.value = "";
  };

  dateInput.addEventListener("change", refreshTimeAvailability);

  openButton?.addEventListener("click", () => {
    contactMenu?.removeAttribute("open");
    dateInput.min = centralDate();
    refreshTimeAvailability();
    dialog.showModal();
    dateInput.focus();
  });
  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "callback-status";
    status.textContent = "Scheduling your callback…";
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;

    const values = new FormData(form);
    try {
      const response = await fetch("/api/callbacks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: values.get("date"),
          time: values.get("time"),
          name: values.get("name"),
          phone: values.get("phone"),
          email: values.get("email"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t schedule that callback. Please try again.");
      form.reset();
      dateInput.min = centralDate();
      status.className = "callback-status success";
      status.textContent = `You’re scheduled for ${result.dateLabel} at ${result.timeLabel} Central.`;
    } catch (caught) {
      status.className = "callback-status error";
      status.textContent = caught instanceof Error ? caught.message : "We couldn’t schedule that callback. Please try again.";
    } finally {
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
    }
  });
})();
