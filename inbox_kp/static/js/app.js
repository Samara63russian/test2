const KINDS = [
  { id: "all", label: "Все" },
  { id: "kp", label: "Запросы КП" },
  { id: "catalog", label: "Перечень / прайс" },
  { id: "inquiry", label: "Простые запросы" },
  { id: "other", label: "Другое" },
];

const STATUSES = [
  { id: "all", label: "Любой статус" },
  { id: "new", label: "Новые" },
  { id: "in_progress", label: "В работе" },
  { id: "quoted", label: "КП отправлено" },
  { id: "closed", label: "Закрыто" },
  { id: "ignored", label: "Не целевые" },
];

const STATUS_ACTIONS = [
  { id: "new", label: "Новый" },
  { id: "in_progress", label: "В работе" },
  { id: "quoted", label: "КП отправлено" },
  { id: "closed", label: "Закрыто" },
  { id: "ignored", label: "Не целевое" },
];

const state = {
  items: [],
  selected: null,
  kind: "all",
  status: "all",
  q: "",
  settings: null,
};

const $ = (id) => document.getElementById(id);

function toast(text) {
  const el = $("toast");
  el.hidden = false;
  el.textContent = text;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 3200);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || res.statusText);
  }
  return data;
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function providerLabel(name) {
  return (
    {
      groq: "Groq · Llama",
      gemini: "Gemini",
      "openai-compatible": "локальная модель",
      heuristic: "встроенный разбор",
    }[name] || name
  );
}

function renderFilters() {
  $("kind-filters").innerHTML = KINDS.map(
    (k) => `<button class="filter ${state.kind === k.id ? "active" : ""}" data-kind="${k.id}">${k.label}</button>`
  ).join("");
  $("status-filters").innerHTML = STATUSES.map(
    (s) => `<button class="filter ${state.status === s.id ? "active" : ""}" data-status="${s.id}">${s.label}</button>`
  ).join("");
}

function renderMeters(stats) {
  const kind = stats.by_kind || {};
  $("meters").innerHTML = [
    ["Всего", stats.total || 0],
    ["КП", kind.kp || 0],
    ["Перечень", kind.catalog || 0],
    ["Запросы", kind.inquiry || 0],
    ["Срочные", stats.high || 0],
  ]
    .map(([label, n]) => `<div class="meter"><b>${n}</b><span>${label}</span></div>`)
    .join("");
}

function renderList() {
  const list = $("list");
  $("list-count").textContent = `${state.items.length}`;
  const currentKind = KINDS.find((k) => k.id === state.kind);
  $("list-title").textContent = currentKind ? currentKind.label : "Входящие";
  if (!state.items.length) {
    list.innerHTML = `<div class="empty-detail"><p>Пока пусто. Вставьте письмо или нажмите «Демо».</p></div>`;
    return;
  }
  list.innerHTML = state.items
    .map((item) => {
      const active = state.selected === item.id ? "active" : "";
      return `<button class="item ${active}" data-id="${item.id}">
        <div class="item-top">
          <span class="stamp ${item.kind}">${item.kind_label}</span>
          ${item.urgency === "high" ? `<span class="flag high">срочно</span>` : ""}
        </div>
        <h3>${escapeHtml(item.company || item.from_name || item.title)}</h3>
        <p>${escapeHtml(item.summary || item.subject)}</p>
        <div class="meta">
          <span>${escapeHtml(item.from_email || "")}</span>
          <span>${fmtDate(item.received_at)}</span>
          <span>${statusLabel(item.status)}</span>
        </div>
      </button>`;
    })
    .join("");
}

function statusLabel(id) {
  return STATUS_ACTIONS.find((s) => s.id === id)?.label || id;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDetail(item) {
  const root = $("detail");
  if (!item) {
    root.innerHTML = `<div class="empty-detail"><p class="seal">Нет выбранного письма</p><p>Вставьте текст из почты или загрузите демо, чтобы увидеть конспект и карточку запроса.</p></div>`;
    return;
  }
  const products = (item.products || []).map((p) => `<span class="chip">${escapeHtml(p)}</span>`).join("");
  const events = (item.events || [])
    .map((ev) => `<li>${fmtDate(ev.created_at)} — ${escapeHtml(ev.text)}</li>`)
    .join("");
  root.innerHTML = `
    <div class="detail">
      <div class="letterhead">
        <div>
          <div class="kicker">${escapeHtml(item.kind_label)} · ${providerLabel(item.ai_provider)}</div>
          <h2>${escapeHtml(item.title)}</h2>
        </div>
        <span class="stamp ${item.kind}">${escapeHtml(item.kind_label)}</span>
      </div>
      <div class="conspect">
        <h3>Конспект</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>
      <div class="action-box"><b>Следующий шаг:</b> ${escapeHtml(item.action || "—")}</div>
      <div class="facts">
        <div class="fact"><span>Компания</span><b>${escapeHtml(item.company || "—")}</b></div>
        <div class="fact"><span>Контакт</span><b>${escapeHtml(item.contact_name || item.from_name || "—")}</b></div>
        <div class="fact"><span>Почта</span><b>${escapeHtml(item.from_email || "—")}</b></div>
        <div class="fact"><span>Телефон</span><b>${escapeHtml(item.phone || "—")}</b></div>
        <div class="fact"><span>Срок</span><b>${escapeHtml(item.deadline || "—")}</b></div>
        <div class="fact"><span>Количество</span><b>${escapeHtml(item.quantity || "—")}</b></div>
      </div>
      ${products ? `<div class="products">${products}</div>` : ""}
      <div class="status-row" id="status-row">
        ${STATUS_ACTIONS.map(
          (s) => `<button class="btn ${item.status === s.id ? "active" : "ghost"}" data-status="${s.id}">${s.label}</button>`
        ).join("")}
      </div>
      <label class="kicker">Заметки менеджера</label>
      <textarea class="notes" id="notes">${escapeHtml(item.notes)}</textarea>
      <div class="edit-row">
        <button class="btn" id="save-notes">Сохранить заметки</button>
        <button class="btn ghost" id="reanalyze">Пересобрать конспект</button>
        <button class="btn ghost" id="delete-item">Удалить</button>
      </div>
      <div class="kicker">Исходное письмо</div>
      <div class="body-mail">${escapeHtml(item.subject)}\n\n${escapeHtml(item.body_text)}</div>
      <ul class="events">${events}</ul>
    </div>
  `;

  $("status-row").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-status]");
    if (!btn) return;
    const updated = await api(`/api/requests/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: btn.dataset.status }),
    });
    await refresh(updated.id);
  });
  $("save-notes").onclick = async () => {
    const updated = await api(`/api/requests/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ notes: $("notes").value }),
    });
    toast("Заметки сохранены");
    await refresh(updated.id);
  };
  $("reanalyze").onclick = async () => {
    toast("Пересобираю конспект…");
    const updated = await api(`/api/requests/${item.id}/reanalyze`, { method: "POST", body: "{}" });
    await refresh(updated.id);
  };
  $("delete-item").onclick = async () => {
    if (!confirm("Удалить карточку?")) return;
    await api(`/api/requests/${item.id}`, { method: "DELETE" });
    state.selected = null;
    await refresh();
  };
}

async function refresh(selectId) {
  const stats = await api("/api/stats");
  renderMeters(stats);
  const qs = new URLSearchParams();
  if (state.kind !== "all") qs.set("kind", state.kind);
  if (state.status !== "all") qs.set("status", state.status);
  if (state.q) qs.set("q", state.q);
  const data = await api(`/api/requests?${qs.toString()}`);
  state.items = data.items;
  renderList();
  const id = selectId || state.selected || state.items[0]?.id;
  state.selected = id || null;
  if (id) {
    const detail = await api(`/api/requests/${id}`);
    renderDetail(detail);
    renderList();
  } else {
    renderDetail(null);
  }
}

function bindUi() {
  renderFilters();
  $("kind-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-kind]");
    if (!btn) return;
    state.kind = btn.dataset.kind;
    renderFilters();
    refresh();
  });
  $("status-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if (!btn) return;
    state.status = btn.dataset.status;
    renderFilters();
    refresh();
  });
  $("list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    refresh(btn.dataset.id);
  });
  let t;
  $("q").addEventListener("input", (e) => {
    state.q = e.target.value;
    clearTimeout(t);
    t = setTimeout(() => refresh(), 180);
  });

  $("btn-paste").onclick = () => $("modal-paste").showModal();
  $("paste-cancel").onclick = () => $("modal-paste").close();
  $("form-paste").addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = $("raw-email").value.trim();
    if (!raw) return;
    try {
      const res = await api("/api/requests/ingest", {
        method: "POST",
        body: JSON.stringify({ raw, source: "paste" }),
      });
      $("modal-paste").close();
      $("raw-email").value = "";
      toast(res.created ? "Карточка создана" : "Такое письмо уже есть");
      await refresh(res.item.id);
    } catch (err) {
      toast(err.message);
    }
  });

  $("file-eml").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/requests/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) return toast(data.detail || "Не удалось прочитать файл");
    toast(data.created ? "Файл разобран" : "Письмо уже было в журнале");
    await refresh(data.item.id);
  });

  $("btn-demo").onclick = async () => {
    const res = await api("/api/demo", { method: "POST", body: "{}" });
    toast(`Демо: новых ${res.created}, уже были ${res.skipped}`);
    await refresh(res.ids[0]);
  };

  $("btn-imap").onclick = async () => {
    try {
      toast("Читаю почтовый ящик…");
      const res = await api("/api/mail/fetch", { method: "POST", body: "{}" });
      toast(`Почта: новых ${res.created} из ${res.fetched}`);
      await refresh(res.ids[0]);
    } catch (err) {
      toast(err.message);
      $("modal-settings").showModal();
    }
  };

  $("btn-settings").onclick = async () => {
    await loadSettingsForm();
    $("modal-settings").showModal();
  };
  $("settings-cancel").onclick = () => $("modal-settings").close();
  $("form-settings").addEventListener("submit", async (e) => {
    e.preventDefault();
    const values = {
      groq_api_key: $("set-groq").value,
      gemini_api_key: $("set-gemini").value,
      ai_model: $("set-model").value,
      openai_base_url: $("set-openai-url").value,
      imap_host: $("set-imap-host").value,
      imap_port: $("set-imap-port").value,
      imap_user: $("set-imap-user").value,
      imap_password: $("set-imap-pass").value,
      imap_folder: $("set-imap-folder").value,
      imap_unseen_only: $("set-imap-unseen").checked ? "1" : "0",
    };
    await api("/api/settings", { method: "PUT", body: JSON.stringify({ values }) });
    $("modal-settings").close();
    toast("Настройки сохранены");
  });
}

async function loadSettingsForm() {
  const data = await api("/api/settings");
  const v = data.values;
  $("set-groq").value = "";
  $("set-groq").placeholder = v.groq_api_key?.set ? v.groq_api_key.preview : "gsk_…";
  $("set-gemini").value = "";
  $("set-gemini").placeholder = v.gemini_api_key?.set ? v.gemini_api_key.preview : "";
  $("set-model").value = v.ai_model || "";
  $("set-openai-url").value = v.openai_base_url || "";
  $("set-imap-host").value = v.imap_host || "";
  $("set-imap-port").value = v.imap_port || "993";
  $("set-imap-user").value = v.imap_user || "";
  $("set-imap-pass").value = "";
  $("set-imap-pass").placeholder = v.imap_password?.set ? v.imap_password.preview : "";
  $("set-imap-folder").value = v.imap_folder || "INBOX";
  $("set-imap-unseen").checked = v.imap_unseen_only !== "0";
  $("provider-pills").innerHTML = Object.entries(data.providers)
    .map(([name, on]) => `<span class="pill ${on ? "on" : ""}">${name}${on ? " · вкл" : ""}</span>`)
    .join("");
}

bindUi();
refresh().catch((err) => toast(err.message));
