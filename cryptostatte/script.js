document.documentElement.classList.add("js");

const rates = {
  USD: 1,
  EUR: 1.08,
  TRY: 0.03,
};

const symbols = {
  USD: "$",
  EUR: "€",
  TRY: "₺",
};

const state = {
  mode: "buy",
  currency: "USD",
  network: "TRC20",
};

const sendAmount = document.querySelector("#send-amount");
const receiveAmount = document.querySelector("#receive-amount");
const currencySelect = document.querySelector("#send-currency");
const currencySymbol = document.querySelector("#send-symbol");
const currencySelectWrap = document.querySelector(".currency-select-wrap");
const currencyBadge = document.querySelector(".currency-badge");
const sendControl = sendAmount.closest(".field-control");
const receiveControl = receiveAmount.closest(".field-control");
const sendHint = document.querySelector("#send-hint");
const receiveHint = document.querySelector("#receive-hint");
const rateLabel = document.querySelector("#rate-label");
const exchangeLink = document.querySelector("#exchange-link");
const modeButtons = [...document.querySelectorAll(".trade-mode")];
const networkButtons = [...document.querySelectorAll(".network")];
const swapButton = document.querySelector(".swap-button");

const parseAmount = (value) => {
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const formatAmount = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);

const setTelegramDraft = (sendValue, receiveValue) => {
  const fiat = state.currency;
  const direction =
    state.mode === "buy"
      ? `${formatAmount(sendValue)} ${fiat} → ${formatAmount(receiveValue)} USDT`
      : `${formatAmount(sendValue)} USDT → ${formatAmount(receiveValue)} ${fiat}`;
  const message = `Здравствуйте! Хочу совершить обмен: ${direction}, сеть ${state.network}.`;
  exchangeLink.href = `https://t.me/cryptostatte_ex?text=${encodeURIComponent(message)}`;
};

const updateCalculator = () => {
  const amount = parseAmount(sendAmount.value);
  const marketRate = rates[state.currency];
  const serviceFactor = 0.995;
  const result =
    state.mode === "buy"
      ? amount * marketRate * serviceFactor
      : (amount / marketRate) * serviceFactor;

  receiveAmount.value = formatAmount(result, state.currency === "TRY" ? 0 : 2);

  if (state.mode === "buy") {
    rateLabel.textContent = `1 ${state.currency} ≈ ${formatAmount(
      marketRate * serviceFactor,
      3,
    )} USDT`;
  } else {
    rateLabel.textContent = `1 USDT ≈ ${formatAmount(
      serviceFactor / marketRate,
      state.currency === "TRY" ? 2 : 3,
    )} ${state.currency}`;
  }

  setTelegramDraft(amount, result);
};

const setMode = (mode) => {
  state.mode = mode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (mode === "buy") {
    sendControl.append(currencySelectWrap);
    receiveControl.append(currencyBadge);
    sendHint.textContent = "Любой удобный способ оплаты";
    receiveHint.textContent = "Зачисление прямо на ваш кошелёк";
  } else {
    sendControl.append(currencyBadge);
    receiveControl.append(currencySelectWrap);
    sendHint.textContent = "USDT с вашего кошелька";
    receiveHint.textContent = "Выплата в выбранной валюте";
  }

  updateCalculator();
};

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

swapButton.addEventListener("click", () => {
  setMode(state.mode === "buy" ? "sell" : "buy");
});

currencySelect.addEventListener("change", (event) => {
  state.currency = event.target.value;
  currencySymbol.textContent = symbols[state.currency];
  updateCalculator();
});

sendAmount.addEventListener("input", () => {
  const cleaned = sendAmount.value
    .replace(/[^\d\s,.]/g, "")
    .replace(/([,.].*)[,.]/g, "$1");
  if (cleaned !== sendAmount.value) sendAmount.value = cleaned;
  updateCalculator();
});

sendAmount.addEventListener("focus", () => {
  sendAmount.value = String(parseAmount(sendAmount.value) || "");
});

sendAmount.addEventListener("blur", () => {
  const amount = parseAmount(sendAmount.value);
  sendAmount.value = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(amount || 0);
  updateCalculator();
});

networkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.network = button.dataset.network;
    networkButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    updateCalculator();
  });
});

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const header = document.querySelector(".site-header");

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-active");
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
};

const openMenu = () => {
  document.body.classList.add("menu-open");
  header.classList.add("menu-active");
  mobileMenu.classList.add("open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Закрыть меню");
};

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (isOpen) closeMenu();
  else openMenu();
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("in-view"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -7% 0px",
      threshold: 0.08,
    },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelector(".to-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();

setMode("buy");
networkButtons[0].setAttribute("aria-pressed", "true");
networkButtons[1].setAttribute("aria-pressed", "false");
