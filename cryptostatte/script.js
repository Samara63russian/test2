document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenu(false);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -30px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const processLine = document.querySelector(".process-line");
const lineObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      processLine.classList.add("visible");
      lineObserver.disconnect();
    }
  },
  { threshold: 0.5 },
);
lineObserver.observe(processLine);

const modeTabs = document.querySelectorAll(".mode-tab");
const swapButton = document.querySelector(".swap-button");
const amountInput = document.querySelector("#give-amount");
const receiveAmount = document.querySelector("#receive-amount");
const giveFiat = document.querySelector("#give-fiat");
const receiveFiat = document.querySelector("#receive-fiat");
const giveUsdt = document.querySelector("#give-usdt");
const receiveUsdt = document.querySelector("#receive-usdt");
const rateLabel = document.querySelector("#rate-label");
const exchangeLink = document.querySelector("#exchange-link");
const networkButtons = document.querySelectorAll(".network");

const buyRates = {
  USD: 0.995,
  EUR: 1.08,
  TRY: 0.0242,
};

let currentMode = "buy";
let currentNetwork = "TRC20";

function parseAmount(value) {
  const normalized = value.replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number.parseFloat(normalized) || 0;
}

function formatAmount(value, currency) {
  const maximumFractionDigits = currency === "TRY" ? 2 : 2;
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

function selectedFiat() {
  return currentMode === "buy" ? giveFiat.value : receiveFiat.value;
}

function updateCalculator() {
  const amount = parseAmount(amountInput.value);
  const fiat = selectedFiat();
  const buyRate = buyRates[fiat];
  const sellRate = (1 / buyRate) * 0.985;
  const result = currentMode === "buy" ? amount * buyRate : amount * sellRate;
  const outputCurrency = currentMode === "buy" ? "USDT" : fiat;

  receiveAmount.textContent = formatAmount(result, outputCurrency);
  rateLabel.textContent =
    currentMode === "buy"
      ? `1 ${fiat} ≈ ${buyRate.toFixed(fiat === "TRY" ? 4 : 3)} USDT`
      : `1 USDT ≈ ${sellRate.toFixed(fiat === "TRY" ? 2 : 3)} ${fiat}`;

  const giveCurrency = currentMode === "buy" ? fiat : "USDT";
  const message = [
    "Здравствуйте! Хочу рассчитать обмен:",
    `${formatAmount(amount, giveCurrency)} ${giveCurrency} → ${formatAmount(result, outputCurrency)} ${outputCurrency}`,
    `Сеть: ${currentNetwork}`,
  ].join("\n");

  exchangeLink.href = `https://t.me/cryptostatte_ex?text=${encodeURIComponent(message)}`;
}

function setMode(mode) {
  currentMode = mode;

  modeTabs.forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  giveFiat.hidden = mode !== "buy";
  giveUsdt.hidden = mode === "buy";
  receiveFiat.hidden = mode === "buy";
  receiveUsdt.hidden = mode !== "buy";
  updateCalculator();
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

swapButton.addEventListener("click", () => {
  setMode(currentMode === "buy" ? "sell" : "buy");
});

amountInput.addEventListener("input", updateCalculator);
amountInput.addEventListener("blur", () => {
  const value = parseAmount(amountInput.value);
  amountInput.value = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
});

giveFiat.addEventListener("change", () => {
  receiveFiat.value = giveFiat.value;
  updateCalculator();
});

receiveFiat.addEventListener("change", () => {
  giveFiat.value = receiveFiat.value;
  updateCalculator();
});

networkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentNetwork = button.dataset.network;
    networkButtons.forEach((item) => item.classList.toggle("active", item === button));
    updateCalculator();
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
setMode("buy");
