const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  token: localStorage.getItem("reportingToken") || "",
  user: JSON.parse(localStorage.getItem("reportingUser") || "null"),
  bootstrap: JSON.parse(localStorage.getItem("reportingBootstrap") || "null"),
  dashboardCache: JSON.parse(localStorage.getItem("reportingDashboard") || "null"),
  analyticsCache: JSON.parse(localStorage.getItem("reportingAnalytics") || "null"),
  page: "dashboard",
  settingsTab: "questions",
};

const pageMeta = {
  dashboard: ["Обзор", "Главная"],
  "new-report": ["Форма", "Новая справка"],
  directory: ["Контакты", "Справочник учреждений"],
  analytics: ["Показатели", "Аналитика"],
  settings: ["Управление", "Настройки"],
};

const answerTypeNames = {
  text: "Короткий текст",
  textarea: "Развёрнутый текст",
  number: "Число",
  yes_no: "Да / Нет",
  select: "Выбор из списка",
  date: "Дата",
};

function apiBase() {
  return (localStorage.getItem("reportingServerUrl") || "").replace(/\/$/, "");
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  let response;
  try {
    response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  } catch (error) {
    error.network = true;
    throw error;
  }
  if (response.status === 401 && path !== "/api/auth/login") {
    logout(false);
    throw new Error("Сеанс завершён. Войдите снова.");
  }
  if (!response.ok) {
    let message = "Не удалось выполнить запрос";
    try {
      const data = await response.json();
      message = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join(", ")
        : data.detail || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU").format(new Date(`${value}T12:00:00`));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function toast(message, type = "") {
  const element = $("#toast");
  element.textContent = message;
  element.className = `toast show ${type}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (element.className = "toast"), 3500);
}

function showLogin() {
  $("#login-screen").classList.remove("hidden");
  $("#app-shell").classList.add("hidden");
  $("#server-url").value = localStorage.getItem("reportingServerUrl") || "";
}

function showApp() {
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  const roleNames = { admin: "Администратор", operator: "Оператор", viewer: "Наблюдатель" };
  $("#user-card").innerHTML = `<strong>${escapeHtml(state.user.full_name)}</strong>
    <span>${roleNames[state.user.role] || state.user.role}</span>`;
  $$(".admin-only").forEach((node) => node.classList.toggle("hidden", state.user.role !== "admin"));
  $$(".editor-only").forEach((node) => node.classList.toggle("hidden", state.user.role === "viewer"));
  navigate("dashboard");
  updateConnectionState();
  updatePendingCount();
}

async function login(event) {
  event.preventDefault();
  $("#login-error").textContent = "";
  const serverUrl = $("#server-url").value.trim().replace(/\/$/, "");
  if (serverUrl) localStorage.setItem("reportingServerUrl", serverUrl);
  else localStorage.removeItem("reportingServerUrl");
  const button = $("#login-form button[type=submit]");
  button.disabled = true;
  button.textContent = "Выполняется вход…";
  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: $("#login-username").value,
        password: $("#login-password").value,
      }),
    });
    state.token = result.token;
    state.user = result.user;
    localStorage.setItem("reportingToken", state.token);
    localStorage.setItem("reportingUser", JSON.stringify(state.user));
    await loadBootstrap();
    showApp();
  } catch (error) {
    $("#login-error").textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = "Войти в систему <span>→</span>";
  }
}

async function logout(callServer = true) {
  if (callServer && navigator.onLine) {
    try { await api("/api/auth/logout", { method: "POST" }); } catch (_) {}
  }
  state.token = "";
  state.user = null;
  localStorage.removeItem("reportingToken");
  localStorage.removeItem("reportingUser");
  showLogin();
}

async function loadBootstrap() {
  const data = await api("/api/bootstrap");
  state.bootstrap = data;
  state.user = data.user;
  localStorage.setItem("reportingBootstrap", JSON.stringify(data));
  localStorage.setItem("reportingUser", JSON.stringify(data.user));
  return data;
}

function navigate(page) {
  if (page === "settings" && state.user.role !== "admin") page = "dashboard";
  if (page === "new-report" && state.user.role === "viewer") page = "dashboard";
  state.page = page;
  $$("#main-nav button").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  const [kicker, title] = pageMeta[page];
  $("#page-kicker").textContent = kicker;
  $("#page-title").textContent = title;
  $("#sidebar").classList.remove("open");
  renderCurrentPage();
}

async function renderCurrentPage() {
  const content = $("#page-content");
  content.innerHTML = `<div class="panel"><div class="empty-state">Загрузка…</div></div>`;
  try {
    if (state.page === "dashboard") await renderDashboard();
    if (state.page === "new-report") renderReportForm();
    if (state.page === "directory") renderDirectory();
    if (state.page === "analytics") await renderAnalytics();
    if (state.page === "settings") await renderSettings();
  } catch (error) {
    content.innerHTML = `<div class="panel"><div class="empty-state"><span class="empty-icon">!</span>
      <b>Не удалось загрузить данные</b><span>${escapeHtml(error.message)}</span></div></div>`;
  }
}

function institutionOptions(selected = "", includeAll = false) {
  const allowed = state.user.institution_id && state.user.role !== "admin"
    ? state.bootstrap.institutions.filter((item) => item.id === state.user.institution_id)
    : state.bootstrap.institutions;
  return `${includeAll ? '<option value="">Все учреждения</option>' : '<option value="">Выберите учреждение</option>'}
    ${allowed.map((item) => `<option value="${item.id}" ${String(item.id) === String(selected) ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}`;
}

function dashboardFilters() {
  return `<div class="filters">
    <label>Учреждение<select id="filter-institution">${institutionOptions("", true)}</select></label>
    <label>Дата с<input id="filter-from" type="date" value="${monthStart()}"></label>
    <label>Дата по<input id="filter-to" type="date" value="${today()}"></label>
    <button id="apply-filters" class="button secondary">Показать</button>
  </div>`;
}

async function renderDashboard(filter = {}) {
  const params = new URLSearchParams();
  if (filter.institution_id) params.set("institution_id", filter.institution_id);
  params.set("date_from", filter.date_from || monthStart());
  params.set("date_to", filter.date_to || today());
  let reports;
  let analytics;
  let fromCache = false;
  try {
    [reports, analytics] = await Promise.all([
      api(`/api/reports?${params}`),
      api(`/api/analytics?${params}`),
    ]);
    state.dashboardCache = { reports, analytics };
    localStorage.setItem("reportingDashboard", JSON.stringify(state.dashboardCache));
  } catch (error) {
    if (!error.network || !state.dashboardCache) throw error;
    ({ reports, analytics } = state.dashboardCache);
    fromCache = true;
  }
  const queued = await pendingReports();
  const queuedRows = queued.map((report) => ({
    id: null,
    institution_name: state.bootstrap.institutions.find((item) => item.id === report.institution_id)?.name || "Учреждение",
    report_date: report.report_date,
    author_name: state.user.full_name,
    status: "pending",
  }));
  reports = [...queuedRows, ...reports];
  const summary = {
    ...analytics.summary,
    total_reports: Number(analytics.summary.total_reports) + queuedRows.length,
  };
  $("#page-content").innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Рабочее пространство</span>
        <h2>${greeting()}, ${escapeHtml(state.user.full_name.split(" ")[0])}</h2>
        <p>Здесь собраны актуальные справки учреждений. Используйте фильтры, чтобы найти данные за нужный период.</p>
      </div>
      ${state.user.role === "viewer" ? "" : '<button class="button" data-go="new-report">Заполнить справку <span>→</span></button>'}
    </section>
    <section class="stat-grid">
      ${statCard("▤", summary.total_reports, "Справок за период")}
      ${statCard("⌂", summary.reporting_institutions, "Учреждений отчиталось")}
      ${statCard("◷", summary.last_date ? formatDate(summary.last_date) : "—", "Последняя справка")}
      ${statCard("✓", `${summary.coverage_percent}%`, "Охват учреждений")}
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h2>Справки учреждений</h2><p>Просмотр и выгрузка итоговых документов</p></div>
        <div class="panel-actions"><span class="muted">${reports.length} записей</span></div>
      </div>
      ${fromCache ? `<div class="offline-banner"><b>Офлайн-режим</b><span>Показаны последние загруженные данные. Новые справки сохраняются на этом устройстве.</span></div>` : ""}
      ${dashboardFilters()}
      <div id="reports-table">${reportsTable(reports)}</div>
    </section>`;
  $("#filter-institution").value = filter.institution_id || "";
  $("#filter-from").value = filter.date_from || monthStart();
  $("#filter-to").value = filter.date_to || today();
  $("#apply-filters").onclick = () => renderDashboard({
    institution_id: $("#filter-institution").value,
    date_from: $("#filter-from").value,
    date_to: $("#filter-to").value,
  });
  bindCommonActions();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function statCard(icon, value, label) {
  return `<article class="stat-card"><span class="stat-icon">${icon}</span><b>${escapeHtml(value)}</b><span>${label}</span></article>`;
}

function reportsTable(reports) {
  if (!reports.length) return `<div class="empty-state"><span class="empty-icon">▤</span>
    <b>Справок пока нет</b><span>Измените период или создайте первую справку</span></div>`;
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Учреждение</th><th>Дата</th><th>Ответственный</th><th>Статус</th><th></th></tr></thead>
    <tbody>${reports.map((report) => `<tr>
      <td class="primary-cell">${escapeHtml(report.institution_name)}</td>
      <td>${formatDate(report.report_date)}</td>
      <td>${escapeHtml(report.author_name)}</td>
      <td><span class="badge ${report.status === "submitted" ? "success" : "draft"}">${report.status === "submitted" ? "Отправлена" : report.status === "pending" ? "Ожидает отправки" : "Черновик"}</span></td>
      <td><div class="row-actions">${report.id ? `
        <button class="mini-button view-report" data-id="${report.id}" title="Просмотреть">○</button>
        <button class="mini-button download-report" data-id="${report.id}" title="Скачать DOCX">↓ DOCX</button>` : ""}
      </div></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function answerInput(question, value = "") {
  const common = `name="q_${question.id}" data-question="${question.id}" ${question.required ? "required" : ""}`;
  if (question.answer_type === "textarea") return `<textarea ${common} placeholder="Введите ответ">${escapeHtml(value)}</textarea>`;
  if (question.answer_type === "number") return `<input ${common} type="number" step="any" value="${escapeHtml(value)}" placeholder="0">`;
  if (question.answer_type === "date") return `<input ${common} type="date" value="${escapeHtml(value)}">`;
  if (question.answer_type === "yes_no") return `<select ${common}><option value="">Выберите</option><option ${value === "Да" ? "selected" : ""}>Да</option><option ${value === "Нет" ? "selected" : ""}>Нет</option></select>`;
  if (question.answer_type === "select") return `<select ${common}><option value="">Выберите</option>${question.options.map((option) => `<option ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  return `<input ${common} value="${escapeHtml(value)}" placeholder="Введите ответ">`;
}

function renderReportForm() {
  const defaultInstitution = state.user.institution_id || "";
  $("#page-content").innerHTML = `
    <form id="report-form" class="report-layout">
      <section>
        <div class="panel">
          <div class="panel-head"><div><h2>Основные сведения</h2><p>Выберите учреждение и дату отчётности</p></div><span class="badge success">Автосохранение</span></div>
          <div class="form-grid">
            <label>Учреждение<select id="report-institution" required>${institutionOptions(defaultInstitution)}</select></label>
            <label>Дата справки<input id="report-date" type="date" required value="${today()}"></label>
            <label class="full">Общее примечание<textarea id="report-notes" placeholder="Дополнительные сведения, если требуются"></textarea></label>
          </div>
        </div>
        <div class="panel-head"><div><h2>Вопросы</h2><p>${state.bootstrap.questions.length} полей в форме</p></div></div>
        <div id="questions-list">
          ${state.bootstrap.questions.map((question, index) => `<article class="question-card">
            <label><span class="question-number">${index + 1}</span>${escapeHtml(question.text)} ${question.required ? '<span class="required">*</span>' : ""}</label>
            ${question.help_text ? `<small>${escapeHtml(question.help_text)}</small>` : ""}
            ${answerInput(question)}
          </article>`).join("")}
        </div>
      </section>
      <aside class="panel sticky-panel">
        <span class="eyebrow green">Готовность формы</span>
        <h3>Проверьте ответы</h3>
        <div class="form-progress"><i id="progress-bar"></i></div>
        <div class="progress-label"><span>Заполнено</span><b id="progress-value">0%</b></div>
        <p class="muted">Черновик можно сохранить без обязательных ответов. При отсутствии интернета справка останется на устройстве.</p>
        <button type="submit" data-status="submitted" class="button primary">Отправить справку</button>
        <button type="submit" data-status="draft" class="button secondary">Сохранить черновик</button>
      </aside>
    </form>`;
  const form = $("#report-form");
  let submitStatus = "submitted";
  $$("button[type=submit]", form).forEach((button) => {
    button.onclick = () => { submitStatus = button.dataset.status; };
  });
  $$("[data-question]", form).forEach((input) => input.addEventListener("input", updateFormProgress));
  form.onsubmit = (event) => submitReport(event, submitStatus);
  updateFormProgress();
}

function updateFormProgress() {
  const fields = $$("[data-question]");
  const completed = fields.filter((field) => field.value.trim()).length;
  const percent = fields.length ? Math.round(completed / fields.length * 100) : 100;
  $("#progress-bar").style.width = `${percent}%`;
  $("#progress-value").textContent = `${percent}%`;
}

async function submitReport(event, status) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    institution_id: Number($("#report-institution").value),
    report_date: $("#report-date").value,
    status,
    notes: $("#report-notes").value,
    client_uid: crypto.randomUUID(),
    answers: Object.fromEntries($$("[data-question]", form).map((field) => [field.dataset.question, field.value])),
  };
  if (!payload.institution_id) return toast("Выберите учреждение", "error");
  const submitButtons = $$("button[type=submit]", form);
  submitButtons.forEach((button) => (button.disabled = true));
  try {
    if (!navigator.onLine) throw Object.assign(new Error("offline"), { network: true });
    await api("/api/reports", { method: "POST", body: JSON.stringify(payload) });
    toast(status === "draft" ? "Черновик сохранён" : "Справка отправлена");
    await loadBootstrap();
    navigate("dashboard");
  } catch (error) {
    if (error.network) {
      await queueReport(payload);
      toast("Нет подключения. Справка сохранена на устройстве.");
      navigate("dashboard");
    } else {
      toast(error.message, "error");
    }
  } finally {
    submitButtons.forEach((button) => (button.disabled = false));
  }
}

function renderDirectory() {
  const institutions = state.bootstrap.institutions;
  $("#page-content").innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h2>Учреждения</h2><p>Контактные данные и ответственные сотрудники</p></div>
        <span class="badge success">${institutions.length} активных</span>
      </div>
      <label>Поиск<input id="directory-search" placeholder="Название, адрес или контакт"></label>
    </section>
    <section id="directory-grid" class="directory-grid">${directoryCards(institutions)}</section>`;
  $("#directory-search").oninput = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = institutions.filter((item) =>
      [item.name, item.short_name, item.address, item.contact_name].join(" ").toLowerCase().includes(query)
    );
    $("#directory-grid").innerHTML = directoryCards(filtered);
  };
}

function directoryCards(institutions) {
  if (!institutions.length) return `<div class="panel empty-state"><b>Ничего не найдено</b></div>`;
  return institutions.map((item) => `<article class="institution-card">
    <div class="institution-card-head">
      <span class="institution-monogram">${escapeHtml((item.short_name || item.name).slice(0, 2).toUpperCase())}</span>
      <div><h3>${escapeHtml(item.name)}</h3><span class="muted">${escapeHtml(item.short_name)}</span></div>
    </div>
    <p>⌖ ${escapeHtml(item.address || "Адрес не указан")}</p>
    <p>○ ${escapeHtml(item.contact_name || "Ответственный не указан")}</p>
    <p>☎ ${item.phone ? `<a href="tel:${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</a>` : "Телефон не указан"}</p>
    <p>✉ ${item.email ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>` : "Почта не указана"}</p>
  </article>`).join("");
}

async function renderAnalytics(filter = {}) {
  const params = new URLSearchParams();
  if (filter.institution_id) params.set("institution_id", filter.institution_id);
  if (filter.date_from) params.set("date_from", filter.date_from);
  if (filter.date_to) params.set("date_to", filter.date_to);
  let data;
  let fromCache = false;
  try {
    data = await api(`/api/analytics?${params}`);
    state.analyticsCache = data;
    localStorage.setItem("reportingAnalytics", JSON.stringify(data));
  } catch (error) {
    if (!error.network || !state.analyticsCache) throw error;
    data = state.analyticsCache;
    fromCache = true;
  }
  const summary = data.summary;
  const maxReports = Math.max(1, ...data.by_institution.map((item) => item.reports));
  const maxTrend = Math.max(1, ...data.trend.map((item) => item.reports));
  $("#page-content").innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h2>Период анализа</h2><p>Фильтры применяются ко всем показателям</p></div></div>
      ${fromCache ? `<div class="offline-banner"><b>Офлайн-режим</b><span>Показан последний доступный снимок аналитики.</span></div>` : ""}
      <div class="filters">
        <label>Учреждение<select id="analytics-institution">${institutionOptions(filter.institution_id, true)}</select></label>
        <label>Дата с<input id="analytics-from" type="date" value="${filter.date_from || monthStart()}"></label>
        <label>Дата по<input id="analytics-to" type="date" value="${filter.date_to || today()}"></label>
        <button id="analytics-apply" class="button secondary">Применить</button>
      </div>
    </section>
    <section class="stat-grid">
      ${statCard("▤", summary.total_reports, "Отправлено справок")}
      ${statCard("⌂", summary.reporting_institutions, "Активных учреждений")}
      ${statCard("◉", `${summary.coverage_percent}%`, "Охват")}
      ${statCard("◷", summary.first_date ? `${formatDate(summary.first_date)} — ${formatDate(summary.last_date)}` : "—", "Диапазон данных")}
    </section>
    <section class="analytics-grid">
      <article class="panel">
        <div class="panel-head"><div><h2>Динамика справок</h2><p>Количество отправок по дням</p></div></div>
        ${data.trend.length ? `<div class="trend-chart">${data.trend.map((item) => `<div class="trend-column" title="${item.reports} справок"><i style="height:${item.reports / maxTrend * 100}%"></i><span>${formatDate(item.date).slice(0, 5)}</span></div>`).join("")}</div>` : emptyInline()}
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>По учреждениям</h2><p>Сравнение активности</p></div></div>
        <div class="bars">${data.by_institution.map((item) => `<div>
          <div class="bar-head"><span>${escapeHtml(item.name)}</span><b>${item.reports}</b></div>
          <div class="bar-track"><div class="bar-fill" style="width:${item.reports / maxReports * 100}%"></div></div>
        </div>`).join("")}</div>
      </article>
    </section>`;
  $("#analytics-apply").onclick = () => renderAnalytics({
    institution_id: $("#analytics-institution").value,
    date_from: $("#analytics-from").value,
    date_to: $("#analytics-to").value,
  });
}

function emptyInline() {
  return `<div class="empty-state"><span class="empty-icon">⌁</span><b>Нет данных за период</b></div>`;
}

async function renderSettings() {
  $("#page-content").innerHTML = `
    <div class="tabs">
      <button data-tab="questions" class="${state.settingsTab === "questions" ? "active" : ""}">Вопросы</button>
      <button data-tab="users" class="${state.settingsTab === "users" ? "active" : ""}">Пользователи</button>
      <button data-tab="institutions" class="${state.settingsTab === "institutions" ? "active" : ""}">Учреждения</button>
    </div>
    <div id="settings-content"></div>`;
  $$(".tabs button").forEach((button) => {
    button.onclick = () => {
      state.settingsTab = button.dataset.tab;
      renderSettings();
    };
  });
  if (state.settingsTab === "questions") await renderQuestionSettings();
  if (state.settingsTab === "users") await renderUserSettings();
  if (state.settingsTab === "institutions") await renderInstitutionSettings();
}

async function renderQuestionSettings() {
  const questions = await api("/api/questions?include_inactive=true");
  $("#settings-content").innerHTML = `<section class="panel">
    <div class="panel-head">
      <div><h2>Шаблон вопросов</h2><p>Порядок и типы полей в форме справки</p></div>
      <button id="add-question" class="button primary">＋ Добавить вопрос</button>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Порядок</th><th>Вопрос</th><th>Тип ответа</th><th>Обязательный</th><th>Статус</th><th></th></tr></thead>
      <tbody>${questions.map((item) => `<tr>
        <td>${item.sort_order}</td><td class="primary-cell">${escapeHtml(item.text)}</td>
        <td>${answerTypeNames[item.answer_type]}</td><td>${item.required ? "Да" : "Нет"}</td>
        <td><span class="badge ${item.active ? "success" : "inactive"}">${item.active ? "Активен" : "Архив"}</span></td>
        <td><div class="row-actions">${item.active ? `<button class="mini-button edit-question" data-id="${item.id}">✎</button><button class="mini-button danger delete-question" data-id="${item.id}">×</button>` : ""}</div></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </section>`;
  $("#add-question").onclick = () => openQuestionDialog();
  $$(".edit-question").forEach((button) => button.onclick = () => openQuestionDialog(questions.find((item) => item.id === Number(button.dataset.id))));
  $$(".delete-question").forEach((button) => button.onclick = () => archiveEntity("questions", button.dataset.id, "Архивировать этот вопрос?"));
}

function openQuestionDialog(item = null) {
  openDialog({
    kicker: "Настройка формы",
    title: item ? "Редактировать вопрос" : "Новый вопрос",
    body: `<div class="form-grid">
      <label class="full">Текст вопроса<input name="text" required value="${escapeHtml(item?.text || "")}"></label>
      <label class="full">Подсказка<textarea name="help_text">${escapeHtml(item?.help_text || "")}</textarea></label>
      <label>Тип ответа<select name="answer_type">
        ${Object.entries(answerTypeNames).map(([value, name]) => `<option value="${value}" ${item?.answer_type === value ? "selected" : ""}>${name}</option>`).join("")}
      </select></label>
      <label>Порядок<input name="sort_order" type="number" min="0" value="${item?.sort_order ?? 10}"></label>
      <label class="full">Варианты ответа <span class="muted">(по одному в строке)</span><textarea name="options">${escapeHtml((item?.options || []).join("\n"))}</textarea></label>
      <label class="full"><span><input name="required" type="checkbox" style="width:auto;min-height:auto" ${item?.required ? "checked" : ""}> Обязательный вопрос</span></label>
    </div>`,
    onSubmit: async (form) => {
      const data = Object.fromEntries(new FormData(form));
      const payload = {
        text: data.text,
        help_text: data.help_text,
        answer_type: data.answer_type,
        sort_order: Number(data.sort_order),
        options: data.options.split("\n").map((value) => value.trim()).filter(Boolean),
        required: Boolean(data.required),
      };
      await api(item ? `/api/questions/${item.id}` : "/api/questions", {
        method: item ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshAfterSettings("Вопрос сохранён");
    },
  });
}

async function renderUserSettings() {
  const users = await api("/api/users");
  $("#settings-content").innerHTML = `<section class="panel">
    <div class="panel-head">
      <div><h2>Пользователи</h2><p>Логины, роли и доступ к учреждениям</p></div>
      <button id="add-user" class="button primary">＋ Создать пользователя</button>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Сотрудник</th><th>Логин</th><th>Роль</th><th>Учреждение</th><th>Статус</th><th></th></tr></thead>
      <tbody>${users.map((item) => `<tr>
        <td class="primary-cell">${escapeHtml(item.full_name)}</td><td>${escapeHtml(item.username)}</td>
        <td>${{ admin: "Администратор", operator: "Оператор", viewer: "Наблюдатель" }[item.role]}</td>
        <td>${escapeHtml(item.institution_name || "Все учреждения")}</td>
        <td><span class="badge ${item.active ? "success" : "inactive"}">${item.active ? "Активен" : "Отключён"}</span></td>
        <td><div class="row-actions"><button class="mini-button edit-user" data-id="${item.id}">✎</button></div></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </section>`;
  $("#add-user").onclick = () => openUserDialog();
  $$(".edit-user").forEach((button) => button.onclick = () => openUserDialog(users.find((item) => item.id === Number(button.dataset.id))));
}

function openUserDialog(item = null) {
  openDialog({
    kicker: "Учётная запись",
    title: item ? "Редактировать пользователя" : "Новый пользователь",
    body: `<div class="form-grid">
      <label class="full">ФИО<input name="full_name" required value="${escapeHtml(item?.full_name || "")}"></label>
      <label>Логин<input name="username" required autocomplete="off" value="${escapeHtml(item?.username || "")}"></label>
      <label>Пароль ${item ? '<span class="muted">(оставьте пустым без изменения)</span>' : ""}<input name="password" type="password" ${item ? "" : "required"} autocomplete="new-password"></label>
      <label>Роль<select name="role">
        <option value="operator" ${item?.role === "operator" ? "selected" : ""}>Оператор</option>
        <option value="viewer" ${item?.role === "viewer" ? "selected" : ""}>Наблюдатель</option>
        <option value="admin" ${item?.role === "admin" ? "selected" : ""}>Администратор</option>
      </select></label>
      <label>Учреждение<select name="institution_id">${institutionOptions(item?.institution_id, true)}</select></label>
      ${item ? `<label class="full"><span><input name="active" type="checkbox" style="width:auto;min-height:auto" ${item.active ? "checked" : ""}> Учётная запись активна</span></label>` : ""}
    </div>`,
    onSubmit: async (form) => {
      const data = Object.fromEntries(new FormData(form));
      const payload = {
        full_name: data.full_name,
        username: data.username,
        role: data.role,
        institution_id: data.institution_id ? Number(data.institution_id) : null,
      };
      if (data.password) payload.password = data.password;
      if (item) payload.active = Boolean(data.active);
      await api(item ? `/api/users/${item.id}` : "/api/users", {
        method: item ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshAfterSettings("Пользователь сохранён");
    },
  });
}

async function renderInstitutionSettings() {
  const institutions = await api("/api/institutions?include_inactive=true");
  $("#settings-content").innerHTML = `<section class="panel">
    <div class="panel-head">
      <div><h2>Справочник учреждений</h2><p>Реквизиты для форм и итоговых документов</p></div>
      <button id="add-institution" class="button primary">＋ Добавить учреждение</button>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Название</th><th>Адрес</th><th>Ответственный</th><th>Контакты</th><th>Статус</th><th></th></tr></thead>
      <tbody>${institutions.map((item) => `<tr>
        <td class="primary-cell">${escapeHtml(item.name)}</td><td>${escapeHtml(item.address || "—")}</td>
        <td>${escapeHtml(item.contact_name || "—")}</td><td>${escapeHtml(item.phone || item.email || "—")}</td>
        <td><span class="badge ${item.active ? "success" : "inactive"}">${item.active ? "Активно" : "Архив"}</span></td>
        <td><div class="row-actions">${item.active ? `<button class="mini-button edit-institution" data-id="${item.id}">✎</button><button class="mini-button danger delete-institution" data-id="${item.id}">×</button>` : ""}</div></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </section>`;
  $("#add-institution").onclick = () => openInstitutionDialog();
  $$(".edit-institution").forEach((button) => button.onclick = () => openInstitutionDialog(institutions.find((item) => item.id === Number(button.dataset.id))));
  $$(".delete-institution").forEach((button) => button.onclick = () => archiveEntity("institutions", button.dataset.id, "Удалить учреждение из активного справочника?"));
}

function openInstitutionDialog(item = null) {
  openDialog({
    kicker: "Справочник",
    title: item ? "Редактировать учреждение" : "Новое учреждение",
    body: `<div class="form-grid">
      <label class="full">Полное название<input name="name" required value="${escapeHtml(item?.name || "")}"></label>
      <label>Краткое название<input name="short_name" value="${escapeHtml(item?.short_name || "")}"></label>
      <label>Ответственный<input name="contact_name" value="${escapeHtml(item?.contact_name || "")}"></label>
      <label class="full">Адрес<input name="address" value="${escapeHtml(item?.address || "")}"></label>
      <label>Телефон<input name="phone" value="${escapeHtml(item?.phone || "")}"></label>
      <label>Электронная почта<input name="email" type="email" value="${escapeHtml(item?.email || "")}"></label>
    </div>`,
    onSubmit: async (form) => {
      const payload = Object.fromEntries(new FormData(form));
      await api(item ? `/api/institutions/${item.id}` : "/api/institutions", {
        method: item ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshAfterSettings("Учреждение сохранено");
    },
  });
}

function openDialog({ kicker, title, body, onSubmit }) {
  const dialog = $("#entity-dialog");
  $("#dialog-kicker").textContent = kicker;
  $("#dialog-title").textContent = title;
  $("#dialog-body").innerHTML = body;
  $("#dialog-submit").onclick = async (event) => {
    event.preventDefault();
    const form = $(".dialog-card", dialog);
    if (!form.reportValidity()) return;
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await onSubmit(form);
      dialog.close();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      button.disabled = false;
    }
  };
  dialog.showModal();
}

async function archiveEntity(type, id, message) {
  if (!confirm(message)) return;
  try {
    await api(`/api/${type}/${id}`, { method: "DELETE" });
    await refreshAfterSettings("Изменения сохранены");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function refreshAfterSettings(message) {
  await loadBootstrap();
  toast(message);
  await renderSettings();
}

async function viewReport(id) {
  try {
    const report = await api(`/api/reports/${id}`);
    openDialog({
      kicker: `Справка от ${formatDate(report.report_date)}`,
      title: report.institution_name,
      body: `<div class="question-card"><b>Ответственный</b><p>${escapeHtml(report.author_name)}</p></div>
        ${report.answers.map((answer, index) => `<div class="question-card">
          <label><span class="question-number">${index + 1}</span>${escapeHtml(answer.question_text)}</label>
          <p>${escapeHtml(answer.value || "—")}</p>
        </div>`).join("")}
        ${report.notes ? `<div class="question-card"><b>Примечание</b><p>${escapeHtml(report.notes)}</p></div>` : ""}`,
      onSubmit: async () => downloadReport(id),
    });
    $("#dialog-submit").textContent = "Скачать DOCX";
  } catch (error) {
    toast(error.message, "error");
  }
}

async function downloadReport(id) {
  try {
    const response = await fetch(`${apiBase()}/api/reports/${id}/document`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    if (!response.ok) throw new Error("Не удалось сформировать документ");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Справка_${id}.docx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    toast(error.message, "error");
  }
}

function bindCommonActions() {
  $$("[data-go]").forEach((button) => button.onclick = () => navigate(button.dataset.go));
  $$(".view-report").forEach((button) => button.onclick = () => viewReport(button.dataset.id));
  $$(".download-report").forEach((button) => button.onclick = () => downloadReport(button.dataset.id));
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("reporting-offline", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("reports", { keyPath: "client_uid" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function queueReport(report) {
  const database = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction("reports", "readwrite");
    transaction.objectStore("reports").put(report);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  await updatePendingCount();
}

async function pendingReports() {
  const database = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const request = database.transaction("reports").objectStore("reports").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deletePending(clientUid) {
  const database = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction("reports", "readwrite");
    transaction.objectStore("reports").delete(clientUid);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function updatePendingCount() {
  try {
    const reports = await pendingReports();
    $("#pending-count").textContent = reports.length;
    return reports.length;
  } catch (_) {
    return 0;
  }
}

async function syncPending(showMessage = false) {
  if (!navigator.onLine || !state.token) return;
  const reports = await pendingReports();
  let synced = 0;
  for (const report of reports) {
    try {
      await api("/api/reports", { method: "POST", body: JSON.stringify(report) });
      await deletePending(report.client_uid);
      synced += 1;
    } catch (error) {
      if (!error.network) toast(`Не синхронизировано: ${error.message}`, "error");
      break;
    }
  }
  await updatePendingCount();
  if (synced) {
    await loadBootstrap();
    if (state.page === "dashboard") await renderDashboard();
    toast(`Синхронизировано справок: ${synced}`);
  } else if (showMessage) {
    toast(reports.length ? "Синхронизация пока недоступна" : "Все данные синхронизированы");
  }
}

function updateConnectionState() {
  const element = $("#connection-state");
  element.classList.toggle("offline", !navigator.onLine);
  $("span", element).textContent = navigator.onLine ? "Подключено к серверу" : "Офлайн-режим";
}

async function start() {
  $("#login-form").addEventListener("submit", login);
  $("#toggle-password").onclick = () => {
    const input = $("#login-password");
    input.type = input.type === "password" ? "text" : "password";
  };
  $("#logout-button").onclick = () => logout();
  $("#menu-button").onclick = () => $("#sidebar").classList.toggle("open");
  $("#main-nav").onclick = (event) => {
    const button = event.target.closest("[data-page]");
    if (button) navigate(button.dataset.page);
  };
  $$(".topbar [data-go]").forEach((button) => button.onclick = () => navigate(button.dataset.go));
  $("#sync-button").onclick = () => syncPending(true);
  window.addEventListener("online", () => {
    updateConnectionState();
    syncPending();
  });
  window.addEventListener("offline", updateConnectionState);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  if (!state.token) return showLogin();
  try {
    await loadBootstrap();
    showApp();
    syncPending();
  } catch (error) {
    if (error.network && state.bootstrap && state.user) {
      showApp();
      toast("Работа без подключения к серверу");
    } else {
      showLogin();
    }
  }
}

start();
