(function () {
  const LANGS = ["de", "fr", "it"];
  const STORAGE_LANG = "guidech-lang";
  const STORAGE_LEADS = "guidech-leads";
  const STORAGE_COOKIE = "guidech-cookie";

  function detectLang() {
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get("lang") || "").toLowerCase();
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = localStorage.getItem(STORAGE_LANG);
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "de").toLowerCase();
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("it")) return "it";
    return "de";
  }

  function t() {
    return window.I18N[document.documentElement.dataset.lang] || window.I18N.de;
  }

  function attribution() {
    const params = new URLSearchParams(location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      referrer: document.referrer || "",
    };
  }

  function applyText(dict, prefix) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.getAttribute("data-i18n").split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const path = el.getAttribute("data-i18n-html").split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const path = el.getAttribute("data-i18n-placeholder").split(".");
      let value = dict;
      for (const key of path) value = value?.[key];
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });
    void prefix;
  }

  function renderLists(dict) {
    const myths = document.getElementById("myths");
    if (myths) {
      myths.innerHTML = dict.myths.items
        .map(
          (item) =>
            `<article class="myth"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></article>`
        )
        .join("");
    }
    const contents = document.getElementById("contents-grid");
    if (contents) {
      contents.innerHTML = dict.contents.items
        .map(
          (item) =>
            `<article class="item"><strong><span class="check">✓</span>${escapeHtml(
              item.t
            )}</strong><p>${escapeHtml(item.d)}</p></article>`
        )
        .join("");
    }
    const faq = document.getElementById("faq-list");
    if (faq) {
      faq.innerHTML = dict.faq.items
        .map(
          (item) =>
            `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`
        )
        .join("");
    }
    const legalRoot = document.getElementById("legal-body");
    if (legalRoot) {
      const kind = legalRoot.dataset.legal;
      const blocks = (window.LEGAL[dict.lang] || window.LEGAL.de)[kind] || [];
      legalRoot.innerHTML = blocks
        .map((block) => `<h2>${escapeHtml(block.h)}</h2><p>${block.p}</p>`)
        .join("");
    }
    const guideRoot = document.getElementById("guide-body");
    if (guideRoot) {
      const blocks = window.GUIDE_BODY[dict.lang] || window.GUIDE_BODY.de;
      guideRoot.innerHTML = blocks
        .map(
          (block) =>
            `<section class="guide-block"><h2>${escapeHtml(block.h)}</h2><p>${escapeHtml(
              block.p
            )}</p></section>`
        )
        .join("");
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setLang(lang) {
    const next = LANGS.includes(lang) ? lang : "de";
    const dict = window.I18N[next];
    document.documentElement.lang = dict.htmlLang;
    document.documentElement.dataset.lang = next;
    localStorage.setItem(STORAGE_LANG, next);
    const title = document.querySelector("title");
    const desc = document.querySelector('meta[name="description"]');
    if (title) title.textContent = dict.meta.title;
    if (desc) desc.setAttribute("content", dict.meta.description);
    applyText(dict);
    renderLists(dict);
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.langBtn === next ? "true" : "false");
    });
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState({}, "", url);
    document.querySelectorAll("a[data-keep-lang]").forEach((link) => {
      const href = new URL(link.getAttribute("href"), location.href);
      href.searchParams.set("lang", next);
      link.setAttribute("href", href.pathname + href.search + href.hash);
    });
    document.querySelectorAll("select[name='year'] option[data-year]").forEach((opt) => {
      const key = opt.dataset.year;
      opt.textContent = dict.form[key];
    });
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function bindForm(form) {
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const dict = t();
      const email = form.querySelector("[name='email']");
      const year = form.querySelector("[name='year']");
      const consent = form.querySelector("[name='consent']");
      const emailErr = form.querySelector("[data-error='email']");
      const yearErr = form.querySelector("[data-error='year']");
      const consentErr = form.querySelector("[data-error='consent']");
      let ok = true;
      emailErr.textContent = "";
      yearErr.textContent = "";
      consentErr.textContent = "";
      if (!validEmail(email.value.trim())) {
        emailErr.textContent = dict.form.emailError;
        ok = false;
      }
      if (!year.value) {
        yearErr.textContent = dict.form.yearError;
        ok = false;
      }
      if (!consent.checked) {
        consentErr.textContent = dict.form.consentError;
        ok = false;
      }
      if (!ok) return;

      const lead = {
        email: email.value.trim(),
        year: year.value,
        lang: document.documentElement.dataset.lang,
        createdAt: new Date().toISOString(),
        ...attribution(),
      };
      const existing = JSON.parse(localStorage.getItem(STORAGE_LEADS) || "[]");
      existing.push(lead);
      localStorage.setItem(STORAGE_LEADS, JSON.stringify(existing));
      sessionStorage.setItem("guidech-unlocked", "1");
      window.dispatchEvent(new CustomEvent("guidech:lead", { detail: lead }));

      const card = form.closest(".form-card") || form.parentElement;
      const success = card?.querySelector(".success");
      if (success) {
        success.classList.add("is-on");
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      form.setAttribute("hidden", "");
      downloadGuide(document.documentElement.dataset.lang);
    });
  }

  function downloadGuide(lang) {
    const code = LANGS.includes(lang) ? lang : "de";
    const a = document.createElement("a");
    a.href = `./guides/GuideCH-2026-${code.toUpperCase()}.pdf`;
    a.download = `GuideCH-2026-${code.toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function bindCookies() {
    const box = document.getElementById("cookie-banner");
    if (!box) return;
    const saved = localStorage.getItem(STORAGE_COOKIE);
    if (!saved) box.classList.add("is-on");
    box.querySelectorAll("[data-cookie]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_COOKIE, btn.dataset.cookie);
        box.classList.remove("is-on");
        if (btn.dataset.cookie === "accept") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "analytics_opt_in" });
        }
      });
    });
    document.querySelectorAll("[data-open-cookies]").forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        box.classList.add("is-on");
      });
    });
  }

  function initLangButtons() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.langBtn));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setLang(detectLang());
    document.querySelectorAll("form[data-lead-form]").forEach(bindForm);
    bindCookies();
    initLangButtons();
  });

  window.GuideCH = { setLang, downloadGuide, detectLang };
})();
