(function () {
  "use strict";

  let currentLang = localStorage.getItem("lang") || detectLanguage();

  function detectLanguage() {
    const browserLang = (navigator.language || "de").slice(0, 2).toLowerCase();
    return ["de", "fr", "it"].includes(browserLang) ? browserLang : "de";
  }

  function t(key) {
    const keys = key.split(".");
    let val = translations[currentLang];
    for (const k of keys) {
      if (val == null) return key;
      val = val[k];
    }
    return val;
  }

  function updateDownloadLinks() {
    const pdf = t("hero.pdfFile");
    document.querySelectorAll(".btn--download").forEach((btn) => {
      btn.href = pdf;
    });
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;

    document.title = t("meta.title");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t("meta.description");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (typeof value === "string") el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = t(key);
      if (typeof value === "string") el.innerHTML = value;
    });

    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      btn.classList.toggle("lang-switch__btn--active", btn.dataset.lang === lang);
    });

    updateDownloadLinks();
    renderPainPoints();
    renderGuideFeatures();
    renderFAQ();
    bindModalLinks();
  }

  function renderPainPoints() {
    const container = document.getElementById("pain-points");
    if (!container) return;
    const items = t("pain.items");
    container.innerHTML = items
      .map(
        (item) => `
      <div class="pain-point">
        <div class="pain-point__question">
          <span class="pain-point__icon">❌</span>
          ${item.question}
        </div>
        <p class="pain-point__answer">${item.answer}</p>
      </div>`
      )
      .join("");
  }

  function renderGuideFeatures() {
    const container = document.getElementById("guide-features");
    if (!container) return;
    const items = t("guide.items");
    container.innerHTML = items
      .map(
        (item) => `
      <div class="feature">
        <span class="feature__icon">✅</span>
        <div class="feature__text">
          <strong>${item.title}</strong>
          ${item.text}
        </div>
      </div>`
      )
      .join("");
  }

  function renderFAQ() {
    const container = document.getElementById("faq-list");
    if (!container) return;
    const items = t("faq.items");
    container.innerHTML = items
      .map(
        (item, i) => `
      <div class="faq__item" data-faq="${i}">
        <button class="faq__question" aria-expanded="false">
          ${item.question}
          <span class="faq__icon">+</span>
        </button>
        <div class="faq__answer">
          <p>${item.answer}</p>
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".faq__question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq__item");
        const isOpen = item.classList.contains("faq__item--open");
        container.querySelectorAll(".faq__item").forEach((el) => {
          el.classList.remove("faq__item--open");
          el.querySelector(".faq__question").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("faq__item--open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initLanguageSwitch() {
    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });
  }

  function openModal(type) {
    const overlay = document.getElementById("modal-overlay");
    const title = document.getElementById("modal-title");
    const content = document.getElementById("modal-content");

    if (type === "impressum") {
      title.textContent = t("footer.impressumTitle");
      content.innerHTML = `<p>${t("footer.impressumText")}</p>`;
    } else if (type === "privacy") {
      title.textContent = t("footer.privacyTitle");
      content.innerHTML = `<p>${t("footer.privacyText")}</p>`;
    }

    overlay.classList.add("modal-overlay--visible");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    document.getElementById("modal-overlay").classList.remove("modal-overlay--visible");
    document.body.style.overflow = "";
  }

  function bindModalLinks() {
    document.querySelectorAll("[data-modal]").forEach((link) => {
      link.onclick = (e) => {
        e.preventDefault();
        openModal(link.dataset.modal);
      };
    });
  }

  function initModal() {
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function initCookieBanner() {
    const banner = document.getElementById("cookie-banner");
    const consent = localStorage.getItem("cookie-consent");

    if (!consent) {
      setTimeout(() => banner.classList.add("cookie-banner--visible"), 800);
    }

    document.getElementById("cookie-accept").addEventListener("click", () => {
      localStorage.setItem("cookie-consent", "accepted");
      banner.classList.remove("cookie-banner--visible");
    });

    document.getElementById("cookie-decline").addEventListener("click", () => {
      localStorage.setItem("cookie-consent", "declined");
      banner.classList.remove("cookie-banner--visible");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
    initLanguageSwitch();
    initModal();
    initCookieBanner();
  });
})();
