(function () {
  "use strict";

  let currentGeo = "ch";
  let currentLang = "de";

  function getTranslations() {
    return (GEO_CONTENT[currentGeo] || GEO_CONTENT.ch || {})[currentLang] || {};
  }

  function detectLanguage(geo) {
    const meta = GEO_META[geo] || GEO_META.ch;
    const stored = localStorage.getItem("lang");
    if (stored && meta.languages.includes(stored)) return stored;

    const browserLang = (navigator.language || "de").slice(0, 2).toLowerCase();
    if (meta.languages.includes(browserLang)) return browserLang;
    return meta.defaultLang || "de";
  }

  function t(key) {
    const keys = key.split(".");
    let val = getTranslations();
    for (const k of keys) {
      if (val == null) return key;
      val = val[k];
    }
    return val;
  }

  function updateDownloadLinks() {
    const file = t("hero.downloadFile");
    if (!file) return;
    const filename = file.split("/").pop();
    document.querySelectorAll(".btn--download").forEach((btn) => {
      btn.href = file;
      btn.setAttribute("download", filename);
      if (!btn.dataset.trackBound) {
        btn.dataset.trackBound = "1";
        btn.addEventListener("click", () => {
          trackEvent("download", { path: btn.getAttribute("href") });
        });
      }
    });
  }

  function updateSourceLinks() {
    const meta = GEO_META[currentGeo] || GEO_META.ch;
    const links = meta.sourceLinks || [];

    const sourcesContainer = document.getElementById("sources-official-links");
    if (sourcesContainer) {
      sourcesContainer.innerHTML = links
        .map(
          (link) =>
            `<a href="${link.href}" target="_blank" rel="noopener">${link.label}</a>`
        )
        .join("");
    }

    const footerContainer = document.getElementById("footer-sources-links");
    if (footerContainer) {
      footerContainer.innerHTML = links
        .map(
          (link) =>
            `<li><a href="${link.href}" target="_blank" rel="noopener">${link.label}</a></li>`
        )
        .join("");
    }
  }

  function updateLanguageSwitch() {
    const meta = GEO_META[currentGeo] || GEO_META.ch;
    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      const lang = btn.dataset.lang;
      const visible = meta.languages.includes(lang);
      btn.hidden = !visible;
      btn.classList.toggle("lang-switch__btn--active", lang === currentLang);
    });
  }

  function updateHeaderFlag() {
    const meta = GEO_META[currentGeo] || GEO_META.ch;
    const flagEl = document.querySelector(".header__logo-flag");
    if (flagEl) flagEl.textContent = meta.flag;
  }

  function setLanguage(lang) {
    const meta = GEO_META[currentGeo] || GEO_META.ch;
    if (!meta.languages.includes(lang)) return;
    if (!GEO_CONTENT[currentGeo] || !GEO_CONTENT[currentGeo][lang]) return;

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

    updateLanguageSwitch();
    updateDownloadLinks();
    renderPainPoints();
    renderGuideFeatures();
    renderFAQ();
    bindModalLinks();
  }

  function setGeo(geo, lang) {
    if (!GEO_CONTENT[geo]) geo = "ch";
    currentGeo = geo;
    localStorage.setItem("geo", geo);

    updateHeaderFlag();
    updateSourceLinks();

    const nextLang = lang || detectLanguage(geo);
    setLanguage(nextLang);
  }

  function renderPainPoints() {
    const container = document.getElementById("pain-points");
    if (!container) return;
    const items = t("pain.items");
    if (!Array.isArray(items)) return;
    container.innerHTML = items
      .map(
        (item) => `
      <div class="pain-point">
        <div class="pain-point__question">
          <span class="pain-point__icon">?</span>
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
    if (!Array.isArray(items)) return;
    container.innerHTML = items
      .map(
        (item) => `
      <div class="feature">
        <span class="feature__icon">✓</span>
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
    if (!Array.isArray(items)) return;
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

  function trackEvent(event, extra) {
    if (sessionStorage.getItem("tracked-" + event) && event === "pageview") return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.assign(
          {
            event: event,
            lang: currentLang,
            geo: currentGeo,
            path: window.location.pathname,
          },
          extra || {}
        )
      ),
      keepalive: true,
    }).catch(function () {});
    if (event === "pageview") sessionStorage.setItem("tracked-pageview", "1");
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

  function resolveGeoFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const geoParam = params.get("geo");
    if (geoParam && GEO_CONTENT[geoParam]) return geoParam;
    return null;
  }

  function detectGeo() {
    const fromQuery = resolveGeoFromQuery();
    if (fromQuery) return Promise.resolve(fromQuery);

    return fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.geo && GEO_CONTENT[data.geo]) return data.geo;
        const stored = localStorage.getItem("geo");
        if (stored && GEO_CONTENT[stored]) return stored;
        return "ch";
      })
      .catch(() => {
        const stored = localStorage.getItem("geo");
        if (stored && GEO_CONTENT[stored]) return stored;
        return "ch";
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    detectGeo().then((geo) => {
      setGeo(geo);
      trackEvent("pageview");
      initLanguageSwitch();
      initModal();
      initCookieBanner();
    });
  });
})();
