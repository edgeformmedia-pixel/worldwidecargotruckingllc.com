(() => {
  "use strict";

  const q = (selector) => document.querySelector(selector);
  const ui = {
    login: q("#loginView"), dashboard: q("#dashboard"), loginForm: q("#loginForm"), password: q("#password"), loginError: q("#loginError"), logout: q("#logoutButton"), refresh: q("#refreshButton"), updated: q("#lastUpdated"), nav: q("#mainNav"), sidebar: q(".sidebar"), mobileMenu: q("#mobileMenu"), viewTitle: q("#viewTitle"), viewEyebrow: q("#viewEyebrow"),
    homeView: q("#homeView"), driversView: q("#driversView"), quotesView: q("#quotesView"), activeCount: q("#activeCount"), phoneCount: q("#phoneCount"), docsCount: q("#docsCount"), readyCount: q("#readyCount"), navDriverCount: q("#navDriverCount"), navQuoteCount: q("#navQuoteCount"), attentionList: q("#attentionList"), homeQuoteList: q("#homeQuoteList"),
    driverSearch: q("#driverSearch"), driverTypeFilter: q("#driverTypeFilter"), documentFilter: q("#documentFilter"), phoneColumn: q("#phoneColumn"), docsColumn: q("#docsColumn"), readyColumn: q("#readyColumn"), phoneColumnCount: q("#phoneColumnCount"), docsColumnCount: q("#docsColumnCount"), readyColumnCount: q("#readyColumnCount"), archiveToggle: q("#archiveToggle"), archiveCount: q("#archiveCount"), pipeline: q("#pipeline"), archiveView: q("#archiveView"), archiveGrid: q("#archiveGrid"),
    quoteSearch: q("#quoteSearch"), quoteStatusFilter: q("#quoteStatusFilter"), quotesBody: q("#quotesBody"), quotesEmpty: q("#quotesEmpty"), sendDialog: q("#sendDialog"), sendForm: q("#sendForm"), sendDriverName: q("#sendDriverName"), sentTo: q("#sentTo"), sendError: q("#sendError"), confirmSend: q("#confirmSend"),
  };

  const viewCopy = { home: ["Recruiting overview", "Home"], drivers: ["Applicant workflow", "View drivers"], quotes: ["Freight opportunities", "Quote requests"] };
  const experience = { under_1: "Less than 1 year", "1_plus": "1+ year", "2_plus": "2+ years", "3_plus": "3+ years", "4_plus": "4+ years" };
  const stageLabels = { phone_screen: "Phone call", docs_requested: "Documents", docs_received: "Ready to send" };
  let applications = [], quotes = [], refreshTimer, activeView = "home", showingArchive = false, sendTarget = null;

  function showLogin() { ui.login.hidden = false; ui.dashboard.hidden = true; clearInterval(refreshTimer); }
  function showDashboard() { ui.login.hidden = true; ui.dashboard.hidden = false; refreshAll(); clearInterval(refreshTimer); refreshTimer = setInterval(refreshAll, 15000); }
  function applicationStage(app) { return app.recruiting_stage || "phone_screen"; }
  function isExpired(app) { return Boolean(app.medical_card_expiration && app.medical_card_expiration < new Date().toISOString().slice(0, 10)); }
  function readableDate(value, withTime = false) { if (!value) return "—"; const date = new Date(`${value}${String(value).includes("T") && !String(value).endsWith("Z") ? "Z" : ""}`); if (Number.isNaN(date.getTime())) return value; return withTime ? date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }); }
  function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function empty(container, text) { container.replaceChildren(element("div", "empty-column", text)); }

  function switchView(view) {
    activeView = view; showingArchive = false;
    for (const name of ["home", "drivers", "quotes"]) ui[`${name}View`].hidden = name !== view;
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

  function driverCard(app, archived = false) {
    const card = element("article", "driver-card"); card.dataset.id = app.id;
    const top = element("div", "driver-card-top"), identity = element("div"), name = element("h4", "", app.full_name || "Name not entered"), type = element("span", "type", app.driver_type === "owner_operator" ? "Owner-operator" : "Company driver"), age = element("span", "age", readableDate(app.submitted_at || app.updated_at));
    identity.append(name, type); top.append(identity, app.sent_at ? element("span", "sent-pill", "Sent") : age);
    const contact = element("div", "contact");
    if (app.phone) { const phone = element("a", "", app.phone); phone.href = `tel:${app.phone}`; contact.append(phone); }
    if (app.email) { const email = element("a", "", app.email); email.href = `mailto:${app.email}`; contact.append(email); }
    const docs = element("div", "doc-checks"); docs.append(documentBadge("CDL", Boolean(app.cdl_document_uploaded_at)), documentBadge("Medical card", Boolean(app.medical_card_uploaded_at), isExpired(app)));
    card.append(top, contact, docs);
    if (app.medical_card_expiration) card.append(element("p", "driver-note", `Medical card expires ${readableDate(app.medical_card_expiration)}${isExpired(app) ? " — expired" : ""}`));
    if (app.sent_at) card.append(element("p", "driver-note", `Sent to ${app.sent_to} on ${readableDate(app.sent_at)}`));
    const actions = element("div", "driver-actions");
    if (archived) {
      actions.append(actionButton("Restore", "next", "restore"));
    } else {
      const stage = applicationStage(app);
      if (app.cdl_document_uploaded_at) actions.append(documentLink(app, "cdl", "View CDL"));
      if (app.medical_card_uploaded_at) actions.append(documentLink(app, "medical-card", "View medical card"));
      if (stage === "phone_screen") actions.append(actionButton("Phone call complete", "next", "request-docs"));
      if (stage === "docs_requested") {
        actions.append(actionButton("Documents complete", "next", "docs-complete", !app.cdl_document_uploaded_at || !app.medical_card_uploaded_at));
      }
      if (stage === "docs_received") {
        actions.append(actionButton(app.sent_at ? "Update sent record" : "Mark as sent", "next", "mark-sent"));
      }
      actions.append(actionButton("Archive", "archive", "archive"));
    }
    card.append(actions); return card;
  }

  function documentLink(app, kind, label) { const link = element("a", "", label); link.href = `${window.WCX_API_ORIGIN || ""}/api/admin/applications/${app.id}/documents/${kind}`; link.target = "_blank"; link.rel = "noopener"; return link; }

  function filteredApplications(archived) {
    const search = ui.driverSearch.value.trim().toLowerCase(), type = ui.driverTypeFilter.value, doc = ui.documentFilter.value;
    return applications.filter((app) => app.status === "submitted" && Boolean(app.archived_at) === archived && (!search || [app.full_name, app.phone, app.email].some((value) => String(value || "").toLowerCase().includes(search))) && (type === "all" || app.driver_type === type) && (doc === "all" || (doc === "missing_cdl" && !app.cdl_document_uploaded_at) || (doc === "missing_medical" && !app.medical_card_uploaded_at) || (doc === "complete" && app.cdl_document_uploaded_at && app.medical_card_uploaded_at) || (doc === "expired" && isExpired(app))));
  }

  function renderDrivers() {
    const active = filteredApplications(false), archived = filteredApplications(true), groups = { phone_screen: [], docs_requested: [], docs_received: [] };
    active.forEach((app) => groups[applicationStage(app)].push(app));
    const columns = [[ui.phoneColumn, ui.phoneColumnCount, groups.phone_screen, "No applicants are waiting for a call."], [ui.docsColumn, ui.docsColumnCount, groups.docs_requested, "No applicants are waiting on documents."], [ui.readyColumn, ui.readyColumnCount, groups.docs_received, "No complete driver packets yet."]];
    for (const [container, count, items, message] of columns) { count.textContent = items.length; if (!items.length) empty(container, message); else container.replaceChildren(...items.map((app) => driverCard(app))); }
    ui.archiveCount.textContent = applications.filter((app) => app.status === "submitted" && app.archived_at).length;
    if (!archived.length) empty(ui.archiveGrid, "No archived applicants match these filters."); else ui.archiveGrid.replaceChildren(...archived.map((app) => driverCard(app, true)));
  }

  function attentionItem(title, detail, badge, quote = false) { const item = element("article", "attention-item"), copy = element("div"), strong = element("strong", "", title), p = element("p", "", detail), state = element("span", quote ? "quote-state" : "", badge); copy.append(strong, p); item.append(copy, state); return item; }

  function renderHome() {
    const active = applications.filter((app) => app.status === "submitted" && !app.archived_at), phone = active.filter((app) => applicationStage(app) === "phone_screen"), docs = active.filter((app) => applicationStage(app) === "docs_requested"), ready = active.filter((app) => applicationStage(app) === "docs_received");
    ui.activeCount.textContent = active.length; ui.phoneCount.textContent = phone.length; ui.docsCount.textContent = docs.length; ui.readyCount.textContent = ready.length; ui.navDriverCount.textContent = active.length; ui.navQuoteCount.textContent = quotes.length;
    const priority = [...phone.map((app) => attentionItem(app.full_name || "Unnamed applicant", app.phone || app.email || "Contact details pending", "Call")), ...docs.filter((app) => !app.cdl_document_uploaded_at || !app.medical_card_uploaded_at).map((app) => attentionItem(app.full_name || "Unnamed applicant", `${app.cdl_document_uploaded_at ? "CDL received" : "CDL missing"} · ${app.medical_card_uploaded_at ? "Medical card received" : "Medical card missing"}`, "Documents"))].slice(0, 6);
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

  function renderAll() { renderHome(); renderDrivers(); renderQuotes(); }
  async function patchApplication(id, body) { const response = await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to update applicant."); await refreshAll(); }

  async function refreshAll() {
    try {
      const [appsResponse, quotesResponse] = await Promise.all([fetch("/api/admin/applications", { cache: "no-store" }), fetch("/api/admin/quotes", { cache: "no-store" })]);
      if (appsResponse.status === 401 || quotesResponse.status === 401) { showLogin(); return; }
      if (!appsResponse.ok || !quotesResponse.ok) throw new Error();
      const appData = await appsResponse.json(), quoteData = await quotesResponse.json(); applications = appData.applications || []; quotes = quoteData.quotes || []; renderAll(); ui.updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } catch { ui.updated.textContent = "Unable to refresh"; }
  }

  async function driverAction(event) {
    const button = event.target.closest("button[data-action]"), card = event.target.closest("[data-id]"); if (!button || !card) return; const app = applications.find((item) => item.id === card.dataset.id); if (!app) return; button.disabled = true;
    try {
      if (button.dataset.action === "request-docs") await patchApplication(app.id, { stage: "docs_requested" });
      if (button.dataset.action === "docs-complete") await patchApplication(app.id, { stage: "docs_received" });
      if (button.dataset.action === "archive") await patchApplication(app.id, { archive: true });
      if (button.dataset.action === "restore") await patchApplication(app.id, { archive: false });
      if (button.dataset.action === "mark-sent") { sendTarget = app; ui.sendDriverName.textContent = `Record who received ${app.full_name || "this driver"}’s CDL and medical card.`; ui.sentTo.value = app.sent_to || ""; ui.sendError.textContent = ""; ui.sendDialog.showModal(); button.disabled = false; }
    } catch (error) { alert(error.message || "Unable to update applicant."); button.disabled = false; }
  }

  ui.loginForm.addEventListener("submit", async (event) => { event.preventDefault(); ui.loginError.textContent = ""; const button = ui.loginForm.querySelector("button"); button.disabled = true; try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: ui.password.value }) }); if (!response.ok) throw new Error("Incorrect password."); ui.password.value = ""; showDashboard(); } catch (error) { ui.loginError.textContent = error.message; } finally { button.disabled = false; } });
  ui.logout.addEventListener("click", async () => { await fetch("/api/admin/logout", { method: "POST" }); showLogin(); });
  ui.refresh.addEventListener("click", refreshAll); ui.mobileMenu.addEventListener("click", () => ui.sidebar.classList.toggle("open"));
  ui.nav.addEventListener("click", (event) => { const button = event.target.closest("[data-view]"); if (button) switchView(button.dataset.view); });
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-go]"); if (button) switchView(button.dataset.go); });
  [ui.driverSearch, ui.driverTypeFilter, ui.documentFilter].forEach((control) => control.addEventListener("input", renderDrivers));
  [ui.quoteSearch, ui.quoteStatusFilter].forEach((control) => control.addEventListener("input", renderQuotes));
  ui.phoneColumn.addEventListener("click", driverAction); ui.docsColumn.addEventListener("click", driverAction); ui.readyColumn.addEventListener("click", driverAction); ui.archiveGrid.addEventListener("click", driverAction);
  ui.archiveToggle.addEventListener("click", () => { showingArchive = !showingArchive; ui.pipeline.hidden = showingArchive; ui.archiveView.hidden = !showingArchive; ui.archiveToggle.firstChild.textContent = showingArchive ? "Back to pipeline " : "View archive "; });
  ui.quotesBody.addEventListener("change", async (event) => { const select = event.target.closest("select[data-quote]"); if (!select) return; select.disabled = true; try { const response = await fetch(`/api/admin/quotes/${select.dataset.quote}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: select.value }) }); if (!response.ok) throw new Error(); await refreshAll(); } catch { select.disabled = false; alert("Unable to update quote status."); } });
  ui.sendForm.addEventListener("submit", async (event) => { event.preventDefault(); if (event.submitter?.value === "cancel") { ui.sendDialog.close(); return; } if (!sendTarget || !ui.sentTo.value.trim()) { ui.sendError.textContent = "Enter who received the documents."; return; } ui.confirmSend.disabled = true; try { await patchApplication(sendTarget.id, { sentTo: ui.sentTo.value }); ui.sendDialog.close(); sendTarget = null; } catch (error) { ui.sendError.textContent = error.message; } finally { ui.confirmSend.disabled = false; } });
  fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.ok ? showDashboard() : showLogin()).catch(showLogin);
})();
