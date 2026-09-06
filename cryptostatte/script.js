const state = {
  direction: "buy",
  fiat: "USD",
  symbol: "$",
  network: "TRC20",
};

const fiatRates = {
  USD: 0.997,
  EUR: 1.075,
  TRY: 0.029,
};

const ratePrecision = {
  USD: 3,
  EUR: 3,
  TRY: 4,
};

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const mobileCta = document.querySelector(".mobile-cta");

const amountInput = document.querySelector("[data-send-amount]");
const amountOutput = document.querySelector("[data-receive-amount]");
const sendLabel = document.querySelector("[data-send-label]");
const sendMeta = document.querySelector("[data-balance-label]");
const receiveMeta = document.querySelector("[data-network-label]");
const fiatTrigger = document.querySelector("[data-fiat-trigger]");
const fiatMenu = document.querySelector("[data-fiat-menu]");
const fiatCode = document.querySelector("[data-fiat-code]");
const fiatIcon = document.querySelector("[data-fiat-icon]");
const usdtDisplay = document.querySelector(".currency-static");
const sendRow = amountInput.closest(".exchange-field__row");
const receiveRow = amountOutput.closest(".exchange-field__row");
const rateOutput = document.querySelector("[data-rate]");
const exchangeLink = document.querySelector("[data-exchange-link]");
const directionTabs = document.querySelectorAll("[data-direction]");
const networkButtons = document.querySelectorAll("[data-network]");

const parseAmount = (value) => {
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const formatInputAmount = (amount) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(amount);

const formatResult = (amount, currency) => {
  const maximumFractionDigits = currency === "TRY" ? 2 : 2;
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(amount);
};

const updateExchangeLink = (amount, result) => {
  const fromCurrency = state.direction === "buy" ? state.fiat : "USDT";
  const toCurrency = state.direction === "buy" ? "USDT" : state.fiat;
  const message = [
    "Здравствуйте! Хочу совершить обмен:",
    `${formatInputAmount(amount)} ${fromCurrency} → ${result} ${toCurrency}`,
    `Сеть USDT: ${state.network}`,
  ].join("\n");

  exchangeLink.href = `https://t.me/cryptostatte_ex?text=${encodeURIComponent(message)}`;
};

const calculate = () => {
  const amount = parseAmount(amountInput.value);
  const fiatRate = fiatRates[state.fiat];
  const isBuy = state.direction === "buy";
  const result = isBuy ? amount * fiatRate : (amount / fiatRate) * 0.997;
  const resultCurrency = isBuy ? "USDT" : state.fiat;
  const formattedResult = formatResult(result, resultCurrency);

  amountOutput.textContent = formattedResult;

  if (isBuy) {
    rateOutput.textContent = `1 ${state.fiat} ≈ ${fiatRate.toFixed(
      ratePrecision[state.fiat],
    )} USDT`;
  } else {
    const reverseRate = 0.997 / fiatRate;
    rateOutput.textContent = `1 USDT ≈ ${reverseRate.toFixed(
      ratePrecision[state.fiat],
    )} ${state.fiat}`;
  }

  updateExchangeLink(amount, formattedResult);
};

const updateDirection = () => {
  const isBuy = state.direction === "buy";

  directionTabs.forEach((tab) => {
    const active = tab.dataset.direction === state.direction;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  sendLabel.textContent = "Вы отдаёте";
  sendMeta.textContent = isBuy ? "Фиат" : `Сеть ${state.network}`;
  receiveMeta.textContent = isBuy ? `Сеть ${state.network}` : "Фиат";

  if (isBuy) {
    sendRow.append(fiatTrigger);
    receiveRow.append(usdtDisplay);
  } else {
    sendRow.append(usdtDisplay);
    receiveRow.append(fiatTrigger);
  }
  fiatTrigger.closest(".exchange-field").append(fiatMenu);

  fiatTrigger.setAttribute(
    "aria-label",
    isBuy ? "Выбрать исходную фиатную валюту" : "Выбрать валюту получения",
  );
  calculate();
};

const closeCurrencyMenu = () => {
  fiatMenu.classList.remove("is-open");
  fiatTrigger.setAttribute("aria-expanded", "false");
};

fiatTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = !fiatMenu.classList.contains("is-open");
  fiatMenu.classList.toggle("is-open", willOpen);
  fiatTrigger.setAttribute("aria-expanded", String(willOpen));
});

fiatMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-currency]");
  if (!option) return;

  state.fiat = option.dataset.currency;
  state.symbol = option.dataset.symbol;
  fiatCode.textContent = state.fiat;
  fiatIcon.textContent = state.symbol;
  closeCurrencyMenu();
  calculate();
});

document.addEventListener("click", (event) => {
  if (!fiatMenu.contains(event.target) && !fiatTrigger.contains(event.target)) {
    closeCurrencyMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCurrencyMenu();
    if (nav.classList.contains("is-open")) {
      toggleMenu(false);
      menuToggle.focus();
    }
  }
});

amountInput.addEventListener("input", calculate);
amountInput.addEventListener("focus", () => {
  amountInput.value = amountInput.value.replace(/\s/g, "");
  amountInput.select();
});
amountInput.addEventListener("blur", () => {
  amountInput.value = formatInputAmount(parseAmount(amountInput.value));
  calculate();
});

directionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.direction = tab.dataset.direction;
    closeCurrencyMenu();
    updateDirection();
  });
});

networkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.network = button.dataset.network;
    networkButtons.forEach((networkButton) => {
      networkButton.classList.toggle(
        "is-active",
        networkButton.dataset.network === state.network,
      );
    });
    sendMeta.textContent =
      state.direction === "sell" ? `Сеть ${state.network}` : "Фиат";
    receiveMeta.textContent =
      state.direction === "buy" ? `Сеть ${state.network}` : "Фиат";
    calculate();
  });
});

const toggleMenu = (open) => {
  nav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", open);
};

menuToggle.addEventListener("click", () => {
  toggleMenu(!nav.classList.contains("is-open"));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(false));
});

const handleScroll = () => {
  const scrollTop = window.scrollY;
  header.classList.toggle("is-scrolled", scrollTop > 24);
  mobileCta?.classList.toggle("is-visible", scrollTop > 520);
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((otherDetail) => {
      if (otherDetail !== detail) otherDetail.open = false;
    });
  });
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
updateDirection();
