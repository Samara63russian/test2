(() => {
  const FIAT = [
    "RUB", "USD", "EUR", "GBP", "CHF", "CNY", "TRY", "AED", "JPY",
    "KZT", "UAH", "BYN", "UZS", "GEL", "AMD", "AZN", "PLN", "CZK",
    "SEK", "NOK", "DKK", "CAD", "AUD", "NZD", "HKD", "SGD", "KRW",
    "INR", "THB", "IDR", "MYR", "PHP", "VND", "BRL", "MXN", "ARS",
    "ZAR", "ILS", "SAR", "QAR", "EGP", "NGN",
  ];
  const CRYPTO = ["USDT"];
  const FALLBACK = {
    RUB: 0.0112, USD: 1, EUR: 1.085, GBP: 1.27, CHF: 1.12, CNY: 0.138,
    TRY: 0.0294, AED: 0.272, JPY: 0.0067, KZT: 0.0019, UAH: 0.024,
    BYN: 0.305, UZS: 0.000079, GEL: 0.37, AMD: 0.0026, AZN: 0.59,
    PLN: 0.255, CZK: 0.043, SEK: 0.095, NOK: 0.092, DKK: 0.145,
    CAD: 0.73, AUD: 0.65, NZD: 0.59, HKD: 0.128, SGD: 0.74, KRW: 0.00072,
    INR: 0.012, THB: 0.028, IDR: 0.000061, MYR: 0.215, PHP: 0.0175,
    VND: 0.000038, BRL: 0.185, MXN: 0.055, ARS: 0.00095, ZAR: 0.056,
    ILS: 0.27, SAR: 0.267, QAR: 0.275, EGP: 0.021, NGN: 0.00065,
  };
  const FEE = 0.003;

  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const year = document.getElementById("year");
  const giveAmount = document.getElementById("give-amount");
  const getAmount = document.getElementById("get-amount");
  const giveAsset = document.getElementById("give-asset");
  const getAsset = document.getElementById("get-asset");
  const quoteRate = document.getElementById("quote-rate");
  const form = document.getElementById("exchange-form");
  const swap = document.getElementById("swap");
  const tabs = document.querySelectorAll(".tabs__btn");

  const state = {
    dir: "buy",
    usd: { ...FALLBACK },
  };

  if (year) year.textContent = new Date().getFullYear();

  const fillSelect = (select, values, selected) => {
    select.innerHTML = values
      .map((code) => `<option value="${code}" ${code === selected ? "selected" : ""}>${code}</option>`)
      .join("");
  };

  const syncSelects = () => {
    if (state.dir === "buy") {
      fillSelect(giveAsset, FIAT, giveAsset.value && FIAT.includes(giveAsset.value) ? giveAsset.value : "RUB");
      fillSelect(getAsset, CRYPTO, "USDT");
    } else {
      fillSelect(giveAsset, CRYPTO, "USDT");
      fillSelect(getAsset, FIAT, getAsset.value && FIAT.includes(getAsset.value) ? getAsset.value : "RUB");
    }
  };

  const parseAmount = (value) => {
    const n = Number(String(value).replace(",", ".").replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const formatAmount = (n) => {
    if (!n) return "0.00";
    return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const usdPer = (code) => (code === "USDT" ? 1 : state.usd[code] || FALLBACK[code] || 1);

  const quote = () => {
    const from = giveAsset.value;
    const to = getAsset.value;
    const amount = parseAmount(giveAmount.value);
    const mid = usdPer(from) / usdPer(to);
    const effective = mid * (1 - FEE);
    const out = amount * effective;
    getAmount.value = formatAmount(out);
    quoteRate.textContent = `1 ${from} = ${effective.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })} ${to}`;
  };

  const setDir = (dir) => {
    state.dir = dir;
    tabs.forEach((btn) => {
      const active = btn.dataset.dir === dir;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    syncSelects();
    quote();
  };

  tabs.forEach((btn) => btn.addEventListener("click", () => setDir(btn.dataset.dir)));
  swap.addEventListener("click", () => setDir(state.dir === "buy" ? "sell" : "buy"));
  giveAmount.addEventListener("input", quote);
  giveAsset.addEventListener("change", quote);
  getAsset.addEventListener("change", quote);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const network = form.querySelector("input[name=network]:checked")?.value || "TRC20";
    const text = [
      "Заявка CryptoStatte",
      `${giveAmount.value} ${giveAsset.value} → ${getAmount.value} ${getAsset.value}`,
      `Сеть: ${network}`,
      quoteRate.textContent,
    ].join("\n");
    window.open(`https://t.me/paysupx?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  const closeMenu = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  };

  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  const dock = document.querySelector(".dock");
  const desk = document.getElementById("exchange");
  if (dock && desk && "IntersectionObserver" in window) {
    const syncDock = ([entry]) => {
      dock.classList.toggle("is-hidden", entry.isIntersecting);
    };
    const observer = new IntersectionObserver(syncDock, {
      threshold: 0.12,
      rootMargin: "-72px 0px 0px 0px",
    });
    observer.observe(desk);
  }

  const canvas = document.getElementById("orbit");
  const ctx = canvas?.getContext("2d");
  const isPhone = window.matchMedia("(max-width: 640px)").matches;
  const dots = Array.from({ length: isPhone ? 16 : 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    s: Math.random() * 0.15 + 0.03,
  }));

  const draw = () => {
    if (!ctx) return;
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(232, 213, 163, 0.28)";
    dots.forEach((dot) => {
      dot.y -= dot.s / 400;
      if (dot.y < 0) dot.y = 1;
      ctx.beginPath();
      ctx.arc(dot.x * w, dot.y * h, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    draw();
  }

  const applyUsdRates = (perUsd) => {
    if (!perUsd) return;
    FIAT.forEach((code) => {
      const n = Number(perUsd[code]);
      if (code !== "USD" && n > 0) state.usd[code] = 1 / n;
    });
    quote();
  };

  fetch("https://open.er-api.com/v6/latest/USD")
    .then((res) => res.json())
    .then((data) => {
      if (data?.result === "success" && data.rates) applyUsdRates(data.rates);
    })
    .catch(() => {
      fetch("https://api.frankfurter.app/latest?from=USD")
        .then((res) => res.json())
        .then((data) => applyUsdRates(data?.rates))
        .catch(() => {});
    });

  syncSelects();
  quote();

  const pingVisit = () => {
    const payload = JSON.stringify({
      lang: navigator.language || "",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen: `${window.screen.width}x${window.screen.height}`,
      ref: document.referrer || "",
      path: `${location.pathname}${location.search}${location.hash}`,
    });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visit", blob);
      return;
    }
    fetch("/api/visit", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  };
  setTimeout(pingVisit, 600);
})();
