# Auszahlungen.ch — Landing (DE / FR / IT)

Lead-magnet landing page for a free Swiss social-benefits guide (2026).

## Features

- Full copy in **German**, **French**, and **Italian** with live language switch
- Lead form: email, birth-year band, privacy consent (DSG / GDPR)
- Sections: hero, myth-busting, guide contents, mid-CTA, sources, FAQ, urgency CTA
- Legal pages: Impressum + Datenschutzerklärung (trilingual)
- Cookie banner with opt-in for analytics
- Alpine visual direction (Fraunces + Sora, pine / glacier / Swiss-red CTA)

## Run locally

```bash
cd swiss-benefits
python3 -m http.server 8080
# open http://localhost:8080
```

## Before go-live

1. Replace placeholder Impressum address/email with real publisher details
2. Wire the form submit in `js/main.js` to Formspree, Mailchimp, or your backend (and PDF delivery)
3. Serve over **HTTPS**
4. Optionally plug Plausible/Matomo into the cookie opt-in callback
