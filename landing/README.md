# Schweiz zahlt – Landing Page

Trilingual lead-generation landing page (DE / FR / IT) for Swiss government benefits guide 2026.

## Run locally

```bash
cd landing
python3 -m http.server 8080
```

Open http://localhost:8080

## Structure

- `index.html` – main page
- `css/style.css` – styles
- `js/translations.js` – DE, FR, IT content
- `js/app.js` – language switch, forms, FAQ, cookie banner

## Features

- Language switcher (DE / FR / IT) with browser detection
- Direct PDF download (no email required) in DE / FR / IT
- Download buttons in hero and CTA sections
- FAQ accordion
- Cookie consent banner (opt-in)
- Impressum & Datenschutzerklärung modals
- Mobile responsive
