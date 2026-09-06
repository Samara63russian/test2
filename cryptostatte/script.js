const rates = {
  USD: { target: "USDT", value: 0.998, label: "1 USD ≈ 0.998 USDT" },
  EUR: { target: "USDT", value: 1.082, label: "1 EUR ≈ 1.082 USDT" },
  TRY: { target: "USDT", value: 0.0304, label: "1 TRY ≈ 0.0304 USDT" },
  USDT: { target: "USD", value: 0.998, label: "1 USDT ≈ 0.998 USD" }
};

const amountInput = document.querySelector("#amount-input");
const fromCurrency = document.querySelector("#from-currency");
const resultAmount = document.querySelector("#result-amount");
const resultCurrency = document.querySelector("#result-currency");
const rateLabel = document.querySelector("#rate-label");
const directionLabel = document.querySelector("#direction-label");
const receiveLabel = document.querySelector("#receive-label");
const swapButton = document.querySelector("#swap-button");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

let isReversed = false;

function formatAmount(value) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function updateCalculator() {
  const source = fromCurrency.value;
  const rate = rates[source];
  const amount = Math.max(0, Number(amountInput.value) || 0);
  const target = rate.target;

  resultAmount.textContent = formatAmount(amount * rate.value);
  resultCurrency.textContent = target;
  rateLabel.textContent = rate.label;
  directionLabel.textContent = isReversed ? "Вы получаете" : "Вы отдаёте";
  receiveLabel.textContent = isReversed ? "Вы отдаёте" : "Вы получаете";
}

amountInput.addEventListener("input", updateCalculator);
fromCurrency.addEventListener("change", updateCalculator);

swapButton.addEventListener("click", () => {
  isReversed = !isReversed;
  const current = fromCurrency.value;
  fromCurrency.value = rates[current].target === "USD" ? "USD" : "USDT";
  updateCalculator();
});

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

updateCalculator();
