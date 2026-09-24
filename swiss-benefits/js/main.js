(function () {
  const LANGS = ["de", "fr", "it"];
  const STORAGE_LANG = "ausz_lang";
  const STORAGE_COOKIE = "ausz_cookie";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getLang() {
    const stored = localStorage.getItem(STORAGE_LANG);
    if (LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
    if (LANGS.includes(nav)) return nav;
    return "de";
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    localStorage.setItem(STORAGE_LANG, lang);
    applyLang(lang);
  }

  function t(lang) {
    return window.AUSZ_I18N[lang] || window.AUSZ_I18N.de;
  }

  function fillBirthSelect(select, dict) {
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = dict.birthPlaceholder;
    select.appendChild(ph);
    dict.birthOptions.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    });
  }

  function applyLang(lang) {
    const dict = t(lang);
    document.documentElement.lang = dict.htmlLang;
    document.title = dict.metaTitle;
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict.metaDesc);

    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    $$("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = dict[key];
      if (typeof value === "string") el.innerHTML = value;
    });

    $$("[data-i18n-brand]").forEach((el) => {
      el.innerHTML = `${dict.brand}<span>${dict.brandSub}</span>`;
    });

    $$("select[data-birth]").forEach((sel) => fillBirthSelect(sel, dict));

    const guideList = $("[data-guide-list]");
    if (guideList) {
      guideList.innerHTML = dict.guideItems
        .map(
          (item) => `
        <li>
          <span class="check" aria-hidden="true">✓</span>
          <div>
            <strong>${item.title}</strong>
            <span>${item.text}</span>
          </div>
        </li>`
        )
        .join("");
    }

    const faq = $("[data-faq]");
    if (faq) {
      faq.innerHTML = dict.faqs
        .map(
          (item) => `
        <details>
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>`
        )
        .join("");
    }

    $$("[data-footer-address]").forEach((el) => {
      el.innerHTML = dict.footerAddress.replace(/\n/g, "<br>");
    });

    $$(".lang-switch button").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });

    // Update CTA button labels on forms
    $$("[data-cta-primary]").forEach((btn) => {
      const which = btn.getAttribute("data-cta-primary");
      btn.textContent = which === "mid" ? dict.midCtaButton : dict.ctaDownload;
    });
  }

  function wireForms() {
    $$("form.lead-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]');
        const birth = form.querySelector("select[data-birth]");
        const consent = form.querySelector('input[type="checkbox"]');
        const valid =
          email &&
          email.value.trim() &&
          email.checkValidity() &&
          birth &&
          birth.value &&
          consent &&
          consent.checked;

        if (!valid) {
          form.classList.add("has-error");
          return;
        }
        form.classList.remove("has-error");

        const wrap = form.closest(".hero__form-wrap, .form-panel");
        if (wrap) wrap.classList.add("is-sent");

        // Demo lead capture — replace with Formspree / backend endpoint
        try {
          const leads = JSON.parse(localStorage.getItem("ausz_leads") || "[]");
          leads.push({
            email: email.value.trim(),
            birth: birth.value,
            lang: localStorage.getItem(STORAGE_LANG) || "de",
            at: new Date().toISOString(),
          });
          localStorage.setItem("ausz_leads", JSON.stringify(leads));
        } catch (_) {
          /* ignore */
        }
      });
    });
  }

  function wireLang() {
    $$(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  function wireReveal() {
    const myths = $$(".myth");
    if (!myths.length || !("IntersectionObserver" in window)) {
      myths.forEach((m) => m.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    myths.forEach((m) => io.observe(m));
  }

  function wireCookies() {
    const banner = $(".cookie-banner");
    if (!banner) return;
    const status = localStorage.getItem(STORAGE_COOKIE);
    if (!status) banner.classList.add("is-open");

    $("[data-cookie-accept]")?.addEventListener("click", () => {
      localStorage.setItem(STORAGE_COOKIE, "accepted");
      banner.classList.remove("is-open");
      // Placeholder for analytics init (Matomo/Plausible) — only after opt-in
    });
    $("[data-cookie-decline]")?.addEventListener("click", () => {
      localStorage.setItem(STORAGE_COOKIE, "declined");
      banner.classList.remove("is-open");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(getLang());
    wireLang();
    wireForms();
    wireReveal();
    wireCookies();
  });
})();
