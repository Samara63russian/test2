const CATEGORY_LABELS = {
  commercial_proposal: "Коммерческое предложение",
  catalog: "Перечень / прайс",
  general: "Общий запрос",
};

const STATUS_LABELS = {
  new: "Новый",
  in_progress: "В работе",
  completed: "Завершён",
  archived: "Архив",
};

const DEMO_EMAIL = {
  sender: "procurement@techcorp.ru",
  subject: "Запрос коммерческого предложения на поставку оборудования",
  body: `Добрый день!

Просим направить коммерческое предложение на поставку 15 серверов и 3 СХД.
Нужен перечень оборудования с характеристиками и цены с НДС.
Срок поставки — до 30 ноября 2026 года.
Просьба также указать условия оплаты и гарантию.

С уважением,
Анна Петрова
Отдел закупок`,
};

const toastEl = document.getElementById("toast");
const requestsListEl = document.getElementById("requests-list");
const statsEl = document.getElementById("stats");
const modal = document.getElementById("detail-modal");
const modalBody = document.getElementById("modal-body");

function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.style.borderColor = isError ? "var(--danger)" : "var(--border)";
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.add("hidden"), 3500);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let detail = "Ошибка запроса";
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (response.status === 204) return null;
  return response.json();
}

function formatDate(value) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStats(stats) {
  const items = [
    ["Всего", stats.total],
    ["Новые", stats.new],
    ["В работе", stats.in_progress],
    ["КП", stats.commercial_proposal],
    ["Перечни", stats.catalog],
    ["Запросы", stats.general],
  ];
  statsEl.innerHTML = items
    .map(
      ([label, value]) => `
      <div class="stat-card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>`
    )
    .join("");
}

function renderRequests(requests) {
  if (!requests.length) {
    requestsListEl.innerHTML =
      '<div class="empty-state">Пока нет записей. Добавьте письмо вручную или загрузите из почты.</div>';
    return;
  }

  requestsListEl.innerHTML = requests
    .map(
      (item) => `
      <article class="request-card" data-id="${item.id}">
        <div class="request-top">
          <div>
            <h3>${escapeHtml(item.subject || "Без темы")}</h3>
            <div class="meta">${escapeHtml(item.sender || "Неизвестный отправитель")} · ${formatDate(item.created_at)}</div>
          </div>
        </div>
        <p class="summary">${escapeHtml(item.summary)}</p>
        <div class="tags">
          <span class="tag category-${item.category}">${CATEGORY_LABELS[item.category]}</span>
          <span class="tag status-${item.status}">${STATUS_LABELS[item.status]}</span>
          <span class="tag">${item.ai_provider === "groq" ? "AI: Groq" : "AI: локально"}</span>
        </div>
      </article>`
    )
    .join("");

  document.querySelectorAll(".request-card").forEach((card) => {
    card.addEventListener("click", () => openRequest(card.dataset.id));
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadDashboard() {
  const status = document.getElementById("filter-status").value;
  const category = document.getElementById("filter-category").value;
  const search = document.getElementById("search-input").value.trim();
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (category) params.set("category", category);
  if (search) params.set("search", search);

  const [stats, requests] = await Promise.all([
    api("/api/stats"),
    api(`/api/requests?${params.toString()}`),
  ]);
  renderStats(stats);
  renderRequests(requests);
}

async function loadSettings() {
  const settings = await api("/api/settings");
  const aiBadge = document.getElementById("ai-badge");
  aiBadge.textContent =
    settings.ai_provider === "groq" ? "AI: Groq (бесплатно)" : "AI: локальный режим";
  document.getElementById("groq-status").textContent = settings.groq_configured
    ? "Статус: Groq API подключён"
    : "Статус: используется локальный режим";
  document.getElementById("imap-status").textContent = settings.imap_configured
    ? "Статус: IMAP настроен"
    : "Статус: IMAP не настроен";
}

async function openRequest(id) {
  const item = await api(`/api/requests/${id}`);
  modalBody.innerHTML = `
    <h3>${escapeHtml(item.subject || "Без темы")}</h3>
    <div class="meta">${escapeHtml(item.sender || "Неизвестный отправитель")} · ${formatDate(item.created_at)}</div>
    <div class="modal-body-block">
      <h4>Конспект</h4>
      <p>${escapeHtml(item.summary)}</p>
    </div>
    <div class="modal-body-block">
      <h4>Оригинал письма</h4>
      <pre style="white-space: pre-wrap; margin: 0;">${escapeHtml(item.body)}</pre>
    </div>
    <div class="modal-actions">
      <button class="btn secondary" data-status="in_progress">В работу</button>
      <button class="btn primary" data-status="completed">Завершить</button>
      <button class="btn secondary" data-status="archived">В архив</button>
      <button class="btn danger" id="delete-request">Удалить</button>
    </div>`;

  modalBody.querySelectorAll("[data-status]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await api(`/api/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: btn.dataset.status }),
      });
      showToast("Статус обновлён");
      modal.close();
      loadDashboard();
    });
  });

  document.getElementById("delete-request").addEventListener("click", async () => {
    if (!confirm("Удалить запись?")) return;
    await api(`/api/requests/${id}`, { method: "DELETE" });
    showToast("Запись удалена");
    modal.close();
    loadDashboard();
  });

  modal.showModal();
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`view-${viewName}`).classList.add("active");
  document.querySelector(`.nav-btn[data-view="${viewName}"]`).classList.add("active");
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView(btn.dataset.view);
    if (btn.dataset.view === "settings") loadSettings();
  });
});

document.getElementById("refresh-btn").addEventListener("click", () => {
  loadDashboard().catch((err) => showToast(err.message, true));
});

document.getElementById("fetch-imap-btn").addEventListener("click", async () => {
  try {
    const result = await api("/api/imap/fetch", { method: "POST" });
    showToast(`Загружено: ${result.created} новых, пропущено: ${result.skipped}`);
    loadDashboard();
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById("search-input").addEventListener("input", debounce(loadDashboard, 300));
document.getElementById("filter-status").addEventListener("change", loadDashboard);
document.getElementById("filter-category").addEventListener("change", loadDashboard);

document.getElementById("add-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const payload = {
    sender: form.sender.value.trim(),
    subject: form.subject.value.trim(),
    body: form.body.value.trim(),
  };
  try {
    await api("/api/requests", { method: "POST", body: JSON.stringify(payload) });
    showToast("Письмо проанализировано и сохранено");
    form.reset();
    switchView("dashboard");
    loadDashboard();
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById("fill-demo-btn").addEventListener("click", () => {
  const form = document.getElementById("add-form");
  form.sender.value = DEMO_EMAIL.sender;
  form.subject.value = DEMO_EMAIL.subject;
  form.body.value = DEMO_EMAIL.body;
});

document.getElementById("close-modal").addEventListener("click", () => modal.close());

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

loadSettings().catch(() => {});
loadDashboard().catch((err) => showToast(err.message, true));
