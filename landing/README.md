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
- Admin panel at `/admin` — visitor analytics + PDF upload
- FAQ accordion, cookie banner, legal pages

## Admin panel

```bash
cd landing/backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
ADMIN_PASSWORD=yourpassword ./venv/bin/python app.py
```

Open http://localhost:5050/admin

**Production:** credentials in `/etc/schweiz-zahlt.env` on the server.
