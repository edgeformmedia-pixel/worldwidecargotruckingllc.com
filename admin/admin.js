(() => {
  "use strict";

  const q = (selector) => document.querySelector(selector);
  const ui = {
    login: q("#loginView"), dashboard: q("#dashboard"), loginCard: q("#loginCard"), accessCard: q("#accessCard"), loginForm: q("#loginForm"), adminEmail: q("#adminEmail"), password: q("#password"), loginError: q("#loginError"), forgotPassword: q("#forgotPassword"), accessForm: q("#accessForm"), accessPassword: q("#accessPassword"), accessConfirmPassword: q("#accessConfirmPassword"), accessError: q("#accessError"), logout: q("#logoutButton"), refresh: q("#refreshButton"), updated: q("#lastUpdated"), nav: q("#mainNav"), sidebar: q(".sidebar"), mobileMenu: q("#mobileMenu"), viewTitle: q("#viewTitle"), viewEyebrow: q("#viewEyebrow"), currentAdminName: q("#currentAdminName"), currentAdminEmail: q("#currentAdminEmail"),
    homeView: q("#homeView"), driversView: q("#driversView"), quotesView: q("#quotesView"), emailView: q("#emailView"), usersView: q("#usersView"), usersNav: q("#usersNav"), feedbackView: q("#feedbackView"), navFeedbackCount: q("#navFeedbackCount"), feedbackForm: q("#feedbackForm"), feedbackKind: q("#feedbackKind"), feedbackTitle: q("#feedbackTitle"), feedbackBody: q("#feedbackBody"), feedbackError: q("#feedbackError"), feedbackStatusFilter: q("#feedbackStatusFilter"), feedbackList: q("#feedbackList"), untouchedToggle: q("#untouchedToggle"), untouchedCount: q("#untouchedCount"), untouchedSection: q("#untouchedSection"), untouchedColumn: q("#untouchedColumn"), untouchedColumnCount: q("#untouchedColumnCount"), activeCount: q("#activeCount"), phoneCount: q("#phoneCount"), docsCount: q("#docsCount"), readyCount: q("#readyCount"), navDriverCount: q("#navDriverCount"), navQuoteCount: q("#navQuoteCount"), navUserCount: q("#navUserCount"), attentionList: q("#attentionList"), homeQuoteList: q("#homeQuoteList"),
    driverSearch: q("#driverSearch"), applicationStatusFilter: q("#applicationStatusFilter"), driverTypeFilter: q("#driverTypeFilter"), documentFilter: q("#documentFilter"), phoneColumn: q("#phoneColumn"), docsColumn: q("#docsColumn"), readyColumn: q("#readyColumn"), processedColumn: q("#processedColumn"), partnerColumn: q("#partnerColumn"), callbackColumn: q("#callbackColumn"), orientationColumn: q("#orientationColumn"), orientationColumnCount: q("#orientationColumnCount"), phoneColumnCount: q("#phoneColumnCount"), docsColumnCount: q("#docsColumnCount"), readyColumnCount: q("#readyColumnCount"), processedColumnCount: q("#processedColumnCount"), partnerColumnCount: q("#partnerColumnCount"), callbackColumnCount: q("#callbackColumnCount"), archiveToggle: q("#archiveToggle"), archiveCount: q("#archiveCount"), pipeline: q("#pipeline"), archiveView: q("#archiveView"), archiveGrid: q("#archiveGrid"), activeDriverList: q("#activeDriverList"), activeDriverPayout: q("#activeDriverPayout"),
    quoteSearch: q("#quoteSearch"), quoteStatusFilter: q("#quoteStatusFilter"), quotesBody: q("#quotesBody"), quotesEmpty: q("#quotesEmpty"), outboundEmailForm: q("#outboundEmailForm"), emailSenderProfile: q("#emailSenderProfile"), outboundTo: q("#outboundTo"), outboundSubject: q("#outboundSubject"), outboundMessage: q("#outboundMessage"), outboundEmailError: q("#outboundEmailError"), sendOutboundEmail: q("#sendOutboundEmail"), emailSettingsForm: q("#emailSettingsForm"), defaultSenderProfile: q("#defaultSenderProfile"), defaultReplyTo: q("#defaultReplyTo"), emailSettingsError: q("#emailSettingsError"), outboundEmailHistory: q("#outboundEmailHistory"), partnerDialog: q("#partnerDialog"), partnerForm: q("#partnerForm"), partnerDriverName: q("#partnerDriverName"), partnerCompany: q("#partnerCompany"), partnerNote: q("#partnerNote"), partnerError: q("#partnerError"), confirmPartner: q("#confirmPartner"), activateDialog: q("#activateDialog"), activateForm: q("#activateForm"), activateDriverName: q("#activateDriverName"), driverPayout: q("#driverPayout"), driverStartDate: q("#driverStartDate"), paymentDelayWeeks: q("#paymentDelayWeeks"), activateError: q("#activateError"), confirmActivate: q("#confirmActivate"), noteDialog: q("#noteDialog"), noteForm: q("#noteForm"), noteDriverName: q("#noteDriverName"), driverNoteBody: q("#driverNoteBody"), noteError: q("#noteError"), confirmNote: q("#confirmNote"), callbackScheduleDialog: q("#callbackScheduleDialog"), callbackScheduleForm: q("#callbackScheduleForm"), callbackScheduleDriverName: q("#callbackScheduleDriverName"), driverCallbackDate: q("#driverCallbackDate"), driverCallbackTime: q("#driverCallbackTime"), callbackScheduleError: q("#callbackScheduleError"), confirmCallbackSchedule: q("#confirmCallbackSchedule"), userForm: q("#userForm"), userFullName: q("#userFullName"), userEmail: q("#userEmail"), userError: q("#userError"), inviteUserButton: q("#inviteUserButton"), adminUserList: q("#adminUserList"), bootstrapNotice: q("#bootstrapNotice"),
  };

  const viewCopy = { home: ["Recruiting overview", "Home"], drivers: ["Applicant workflow", "View drivers"], quotes: ["Freight opportunities", "Quote requests"], email: ["Company communication", "Outbound email"], users: ["Security and access", "Admin users"], feedback: ["Team board", "Bugs & suggestions"] };
  const experience = { under_1: "Less than 1 year", under_2: "Less than 2 years", under_5: "Less than 5 years", under_10: "Less than 10 years" };
  const stageLabels = { phone_screen: "Phone call", docs_requested: "Documents requested", docs_received: "Documents received", documents_processed: "Documents processed", sold_hired_partner: "Sold / hired for partner", callback_hired: "Call back given", orientation_complete: "Orientation complete" };
  const nextDraftStage = { phone_screen: "docs_requested", docs_requested: "docs_received", docs_received: "documents_processed", documents_processed: "sold_hired_partner", sold_hired_partner: "callback_hired" };
  let applications = [], activeDrivers = [], quotes = [], adminUsers = [], emailProfiles = [], outboundMessages = [], emailSettings = {}, currentAdmin = null, bootstrapSession = false, refreshTimer, activeView = "home", showingArchive = false, feedbackItems = [], showingUntouched = false, partnerTarget = null, activateTarget = null, noteTarget = null, callbackScheduleTarget = null;

  function showLogin() { ui.login.hidden = false; ui.loginCard.hidden = false; ui.accessCard.hidden = true; ui.dashboard.hidden = true; clearInterval(refreshTimer); }
  function isMasterAdmin() { return bootstrapSession || currentAdmin?.role === "master"; }
  function showDashboard(auth = {}) { currentAdmin = auth.user || currentAdmin; bootstrapSession = Boolean(auth.bootstrap ?? currentAdmin?.bootstrap); ui.currentAdminName.textContent = currentAdmin?.fullName || "Administrator"; ui.currentAdminEmail.textContent = currentAdmin?.email || (bootstrapSession ? "First-time setup" : ""); ui.usersNav.hidden = !isMasterAdmin(); ui.login.hidden = true; ui.dashboard.hidden = false; refreshAll(); clearInterval(refreshTimer); refreshTimer = setInterval(refreshAll, 15000); }
  function applicationStage(app) { const stage = app.recruiting_stage || "phone_screen"; return stage === "callback_hired" && app.orientation_completed_at ? "orientation_complete" : stage; }
  // Stage 0: a phone-screen lead nobody has noted, scheduled, or called yet.
  function isUntouched(app) { return applicationStage(app) === "phone_screen" && !(app.notes || []).length && !app.callback_date && !app.callback_completed_at && !app.talked_to_at; }
  function pipelineColumn(app) { return isUntouched(app) ? "untouched" : applicationStage(app); }
  function isExpired(app) { return Boolean(app.medical_card_expiration && app.medical_card_expiration < new Date().toISOString().slice(0, 10)); }
  function readableDate(value, withTime = false) { if (!value) return "—"; const date = new Date(`${value}${String(value).includes("T") && !String(value).endsWith("Z") ? "Z" : ""}`); if (Number.isNaN(date.getTime())) return value; return withTime ? date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }); }
  function centralNow() { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()), values = Object.fromEntries(parts.map((part) => [part.type, part.value])); return { date: `${values.year}-${values.month}-${values.day}`, minutes: Number(values.hour) * 60 + Number(values.minute) }; }
  function timeLabel(value) { if (!value) return ""; const [hourText, minute] = value.split(":"), hour = Number(hourText); return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`; }
  function callbackIsOverdue(app) { if (!app.callback_date || !app.callback_time || app.callback_completed_at) return false; const now = centralNow(), [hour, minute] = app.callback_time.split(":").map(Number); return app.callback_date < now.date || (app.callback_date === now.date && hour * 60 + minute <= now.minutes); }
  function callbackDateLabel(value) { if (!value) return ""; const [year, month, day] = value.split("-").map(Number); return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(new Date(Date.UTC(year, month - 1, day, 12))); }
  function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  const referredSection = element("section", "pipeline-column stage-partner"), referredColumn = element("div", "card-list"), referredCount = element("b", "", "0");
  referredSection.innerHTML = '<header><div><span class="step-number">R</span><div><h3>Referred drivers</h3><p>Drivers referred to a partner</p></div></div></header>';
  referredSection.querySelector("header").append(referredCount); referredSection.append(referredColumn); ui.pipeline.append(referredSection);
  function empty(container, text) { container.replaceChildren(element("div", "empty-column", text)); }

  function switchView(view) {
    activeView = view; showingArchive = false;
    for (const name of ["home", "drivers", "quotes", "email", "users", "feedback"]) ui[`${name}View`].hidden = name !== view;
    ui.nav.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    [ui.viewEyebrow.textContent, ui.viewTitle.textContent] = viewCopy[view];
    ui.sidebar.classList.remove("open");
    if (view === "drivers") { ui.pipeline.hidden = false; ui.archiveView.hidden = true; ui.archiveToggle.firstChild.textContent = "View archive "; }
  }

  function documentBadge(label, received, expired = false) {
    const badge = element("span", `doc-check${received ? " received" : ""}${expired ? " expired" : ""}`);
    badge.textContent = `${received ? expired ? "!" : "✓" : "○"} ${label}`;
    return badge;
  }

  function actionButton(label, className, action, disabled = false) {
    const button = element("button", className, label); button.type = "button"; button.dataset.action = action; button.disabled = disabled; return button;
  }

  function zonedTime(value, timeZone, zoneLabel) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const formatted = new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date);
    return `${formatted}${formatted.includes(zoneLabel) ? "" : ` (${zoneLabel})`}`;
  }

  function driverNotes(app) {
    const notes = Array.isArray(app.notes) ? app.notes : [];
    const details = element("details", "driver-notes"), summary = element("summary", "", `Notes (${notes.length})`), list = element("div", "driver-note-list");
    if (!notes.length) list.append(element("div", "empty-column", "No notes yet."));
    for (const note of notes) {
      const entry = element("article", "driver-note-entry"), body = element("p", "", note.body), meta = element("footer"), author = element("strong", "", note.author_name || "Administrator"), chicago = element("span", "", `Chicago: ${zonedTime(note.created_at, "America/Chicago", "CT")}`), uzbekistan = element("span", "", `Uzbekistan: ${zonedTime(note.created_at, "Asia/Tashkent", "UZT")}`);
      meta.append(author, chicago, uzbekistan); entry.append(body, meta); list.append(entry);
    }
    details.append(summary, list); return details;
  }

  function openNoteDialog(applicationId, driverName) {
    noteTarget = { id: applicationId, full_name: driverName };
    ui.noteDriverName.textContent = `Add a timestamped note for ${driverName || "this driver"}.`;
    ui.noteForm.reset(); ui.noteError.textContent = ""; ui.noteDialog.showModal(); ui.driverNoteBody.focus();
  }

  function answerLabel(value, labels = {}) { return labels[value] || value || "Not answered"; }
  function applicationDetails(app) {
    const details = element("details", "application-details"), summary = element("summary", "", "View application details"), list = element("dl", "application-detail-list");
    const rows = [
      ["Status", app.status === "draft" ? "Incomplete" : "Submitted"],
      ["Driving experience", answerLabel(app.experience, experience)],
      ["Gender", answerLabel(app.gender, { female: "Female", male: "Male", non_binary: "Non-binary", prefer_not_to_say: "Prefer not to say" })],
      ["1099 trucking benefits help", answerLabel(app.benefits_needed, { yes: "Yes — follow up requested", no: "No" })],
    ];
    if (app.driver_type === "owner_operator") rows.push(
      ["Truck year", answerLabel(app.truck_year)],
      ["Truck mileage", app.truck_mileage ? `${Number(app.truck_mileage).toLocaleString()} miles` : "Not answered"],
      ["Has truck plate", answerLabel(app.has_plate, { yes: "Yes", no: "No" })],
    );
    else rows.push(
      ["Amazon Relay experience", answerLabel(app.amazon_relay_experience, { yes: "Yes", no: "No" })],
      ["Start availability", answerLabel(app.start_availability, { tomorrow: "Tomorrow", this_week: "This week", more_than_week: "More than a week" })],
    );
    rows.push(["Last updated", readableDate(app.updated_at, true)]);
    for (const [label, value] of rows) { list.append(element("dt", "", label), element("dd", "", value)); }
    details.append(summary, list); return details;
  }

  function driverCard(app, archived = false) {
    const card = element("details", "driver-card"); card.dataset.id = app.id;
    if (!archived) { card.draggable = true; card.title = "Drag this lead to another pipeline column"; }
    const stage = applicationStage(app);
    const top = element("div", "driver-card-top"), identity = element("div"), name = element("h4", "", app.full_name || "Name not entered"), type = element("span", "type", app.driver_type === "owner_operator" ? "Owner-operator" : "Company driver"), age = element("span", "age", readableDate(app.submitted_at || app.updated_at));
    identity.append(name, type);
    top.append(identity, age);
    const summary = element("summary", "driver-card-summary"); summary.append(top);
    const expanded = element("div", "driver-card-expanded");
    const contact = element("div", "contact");
    if (app.phone) { const phone = element("a", "", app.phone); phone.href = `tel:${app.phone}`; contact.append(phone); }
    if (app.email) { const email = element("a", "", app.email); email.href = `mailto:${app.email}`; contact.append(email); }
    const docs = element("div", "doc-checks"); docs.append(documentBadge("CDL", Boolean(app.cdl_document_uploaded_at)), documentBadge("Medical card", Boolean(app.medical_card_uploaded_at), isExpired(app)));
    expanded.append(contact, docs);
    if (stage === "phone_screen" && app.callback_date && app.callback_time && !app.callback_completed_at) {
      const overdue = callbackIsOverdue(app), appointment = element("div", `callback-appointment${overdue ? " overdue" : ""}`), label = element("span", overdue ? "callback-alert" : "", overdue ? "" : "Callback appointment"), detail = element("strong", "", `${callbackDateLabel(app.callback_date)} at ${timeLabel(app.callback_time)} CT`);
      if (overdue) { const symbol = element("b", "", "!"); symbol.setAttribute("aria-hidden", "true"); label.append(symbol, document.createTextNode("Callback overdue")); appointment.setAttribute("role", "alert"); }
      appointment.append(label, detail); expanded.append(appointment);
    }
    if (app.benefits_needed === "yes") expanded.append(element("p", "benefits-requested", "✓ Benefits follow-up requested"));
    if (app.status === "draft") expanded.append(element("p", "incomplete-note", "This applicant started the form but has not submitted it yet."));
    if (app.medical_card_expiration) expanded.append(element("p", "driver-note", `Medical card expires ${readableDate(app.medical_card_expiration)}${isExpired(app) ? " — expired" : ""}`));
    if (app.partner_company) expanded.append(element("p", "driver-note", `Sold / hired to ${app.partner_company}${app.partner_note ? ` — ${app.partner_note}` : ""}`));
    if (app.orientation_completed_at) expanded.append(element("p", "driver-note", `Orientation completed ${readableDate(app.orientation_completed_at)}`));
    expanded.append(applicationDetails(app), driverNotes(app));
    const actions = element("div", "driver-actions");
    actions.append(actionButton("Add note", "", "add-note"));
    if (!archived) actions.append(actionButton(app.referred_at ? "Return to pipeline" : "Refer driver", "", "toggle-referred"));
    if (!archived && stage === "phone_screen") actions.append(actionButton(app.callback_date && !app.callback_completed_at ? "Reschedule callback" : "Set callback", "", "schedule-callback"));
    if (!archived && stage === "phone_screen" && callbackIsOverdue(app)) { const callbackEmail = actionButton("Send callback email", "next", "send-missed-callback-email", !app.email); if (!app.email) callbackEmail.title = "Applicant email is missing"; actions.append(callbackEmail); }
    // Keep uploaded documents accessible after the applicant changes stages.
    if (app.cdl_document_uploaded_at) actions.append(documentLink(app, "cdl", "View CDL"));
    if (app.medical_card_uploaded_at) actions.append(documentLink(app, "medical-card", "View medical card"));
    if (archived) {
      actions.append(actionButton("Restore", "next", "restore"));
    } else if (app.status === "submitted") {
      const requestMedical = actionButton(isExpired(app) ? "Request updated medical card" : "Request medical card", "", "request-medical-card", Boolean(app.medical_card_uploaded_at) && !isExpired(app));
      if (!app.email) { requestMedical.disabled = true; requestMedical.title = "Applicant email is missing"; }
      actions.append(requestMedical);
      if (stage === "phone_screen") actions.append(actionButton("Callback completed", "next", "request-docs"));
      if (stage === "docs_requested") {
        actions.append(actionButton("Documents complete", "next", "docs-complete", !app.cdl_document_uploaded_at || !app.medical_card_uploaded_at));
      }
      if (stage === "docs_received") actions.append(actionButton("Documents processed", "next", "process-documents"));
      if (stage === "documents_processed") actions.append(actionButton("Record partner hire", "next", "partner-hire"));
      if (stage === "sold_hired_partner") actions.append(actionButton("Call back given", "next", "callback-hired"));
      if (stage === "callback_hired") actions.append(actionButton("Orientation complete", "next", "orientation-complete"));
      if (stage === "orientation_complete") actions.append(actionButton("Add active driver", "next", "activate-driver"), actionButton("Undo orientation", "", "orientation-undo"));
      actions.append(actionButton("Archive", "archive", "archive"));
    } else {
      const nextStage = nextDraftStage[stage];
      if (nextStage) { const override = actionButton(`Override to ${stageLabels[nextStage]}`, "next", "manual-next"); override.dataset.nextStage = nextStage; actions.append(override); }
      actions.append(actionButton("Archive", "archive", "archive"));
    }
    if (actions.childElementCount) expanded.append(actions); card.append(summary, expanded); return card;
  }

  function documentLink(app, kind, label) { const link = element("a", "", label); link.href = `${window.WCX_API_ORIGIN || ""}/api/admin/applications/${app.id}/documents/${kind}`; link.target = "_blank"; link.rel = "noopener"; return link; }

  function filteredApplications(archived) {
    const search = ui.driverSearch.value.trim().toLowerCase(), status = ui.applicationStatusFilter.value, type = ui.driverTypeFilter.value, doc = ui.documentFilter.value;
    return applications.filter((app) => (app.status === "draft" || app.status === "submitted") && Boolean(app.archived_at) === archived && (status === "all" || app.status === status) && (!search || [app.full_name, app.phone, app.email, ...(app.notes || []).flatMap((note) => [note.body, note.author_name])].some((value) => String(value || "").toLowerCase().includes(search))) && (type === "all" || app.driver_type === type) && (doc === "all" || (doc === "missing_cdl" && !app.cdl_document_uploaded_at) || (doc === "missing_medical" && !app.medical_card_uploaded_at) || (doc === "complete" && app.cdl_document_uploaded_at && app.medical_card_uploaded_at) || (doc === "expired" && isExpired(app))));
  }

  function renderDrivers() {
    const active = filteredApplications(false), archived = filteredApplications(true), groups = { untouched: [], referred: [], phone_screen: [], docs_requested: [], docs_received: [], documents_processed: [], sold_hired_partner: [], callback_hired: [], orientation_complete: [] };
    active.forEach((app) => groups[app.referred_at ? "referred" : pipelineColumn(app)].push(app));
    const columns = [[ui.untouchedColumn, ui.untouchedColumnCount, groups.untouched, "No untouched leads."], [ui.phoneColumn, ui.phoneColumnCount, groups.phone_screen, "No applicants are waiting for a call."], [ui.docsColumn, ui.docsColumnCount, groups.docs_requested, "No applicants are waiting on documents."], [ui.readyColumn, ui.readyColumnCount, groups.docs_received, "No complete driver packets yet."], [ui.processedColumn, ui.processedColumnCount, groups.documents_processed, "No processed driver packets yet."], [ui.partnerColumn, ui.partnerColumnCount, groups.sold_hired_partner, "No partner hires recorded yet."], [ui.callbackColumn, ui.callbackColumnCount, groups.callback_hired, "No drivers waiting on orientation."], [ui.orientationColumn, ui.orientationColumnCount, groups.orientation_complete, "No drivers have completed orientation yet."], [referredColumn, referredCount, groups.referred, "No referred drivers."]];
    for (const [container, count, items, message] of columns) { count.textContent = items.length; if (!items.length) empty(container, message); else container.replaceChildren(...items.map((app) => driverCard(app))); }
    ui.untouchedCount.textContent = groups.untouched.length;
    ui.untouchedSection.hidden = !showingUntouched;
    ui.untouchedToggle.firstChild.textContent = showingUntouched ? "Hide untouched leads " : "Show untouched leads ";
    ui.archiveCount.textContent = applications.filter((app) => (app.status === "draft" || app.status === "submitted") && app.archived_at).length;
    if (!archived.length) empty(ui.archiveGrid, "No archived applicants match these filters."); else ui.archiveGrid.replaceChildren(...archived.map((app) => driverCard(app, true)));
    renderActiveDrivers();
  }

  function money(cents) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cents || 0) / 100); }
  function renderActiveDrivers() {
    const active = activeDrivers.filter((driver) => driver.status === "active");
    ui.activeDriverPayout.textContent = money(active.reduce((total, driver) => total + Number(driver.payout_cents || 0), 0));
    if (!activeDrivers.length) { empty(ui.activeDriverList, "No active drivers yet. Complete orientation (step 7) and enter the payout to add one."); return; }
    ui.activeDriverList.replaceChildren(...activeDrivers.map((driver) => {
      const item = element("article", `active-driver${driver.status === "off" ? " off" : ""}`); item.dataset.activeDriverId = driver.id;
      const identity = element("div", "active-driver-identity"), name = element("strong", "", driver.full_name || "Unnamed driver"), detail = element("span", "", `${driver.partner_company || "Partner not recorded"} · Started ${readableDate(driver.driver_start_date)}`), due = element("small", "", `Expected payment ${readableDate(driver.expected_payment_date)} (${driver.payment_delay_weeks} week${Number(driver.payment_delay_weeks) === 1 ? "" : "s"} after start)`);
      identity.append(name, detail, due);
      const payout = element("strong", "active-driver-payout", money(driver.payout_cents));
      const controls = element("div", "active-driver-controls");
      controls.append(actionButton("Add note", "", "add-active-note"));
      if (driver.status === "active") { controls.append(actionButton("Edit payout / start", "", "edit-active-driver"), actionButton("Driver off", "danger", "driver-off")); }
      else controls.append(element("span", "off-pill", `Off ${readableDate(driver.turned_off_at)}`));
      item.append(identity, payout, controls); return item;
    }));
  }

  function attentionItem(title, detail, badge, quote = false) { const item = element("article", "attention-item"), copy = element("div"), strong = element("strong", "", title), p = element("p", "", detail), state = element("span", quote ? "quote-state" : "", badge); copy.append(strong, p); item.append(copy, state); return item; }

  function renderHome() {
    const active = applications.filter((app) => (app.status === "draft" || app.status === "submitted") && !app.archived_at), phone = active.filter((app) => applicationStage(app) === "phone_screen"), docs = active.filter((app) => applicationStage(app) === "docs_requested"), ready = active.filter((app) => applicationStage(app) === "docs_received");
    ui.activeCount.textContent = active.length; ui.phoneCount.textContent = phone.length; ui.docsCount.textContent = docs.length; ui.readyCount.textContent = ready.length; ui.navDriverCount.textContent = active.length; ui.navQuoteCount.textContent = quotes.length;
    const priority = [...phone.map((app) => attentionItem(app.full_name || "Unnamed applicant", app.status === "draft" ? `Incomplete application · ${app.phone || app.email || "Contact details pending"}` : app.phone || app.email || "Contact details pending", app.status === "draft" ? "Incomplete" : "Call")), ...docs.filter((app) => !app.cdl_document_uploaded_at || !app.medical_card_uploaded_at).map((app) => attentionItem(app.full_name || "Unnamed applicant", `${app.cdl_document_uploaded_at ? "CDL received" : "CDL missing"} · ${app.medical_card_uploaded_at ? "Medical card received" : "Medical card missing"}`, "Documents"))].slice(0, 6);
    if (!priority.length) empty(ui.attentionList, "Nothing urgent right now."); else ui.attentionList.replaceChildren(...priority);
    const recentQuotes = quotes.slice(0, 6).map((quote) => attentionItem(quote.company_name || quote.full_name, `${quote.pickup_city}, ${quote.pickup_state} → ${quote.delivery_city}, ${quote.delivery_state}`, quote.status, true));
    if (!recentQuotes.length) empty(ui.homeQuoteList, "No submitted quote requests yet."); else ui.homeQuoteList.replaceChildren(...recentQuotes);
  }

  function renderQuotes() {
    const search = ui.quoteSearch.value.trim().toLowerCase(), status = ui.quoteStatusFilter.value;
    const visible = quotes.filter((quote) => (status === "all" || quote.status === status) && (!search || [quote.company_name, quote.full_name, quote.email, quote.pickup_city, quote.pickup_state, quote.delivery_city, quote.delivery_state].some((value) => String(value || "").toLowerCase().includes(search))));
    ui.quotesBody.replaceChildren(...visible.map((quote) => {
      const row = document.createElement("tr"), person = element("td", "quote-person"), route = element("td", "quote-route"), freight = document.createElement("td"), pickup = document.createElement("td"), state = document.createElement("td"), updated = document.createElement("td"), name = element("strong", "", quote.company_name || quote.full_name || "No company"), contact = element("small", "", `${quote.full_name || "Contact pending"} · ${quote.email || quote.phone || "No contact"}`), routeName = element("strong", "", `${quote.pickup_city}, ${quote.pickup_state} → ${quote.delivery_city}, ${quote.delivery_state}`), routeDetail = element("small", "", `${quote.pickup_zip || ""} → ${quote.delivery_zip || ""}`), freightName = element("span", "", quote.commodity || "Freight pending"), freightDetail = element("small", "", `${quote.equipment || "Equipment pending"} · ${Number(quote.total_weight || 0).toLocaleString()} lb`), select = element("select", "quote-status");
      person.append(name, contact); route.append(routeName, routeDetail); freight.append(freightName, freightDetail); pickup.textContent = readableDate(quote.pickup_date); ["new", "reviewing", "quoted", "booked", "declined"].forEach((value) => { const option = element("option", "", value[0].toUpperCase() + value.slice(1)); option.value = value; select.append(option); }); select.value = quote.status; select.dataset.quote = quote.id; state.append(select); updated.textContent = readableDate(quote.updated_at, true); row.append(person, route, freight, pickup, state, updated); return row;
    }));
    ui.quotesEmpty.hidden = visible.length !== 0;
  }

  function renderAdminUsers() {
    const senderSelect = q("#userSenderProfile");
    if (senderSelect) senderSelect.replaceChildren(element("option", "", "No email identity yet"), ...emailProfiles.map((profile) => { const option = element("option", "", profile.label); option.value = profile.id; return option; }));
    ui.navUserCount.textContent = adminUsers.filter((user) => user.status !== "disabled").length;
    ui.bootstrapNotice.hidden = !bootstrapSession;
    if (!adminUsers.length) { empty(ui.adminUserList, "No personal administrator accounts yet."); return; }
    ui.adminUserList.replaceChildren(...adminUsers.map((user) => {
      const item = element("article", "admin-user"); item.dataset.userId = user.id;
      const identity = element("div", "admin-user-identity"), name = element("strong", "", user.full_name), email = element("span", "", user.email), meta = element("small", "", user.last_login_at ? `Last signed in ${readableDate(user.last_login_at, true)}` : user.status === "invited" ? `Invited ${readableDate(user.created_at, true)}` : "Has not signed in yet");
      identity.append(name, email, meta);
      const controls = element("div", "admin-user-controls"), status = element("span", `user-status ${user.status}`, user.status);
      controls.append(status);
      if (user.status === "invited") controls.append(actionButton("Resend invite", "", "resend-invite"));
      if (user.status === "active" && user.id !== currentAdmin?.id) controls.append(actionButton("Disable", "danger", "disable-user"));
      if (user.status === "disabled") controls.append(actionButton("Restore", "", "enable-user"));
      if (user.role === "employee") controls.append(actionButton("Delete", "danger", "delete-user"));
      item.append(identity, controls);
      if (user.role === "employee") {
        const access = element("details", "employee-email-access"), summary = element("summary", "", "Email & inbox access"), body = element("div", "email-access-body"), list = element("div", "email-access-list");
        (user.email_profiles || []).forEach((profile) => {
          const chip = element("span", "email-access-chip"), address = element("span", "", profile.sender_email), remove = actionButton("Remove", "email-access-remove", "remove-email-access");
          if (profile.is_default) address.title = "Default personal address";
          remove.dataset.profileId = profile.id;
          remove.dataset.senderEmail = profile.sender_email;
          chip.append(address, remove); list.append(chip);
        });
        const form = element("form", "email-access-add"); form.dataset.action = "add-email-access";
        const label = element("label", "", "Add email access"); label.htmlFor = `emailAccessType-${user.id}`;
        const select = element("select", ""); select.id = `emailAccessType-${user.id}`; select.name = "emailAccessType";
        [["general", "Dispatcher"], ["recruiting", "Support"], ["custom", "Other…"]].forEach(([value, text]) => { const option = element("option", "", text); option.value = value; select.append(option); });
        const custom = element("input", ""); custom.name = "customLocalPart"; custom.placeholder = "support"; custom.maxLength = 64; custom.hidden = true; custom.setAttribute("aria-label", "Custom email name");
        const suffix = element("span", "email-domain", "@worldwidecargoexpressllc.com"); suffix.hidden = true;
        const add = actionButton("Add email", "", "save-email-access"); add.type = "submit";
        form.append(label, select, custom, suffix, add); body.append(list, form); access.append(summary, body); item.append(access);
      }
      return item;
    }));
  }

  function renderOutboundEmail() {
    const fillProfiles = (select) => {
      const selected = select.value;
      select.replaceChildren(...emailProfiles.map((profile) => { const option = element("option", "", profile.label); option.value = profile.id; return option; }));
      select.value = selected || emailSettings.default_sender_profile_id || emailProfiles[0]?.id || "";
    };
    fillProfiles(ui.emailSenderProfile); fillProfiles(ui.defaultSenderProfile);
    ui.defaultSenderProfile.value = emailSettings.default_sender_profile_id || emailProfiles[0]?.id || "";
    if (document.activeElement !== ui.defaultReplyTo) ui.defaultReplyTo.value = emailSettings.default_reply_to || "";
    if (!outboundMessages.length) { empty(ui.outboundEmailHistory, "No outbound email has been sent yet."); return; }
    ui.outboundEmailHistory.replaceChildren(...outboundMessages.map((message) => {
      const item = element("article", "email-history-item"), summary = element("div", "email-history-summary"), subject = element("strong", "", message.subject), meta = element("span", "", `To ${message.recipient_email} · ${message.sender_name}${message.employee_name ? ` · sent by ${message.employee_name}` : ""} · ${readableDate(message.created_at, true)}`), body = element("p", "", message.body_text), status = element("span", `email-status ${message.status}`, message.status === "sent" ? "Sent" : "Delivery failed");
      summary.append(subject, meta, body); item.append(summary, status); return item;
    }));
  }

  const feedbackStatusLabels = { open: "Open", in_progress: "In progress", completed: "Completed" };
  function renderFeedback() {
    const filter = ui.feedbackStatusFilter.value, visible = feedbackItems.filter((item) => filter === "all" || (filter === "open" ? item.status !== "completed" : item.status === filter));
    ui.navFeedbackCount.textContent = feedbackItems.filter((item) => item.status !== "completed").length;
    if (!visible.length) { empty(ui.feedbackList, filter === "completed" ? "Nothing completed yet." : "No open bugs or suggestions."); return; }
    ui.feedbackList.replaceChildren(...visible.map((item) => {
      const row = element("article", `feedback-item ${item.status}`); row.dataset.feedbackId = item.id;
      const head = element("div", "feedback-head"), tags = element("div", "feedback-tags");
      tags.append(element("span", `feedback-kind ${item.kind}`, item.kind === "bug" ? "Bug" : "Suggestion"), element("span", `feedback-status ${item.status}`, item.status === "completed" ? `Completed ${readableDate(item.completed_at)}` : feedbackStatusLabels[item.status]));
      head.append(element("h4", "", item.title), tags); row.append(head);
      if (item.body) row.append(element("p", "feedback-body", item.body));
      if (item.resolution_note) row.append(element("p", "driver-note", item.resolution_note));
      const foot = element("div", "feedback-foot");
      foot.append(element("small", "", `Submitted by ${item.author_name || "Administrator"} · ${readableDate(item.created_at, true)}`));
      if (isMasterAdmin()) foot.append(item.status === "completed" ? actionButton("Reopen", "", "feedback-reopen") : actionButton("Mark complete", "next", "feedback-complete"));
      row.append(foot); return row;
    }));
  }
  async function refreshFeedback() {
    try { const response = await fetch("/api/admin/feedback", { cache: "no-store" }); if (!response.ok) return; feedbackItems = (await response.json()).items || []; renderFeedback(); } catch { /* retried on the next refresh */ }
  }

  function renderAll() { renderHome(); renderDrivers(); renderQuotes(); renderOutboundEmail(); renderAdminUsers(); renderFeedback(); }
  async function patchApplication(id, body) { const response = await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to update applicant."); await refreshAll(); }

  async function refreshAll() {
    try {
      const requests = [fetch("/api/admin/applications", { cache: "no-store" }), fetch("/api/admin/active-drivers", { cache: "no-store" }), fetch("/api/admin/quotes", { cache: "no-store" }), fetch("/api/admin/outbound-email", { cache: "no-store" })]; if (isMasterAdmin()) requests.push(fetch("/api/admin/users", { cache: "no-store" }));
      const responses = await Promise.all(requests), [appsResponse, activeDriversResponse, quotesResponse, emailResponse, usersResponse] = responses;
      if (responses.some((response) => response.status === 401)) { showLogin(); return; }
      if (!appsResponse.ok || !activeDriversResponse.ok || !quotesResponse.ok || !emailResponse.ok || (usersResponse && !usersResponse.ok)) throw new Error();
      const appData = await appsResponse.json(), activeDriverData = await activeDriversResponse.json(), quoteData = await quotesResponse.json(), emailData = await emailResponse.json(), userData = usersResponse ? await usersResponse.json() : {}; applications = appData.applications || []; activeDrivers = activeDriverData.drivers || []; quotes = quoteData.quotes || []; adminUsers = userData.users || []; emailProfiles = emailData.profiles || []; emailSettings = emailData.settings || {}; outboundMessages = emailData.messages || []; currentAdmin = userData.currentUser || currentAdmin; bootstrapSession = Boolean(currentAdmin?.bootstrap); ui.usersNav.hidden = !isMasterAdmin(); ui.currentAdminName.textContent = currentAdmin?.fullName || "Administrator"; ui.currentAdminEmail.textContent = currentAdmin?.email || (bootstrapSession ? "First-time setup" : ""); renderAll(); refreshFeedback(); ui.updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } catch { ui.updated.textContent = "Unable to refresh"; }
  }

  async function driverAction(event) {
    const button = event.target.closest("button[data-action]"), card = event.target.closest("[data-id]"); if (!button || !card) return; const app = applications.find((item) => item.id === card.dataset.id); if (!app) return; button.disabled = true;
    try {
      if (button.dataset.action === "add-note") { openNoteDialog(app.id, app.full_name); button.disabled = false; return; }
      if (button.dataset.action === "schedule-callback") { callbackScheduleTarget = app; ui.callbackScheduleDriverName.textContent = `Choose a callback time for ${app.full_name || "this driver"}.`; ui.callbackScheduleForm.reset(); ui.driverCallbackDate.min = centralNow().date; ui.driverCallbackDate.value = app.callback_date || ""; ui.driverCallbackTime.value = app.callback_time || ""; refreshCallbackTimeAvailability(); ui.callbackScheduleError.textContent = ""; ui.callbackScheduleDialog.showModal(); button.disabled = false; return; }
      if (button.dataset.action === "manual-next") {
        const nextStage = button.dataset.nextStage;
        if (!confirm(`Are you sure? This incomplete application will move to ${stageLabels[nextStage] || "the next stage"}.`)) { button.disabled = false; return; }
        await patchApplication(app.id, { stage: nextStage, manualOverride: true });
      }
      if (button.dataset.action === "request-docs") await patchApplication(app.id, { stage: "docs_requested" });
      if (button.dataset.action === "toggle-referred") await patchApplication(app.id, { referred: !app.referred_at });
      if (button.dataset.action === "docs-complete") await patchApplication(app.id, { stage: "docs_received" });
      if (button.dataset.action === "process-documents") await patchApplication(app.id, { stage: "documents_processed" });
      if (button.dataset.action === "callback-hired") await patchApplication(app.id, { stage: "callback_hired" });
      if (button.dataset.action === "orientation-complete") await patchApplication(app.id, { orientationComplete: true });
      if (button.dataset.action === "orientation-undo") await patchApplication(app.id, { orientationComplete: false });
      if (button.dataset.action === "archive") await patchApplication(app.id, { archive: true });
      if (button.dataset.action === "restore") await patchApplication(app.id, { archive: false });
      if (button.dataset.action === "request-medical-card") {
        const response = await fetch(`/api/admin/applications/${app.id}/request-medical-card`, { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to send the medical card request.");
        alert(data.message || `Medical card request sent to ${app.email}.`);
        button.disabled = false;
      }
      if (button.dataset.action === "send-missed-callback-email") { const response = await fetch(`/api/admin/applications/${app.id}/send-missed-callback-email`, { method: "POST" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to send the callback email."); alert(data.message || `Callback email sent to ${app.email}.`); button.disabled = false; }
      if (button.dataset.action === "partner-hire") { partnerTarget = app; ui.partnerDriverName.textContent = `Record the company ${app.full_name || "this driver"} was sold or hired to.`; ui.partnerCompany.value = app.partner_company || ""; ui.partnerNote.value = app.partner_note || ""; ui.partnerError.textContent = ""; ui.partnerDialog.showModal(); button.disabled = false; }
      if (button.dataset.action === "activate-driver") { activateTarget = app; ui.activateDriverName.textContent = `Enter payout and start date before adding ${app.full_name || "this driver"} to active accounting.`; ui.driverPayout.value = ""; ui.driverStartDate.value = ""; ui.paymentDelayWeeks.value = "1"; ui.activateError.textContent = ""; ui.activateForm.dataset.activeDriverId = ""; ui.activateDialog.showModal(); button.disabled = false; }
    } catch (error) { alert(error.message || "Unable to update applicant."); button.disabled = false; }
  }

  ui.loginForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.loginError.textContent = ""; const button = ui.loginForm.querySelector("button[type='submit']"); button.disabled = true; try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: ui.adminEmail.value, password: ui.password.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Incorrect email or password."); ui.password.value = ""; showDashboard(data); } catch (error) { ui.loginError.textContent = error.message; } finally { button.disabled = false; } });
  ui.forgotPassword.addEventListener("click", async () => { const email = ui.adminEmail.value.trim(); ui.loginError.textContent = ""; if (!email) { ui.loginError.textContent = "Enter your administrator email first."; ui.adminEmail.focus(); return; } ui.forgotPassword.disabled = true; try { const response = await fetch("/api/admin/request-password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); ui.loginError.textContent = data.message || "If that administrator exists, a reset link is on the way."; } catch { ui.loginError.textContent = "Unable to request a reset right now."; } finally { ui.forgotPassword.disabled = false; } });
  ui.accessForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.accessError.textContent = ""; const token = ui.accessForm.dataset.token || ""; const button = ui.accessForm.querySelector("button[type='submit']"); if (ui.accessPassword.value !== ui.accessConfirmPassword.value) { ui.accessError.textContent = "Passwords do not match."; return; } button.disabled = true; try { const response = await fetch("/api/admin/access-token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: ui.accessPassword.value, confirmPassword: ui.accessConfirmPassword.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to activate this account."); history.replaceState(null, "", `${location.pathname}${location.search}`); ui.accessPassword.value = ""; ui.accessConfirmPassword.value = ""; showDashboard(data); switchView("users"); } catch (error) { ui.accessError.textContent = error.message; } finally { button.disabled = false; } });
  ui.userForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.userError.textContent = ""; ui.inviteUserButton.disabled = true; try { const response = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fullName: ui.userFullName.value, email: ui.userEmail.value, senderProfileId: q("#userSenderProfile")?.value || "" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to invite this employee."); ui.userForm.reset(); await refreshAll(); alert(`Invitation sent to ${data.user.email}.`); } catch (error) { ui.userError.textContent = error.message; } finally { ui.inviteUserButton.disabled = false; } });
  ui.adminUserList.addEventListener("change", (event) => { const select = event.target.closest("select[name='emailAccessType']"); if (!select) return; const form = select.closest("form"), isCustom = select.value === "custom"; form.querySelector("input[name='customLocalPart']").hidden = !isCustom; form.querySelector(".email-domain").hidden = !isCustom; });
  ui.adminUserList.addEventListener("submit", async (event) => { const form = event.target.closest("form[data-action='add-email-access']"); if (!form) return; event.preventDefault(); const item = form.closest("[data-user-id]"), button = form.querySelector("button"); button.disabled = true; try { const response = await fetch(`/api/admin/users/${item.dataset.userId}/email-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: form.querySelector("select").value, customLocalPart: form.querySelector("input").value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to add email access."); await refreshAll(); } catch (error) { alert(error.message); button.disabled = false; } });
  ui.adminUserList.addEventListener("click", async (event) => { const button = event.target.closest("button[data-action]"), item = event.target.closest("[data-user-id]"); if (!button || !item || button.dataset.action === "save-email-access") return; const user = adminUsers.find((candidate) => candidate.id === item.dataset.userId); if (button.dataset.action === "delete-user" && !confirm(`Delete ${user?.full_name || "this employee"}? This cannot be undone.`)) return; if (button.dataset.action === "remove-email-access" && !confirm(`Remove ${button.dataset.senderEmail} access for ${user?.full_name || "this employee"}?`)) return; button.disabled = true; try { let response; if (button.dataset.action === "resend-invite") response = await fetch(`/api/admin/users/${item.dataset.userId}/invite`, { method: "POST" }); else if (button.dataset.action === "delete-user") response = await fetch(`/api/admin/users/${item.dataset.userId}`, { method: "DELETE" }); else if (button.dataset.action === "remove-email-access") response = await fetch(`/api/admin/users/${item.dataset.userId}/email-access/${encodeURIComponent(button.dataset.profileId)}`, { method: "DELETE" }); else response = await fetch(`/api/admin/users/${item.dataset.userId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: button.dataset.action === "enable-user" ? "active" : "disabled" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to update this administrator."); await refreshAll(); } catch (error) { alert(error.message); button.disabled = false; } });
  ui.outboundEmailForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.outboundEmailError.textContent = ""; ui.sendOutboundEmail.disabled = true; try { const response = await fetch("/api/admin/outbound-email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ senderProfileId: ui.emailSenderProfile.value, to: ui.outboundTo.value, subject: ui.outboundSubject.value, message: ui.outboundMessage.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to send email."); ui.outboundEmailForm.reset(); await refreshAll(); alert(data.message || "Email sent."); } catch (error) { ui.outboundEmailError.textContent = error.message || "Unable to send email."; } finally { ui.sendOutboundEmail.disabled = false; } });
  ui.emailSettingsForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.emailSettingsError.textContent = ""; const button = ui.emailSettingsForm.querySelector("button[type='submit']"); button.disabled = true; try { const response = await fetch("/api/admin/outbound-email/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ defaultSenderProfileId: ui.defaultSenderProfile.value, defaultReplyTo: ui.defaultReplyTo.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to save defaults."); await refreshAll(); } catch (error) { ui.emailSettingsError.textContent = error.message || "Unable to save defaults."; } finally { button.disabled = false; } });
  ui.feedbackStatusFilter.addEventListener("input", renderFeedback);
  ui.feedbackForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.feedbackError.textContent = ""; const button = ui.feedbackForm.querySelector("button[type='submit']"); button.disabled = true; try { const response = await fetch("/api/admin/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: ui.feedbackKind.value, title: ui.feedbackTitle.value, body: ui.feedbackBody.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to submit."); ui.feedbackForm.reset(); ui.feedbackStatusFilter.value = "open"; await refreshFeedback(); } catch (error) { ui.feedbackError.textContent = error.message || "Unable to submit."; } finally { button.disabled = false; } });
  ui.feedbackList.addEventListener("click", async (event) => { const button = event.target.closest("button[data-action]"), item = event.target.closest("[data-feedback-id]"); if (!button || !item) return; button.disabled = true; try { const response = await fetch(`/api/admin/feedback/${item.dataset.feedbackId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: button.dataset.action === "feedback-complete" ? "completed" : "open" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to update."); await refreshFeedback(); } catch (error) { alert(error.message); button.disabled = false; } });
  ui.logout.addEventListener("click", async () => { await fetch("/api/admin/logout", { method: "POST" }); showLogin(); });
  ui.refresh.addEventListener("click", refreshAll); ui.mobileMenu.addEventListener("click", () => ui.sidebar.classList.toggle("open"));
  ui.nav.addEventListener("click", (event) => { const button = event.target.closest("[data-view]"); if (button) switchView(button.dataset.view); });
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-go]"); if (button) switchView(button.dataset.go); });
  [ui.driverSearch, ui.applicationStatusFilter, ui.driverTypeFilter, ui.documentFilter].forEach((control) => control.addEventListener("input", renderDrivers));
  [ui.quoteSearch, ui.quoteStatusFilter].forEach((control) => control.addEventListener("input", renderQuotes));
  [[ui.phoneColumn, "phone_screen"], [ui.docsColumn, "docs_requested"], [ui.readyColumn, "docs_received"], [ui.processedColumn, "documents_processed"], [ui.partnerColumn, "sold_hired_partner"], [ui.callbackColumn, "callback_hired"], [ui.orientationColumn, "orientation_complete"]].forEach(([column, stage]) => { column.dataset.stage = stage; });
  async function moveDriverToStage(id, stage) { if (stage === "orientation_complete") return patchApplication(id, { orientationComplete: true }); return patchApplication(id, { stage }); }
  function setupPipelineDragAndDrop() { let draggedId = ""; ui.pipeline.addEventListener("dragstart", (event) => { const card = event.target.closest(".driver-card[draggable='true']"); if (!card) return; draggedId = card.dataset.id || ""; event.dataTransfer.setData("text/plain", draggedId); card.classList.add("dragging"); }); ui.pipeline.addEventListener("dragend", (event) => { event.target.closest(".driver-card")?.classList.remove("dragging"); ui.pipeline.querySelectorAll(".card-list.drop-target").forEach((list) => list.classList.remove("drop-target")); }); ui.pipeline.addEventListener("dragover", (event) => { const list = event.target.closest(".card-list[data-stage]"); if (!list) return; event.preventDefault(); list.classList.add("drop-target"); }); ui.pipeline.addEventListener("drop", async (event) => { const list = event.target.closest(".card-list[data-stage]"); if (!list) return; event.preventDefault(); list.classList.remove("drop-target"); const id = event.dataTransfer.getData("text/plain") || draggedId, stage = list.dataset.stage; if (!id || !stage) return; try { await moveDriverToStage(id, stage); } catch (error) { alert(error.message || "Unable to move applicant."); } }); }
  ui.untouchedColumn.addEventListener("click", driverAction); ui.phoneColumn.addEventListener("click", driverAction); ui.docsColumn.addEventListener("click", driverAction); ui.readyColumn.addEventListener("click", driverAction); ui.processedColumn.addEventListener("click", driverAction); ui.partnerColumn.addEventListener("click", driverAction); ui.callbackColumn.addEventListener("click", driverAction); ui.orientationColumn.addEventListener("click", driverAction); ui.archiveGrid.addEventListener("click", driverAction); setupPipelineDragAndDrop();
  ui.untouchedToggle.addEventListener("click", () => { showingUntouched = !showingUntouched; renderDrivers(); });
  ui.archiveToggle.addEventListener("click", () => { showingArchive = !showingArchive; ui.pipeline.hidden = showingArchive; ui.archiveView.hidden = !showingArchive; ui.archiveToggle.firstChild.textContent = showingArchive ? "Back to pipeline " : "View archive "; });
  ui.quotesBody.addEventListener("change", async (event) => { const select = event.target.closest("select[data-quote]"); if (!select) return; select.disabled = true; try { const response = await fetch(`/api/admin/quotes/${select.dataset.quote}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: select.value }) }); if (!response.ok) throw new Error(); await refreshAll(); } catch { select.disabled = false; alert("Unable to update quote status."); } });
  ui.partnerForm.addEventListener("submit", async (event) => { event.preventDefault(); if (event.submitter?.value === "cancel") { ui.partnerDialog.close(); return; } if (!partnerTarget || !ui.partnerCompany.value.trim()) { ui.partnerError.textContent = "Enter the company sold or hired to."; return; } ui.confirmPartner.disabled = true; try { await patchApplication(partnerTarget.id, { partnerCompany: ui.partnerCompany.value, partnerNote: ui.partnerNote.value }); ui.partnerDialog.close(); partnerTarget = null; } catch (error) { ui.partnerError.textContent = error.message; } finally { ui.confirmPartner.disabled = false; } });
  ui.activateForm.addEventListener("submit", async (event) => { event.preventDefault(); if (event.submitter?.value === "cancel") { ui.activateDialog.close(); return; } const activeDriverId = ui.activateForm.dataset.activeDriverId; if ((!activateTarget && !activeDriverId) || !ui.driverPayout.value || !ui.driverStartDate.value) { ui.activateError.textContent = "Enter both payout and driver start date."; return; } ui.confirmActivate.disabled = true; try { const response = await fetch(activeDriverId ? `/api/admin/active-drivers/${activeDriverId}` : `/api/admin/applications/${activateTarget.id}/activate`, { method: activeDriverId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ payout: Number(ui.driverPayout.value), startDate: ui.driverStartDate.value, paymentDelayWeeks: Number(ui.paymentDelayWeeks.value) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to save active driver."); await refreshAll(); ui.activateDialog.close(); activateTarget = null; ui.activateForm.dataset.activeDriverId = ""; } catch (error) { ui.activateError.textContent = error.message; } finally { ui.confirmActivate.disabled = false; } });
  ui.noteForm.addEventListener("submit", async (event) => { event.preventDefault(); if (event.submitter?.value === "cancel") { ui.noteDialog.close(); noteTarget = null; return; } const body = ui.driverNoteBody.value.trim(); if (!noteTarget || !body) { ui.noteError.textContent = "Enter a note."; return; } ui.confirmNote.disabled = true; try { const response = await fetch(`/api/admin/applications/${noteTarget.id}/notes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to add note."); ui.noteDialog.close(); noteTarget = null; await refreshAll(); } catch (error) { ui.noteError.textContent = error.message; } finally { ui.confirmNote.disabled = false; } });
  function refreshCallbackTimeAvailability() { const now = centralNow(); for (const option of Array.from(ui.driverCallbackTime.options).slice(1)) { const [hour, minute] = option.value.split(":").map(Number); option.disabled = ui.driverCallbackDate.value === now.date && hour * 60 + minute <= now.minutes; } if (ui.driverCallbackTime.selectedOptions[0]?.disabled) ui.driverCallbackTime.value = ""; }
  for (let minutes = 9 * 60; minutes <= 21 * 60; minutes += 30) { const option = element("option", "", timeLabel(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`)); option.value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; ui.driverCallbackTime.append(option); }
  ui.driverCallbackDate.addEventListener("change", refreshCallbackTimeAvailability);
  ui.callbackScheduleForm.addEventListener("submit", async (event) => { event.preventDefault(); if (event.submitter?.value === "cancel") { ui.callbackScheduleDialog.close(); callbackScheduleTarget = null; return; } if (!callbackScheduleTarget || !ui.driverCallbackDate.value || !ui.driverCallbackTime.value) { ui.callbackScheduleError.textContent = "Choose a callback date and time."; return; } ui.confirmCallbackSchedule.disabled = true; try { await patchApplication(callbackScheduleTarget.id, { callbackDate: ui.driverCallbackDate.value, callbackTime: ui.driverCallbackTime.value }); ui.callbackScheduleDialog.close(); callbackScheduleTarget = null; } catch (error) { ui.callbackScheduleError.textContent = error.message; } finally { ui.confirmCallbackSchedule.disabled = false; } });
  ui.activeDriverList.addEventListener("click", async (event) => { const button = event.target.closest("button[data-action]"), item = event.target.closest("[data-active-driver-id]"); if (!button || !item) return; const driver = activeDrivers.find((candidate) => candidate.id === item.dataset.activeDriverId); if (!driver) return; if (button.dataset.action === "add-active-note") { openNoteDialog(driver.application_id, driver.full_name); return; } if (button.dataset.action === "driver-off") { if (!confirm(`Turn off ${driver.full_name || "this driver"}? They will no longer count in active driver accounting.`)) return; button.disabled = true; try { const response = await fetch(`/api/admin/active-drivers/${driver.id}/off`, { method: "PATCH" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to turn driver off."); await refreshAll(); } catch (error) { alert(error.message); button.disabled = false; } return; } if (button.dataset.action === "edit-active-driver") { activateTarget = null; ui.activateDriverName.textContent = `Update the payout or start date for ${driver.full_name || "this driver"}.`; ui.driverPayout.value = (Number(driver.payout_cents) / 100).toFixed(2); ui.driverStartDate.value = driver.driver_start_date; ui.paymentDelayWeeks.value = String(driver.payment_delay_weeks); ui.activateError.textContent = ""; ui.activateForm.dataset.activeDriverId = driver.id; ui.activateDialog.showModal(); } });
  const accessToken = new URLSearchParams(location.hash.slice(1)).get("access-token");
  if (accessToken) { ui.login.hidden = false; ui.loginCard.hidden = true; ui.accessCard.hidden = false; ui.dashboard.hidden = true; ui.accessForm.dataset.token = accessToken; ui.accessPassword.focus(); }
  else fetch("/api/admin/session", { cache: "no-store" }).then(async (response) => response.ok ? showDashboard(await response.json()) : showLogin()).catch(showLogin);
})();
