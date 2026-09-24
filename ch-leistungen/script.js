(function () {
  const STORAGE_LANG = "chleistungen-lang";
  const STORAGE_COOKIE = "chleistungen-cookie";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_LANG);
    if (stored && window.CHL_I18N[stored]) return stored;
    const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
    if (nav === "fr" || nav === "it") return nav;
    return "de";
  }

  function applyTranslations(lang) {
    const dict = window.CHL_I18N[lang] || window.CHL_I18N.de;
    document.documentElement.lang = lang;

    document.title = dict.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict.metaDesc);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    localStorage.setItem(STORAGE_LANG, lang);
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTranslations(btn.getAttribute("data-lang"));
      closeMenu();
    });
  });

  applyTranslations(detectLang());

  /* Mobile menu */
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });

    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Forms */
  function wireForm(form) {
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const success = form.querySelector(".form-success");
      if (success) success.hidden = false;
      form.reset();
    });
  }

  wireForm(document.getElementById("form-hero"));
  wireForm(document.getElementById("form-mid"));

  /* Cookie banner opt-in */
  const banner = document.getElementById("cookie-banner");
  const accept = document.getElementById("cookie-accept");
  const decline = document.getElementById("cookie-decline");
  const cookieChoice = localStorage.getItem(STORAGE_COOKIE);

  function setAnalytics(enabled) {
    window.__chAnalytics = Boolean(enabled);
    if (enabled) {
      // Placeholder: load analytics only after opt-in
      document.documentElement.dataset.analytics = "on";
    } else {
      delete document.documentElement.dataset.analytics;
    }
  }

  if (!cookieChoice && banner) {
    banner.hidden = false;
  } else if (cookieChoice === "accepted") {
    setAnalytics(true);
  }

  if (accept) {
    accept.addEventListener("click", () => {
      localStorage.setItem(STORAGE_COOKIE, "accepted");
      setAnalytics(true);
      if (banner) banner.hidden = true;
    });
  }

  if (decline) {
    decline.addEventListener("click", () => {
      localStorage.setItem(STORAGE_COOKIE, "declined");
      setAnalytics(false);
      if (banner) banner.hidden = true;
    });
  }
})();
