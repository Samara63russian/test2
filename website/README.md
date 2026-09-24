# GuideCH — Staatliche Leistungen Schweiz 2026

Dreisprachiger Lead-Magnet (DE / FR / IT) für staatliche Leistungen in der Schweiz:

- Familienzulagen
- Prämienverbilligung
- Ergänzungsleistungen
- AHV-Termine
- Mietzinsbeiträge
- Steuerabzüge

## Start lokal

```bash
cd website
python3 -m http.server 4173
```

Dann öffnen: http://127.0.0.1:4173/?lang=de

## Sprachen

- `?lang=de` Deutsch
- `?lang=fr` Français
- `?lang=it` Italiano

Die Wahl bleibt im `localStorage` und wird in Links mitgeführt.

## Formular

Pflichtfelder: E-Mail, Geburtsjahr (2007 / 2008 / 2009 / früher / später), Einwilligung zur Datenschutzerklärung.

Nach dem Absenden:

1. Lead landet in `localStorage` (`guidech-leads`) inkl. UTM/Referrer
2. Sofort-Download des Leitfadens
3. Link zur Browser-Ansicht `guide.html` (drucken = PDF)

Für Produktion den Submit an ein E-Mail-Backend (Resend, Formspree, eigene Worker-Route) anbinden. HTTPS ist Pflicht.

## Rechtliches (Schweiz)

- [Impressum](impressum.html) — Name/Kontakt vorhanden; **Postadresse vor Live-Gang ergänzen**
- [Datenschutzerklärung](datenschutz.html) — E-Mail, Geburtsjahr, UTM
- Cookie-Banner: Statistik nur nach Opt-in
- Kein Rechtsrat, Quellen: ahv-iv.ch, gdk-cds.ch, bsv.admin.ch

## Traffic-Quellen

Die Briefing-Zeile «Источники трафика» war unvollständig. Vorbereitet ist Attribution über:

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`

Typische Kanäle für dieses Angebot:

| Kanal | utm_source | utm_medium | Hinweise |
| --- | --- | --- | --- |
| Google Ads CH | google | cpc | Keywords: Prämienverbilligung, Familienzulagen, EL, allocations familiales |
| Meta Ads | meta | paid | DE/FR/IT nach Sprachregion |
| SEO / organisch | google | organic | Referrer reicht oft |
| Newsletter | newsletter | email | |
| Foren / Communities | forum | social | |

Beispiel: `index.html?lang=fr&utm_source=google&utm_medium=cpc&utm_campaign=prestations-2026`

## Live-Check vor Launch

1. Schweizer Zustelladresse im Impressum
2. HTTPS-Host
3. Echter PDF-Mailversand statt nur localStorage
4. Beträge/Fristen gegen BSV / SVA des Kantons gegenprüfen
