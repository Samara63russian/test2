#!/usr/bin/env python3
from pathlib import Path
from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "guides"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_S = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

GUIDES = {
    "de": {
        "file": "GuideCH-2026-DE.pdf",
        "title": "Staatliche Leistungen in der Schweiz 2026",
        "sub": "Familienzulagen · Prämienverbilligung · EL · AHV · Miete · Steuern",
        "disc": "Kein Rechtsrat. Beträge und Fristen können sich ändern. Massgebend sind Ausgleichskassen, SVA und Steuerämter.",
        "blocks": [
            ("So nutzt du diesen Navigator",
             "Jede Leistung hat eine eigene Stelle, eine eigene Frist und oft einen kantonalen Ansatz. Unten findest du die wichtigsten Hebel 2026, die typischen Beträge und den nächsten Schritt."),
            ("1. Familienzulagen",
             "Bundesminimum 2026: Kinderzulage CHF 215/Monat bis 16, Ausbildungszulage CHF 268/Monat in nachobligatorischer Ausbildung bis 25. Kantone dürfen mehr zahlen (ZH: CHF 215 bis 12, danach CHF 268 = CHF 3'216/Jahr; SG oft CHF 245 / 298). Anspruch ab einem AHV-pflichtigen Einkommen von mindestens CHF 7'560/Jahr. Antrag über Arbeitgeber oder Familienausgleichskasse. Start: ab Geburt."),
            ("2. Prämienverbilligung (IPV)",
             "Wenn die Prämie einen kantonalen Anteil des massgebenden Einkommens übersteigt (häufig 7–12 %), übernimmt der Kanton die Differenz zur Richtprämie — Beispiel Basel-Landschaft CHF 4'596/Jahr für Erwachsene. Fristen sind kantonal. St. Gallen: voller Jahresanspruch in der Regel bis 31. März. Verpasste Frist: häufig nur noch ab Antragsmonat oder erst im Folgejahr."),
            ("3. Ergänzungsleistungen (EL)",
             "Wenn AHV- oder IV-Rente plus Einkommen die anerkannten Ausgaben nicht decken. Lebensbedarf 2026: CHF 20'670 Alleinstehende, CHF 31'005 Ehepaare. Mietzinsmaxima Region 2 Alleinstehende: CHF 18'300. Vermögensgrenze: CHF 100'000 / CHF 200'000. Antrag bei der kantonalen EL-Stelle."),
            ("4. AHV-Rente 2026",
             "Auszahlung im Voraus, am Anfang des Monats, in der Regel am ersten Bankwerktag. Orientierung 2026: 5. Januar, 2. Februar, 2. März. Die 13. AHV-Rente kommt mit der Dezemberzahlung."),
            ("5. Mietzinsbeiträge",
             "Neben der EL-Mietzinsmaxima führen einzelne Kantone und Gemeinden eigene Wohnbeihilfen. Prüfen: Wohnkanton, Haushaltsgrösse, steuerbares Einkommen. Anlaufstellen: Gemeinde, Sozialamt, EL-Stelle."),
            ("6. Steuerabzüge",
             "Kinder- und Betreuungsabzüge, Säule 3a, Einkäufe Säule 2, Krankenkassenprämien bis zum kantonalen Maximum, Fahrkosten, Berufsauslagen. Ansätze 2026: Merkblatt des Kantons."),
            ("7. Ausweis B/C und Doppelbürgerschaft",
             "Ausweis C: weitgehend dieselben Rechte wie Schweizer Bürgerinnen und Bürger. Ausweis B: oft Karenzfristen. Doppelbürgerschaft ändert den Anspruch in der Schweiz nicht."),
            ("Nächste 2 Minuten",
             "1) Prämie vs. Einkommen. 2) Kinder bei der FAK? 3) Rente + Miete + Prämie gegen EL. 4) Kantonale IPV-Frist. 5) Formulare nur über ahv-iv.ch, SVA oder Gemeinde."),
        ],
    },
    "fr": {
        "file": "GuideCH-2026-FR.pdf",
        "title": "Prestations de l'État en Suisse 2026",
        "sub": "Allocations familiales · réduction de primes · PC · AVS · loyer · impôts",
        "disc": "Pas un conseil juridique. Les montants et délais peuvent changer. Seules les caisses, SVA et administrations fiscales font foi.",
        "blocks": [
            ("Comment utiliser ce navigateur",
             "Chaque prestation a son office, son délai et souvent un barème cantonal. Ci-dessous les leviers 2026, les montants types et la prochaine étape."),
            ("1. Allocations familiales",
             "Minimum fédéral 2026 : CHF 215/mois jusqu'à 16 ans, CHF 268/mois en formation jusqu'à 25 ans. Les cantons peuvent payer plus (ZH : CHF 215 jusqu'à 12 ans, puis CHF 268 = CHF 3'216/an). Droit dès CHF 7'560 de revenu AVS par an. Demande via l'employeur ou la caisse d'allocations. Dès la naissance."),
            ("2. Réduction de primes",
             "Si la prime dépasse 7–12 % du revenu déterminant, le canton prend souvent la différence jusqu'à la prime de référence — exemple Bâle-Campagne : CHF 4'596/an pour les adultes. Saint-Gall : droit annuel complet en règle générale jusqu'au 31 mars."),
            ("3. Prestations complémentaires (PC)",
             "Si rente AVS/AI plus revenus ne couvrent pas les dépenses reconnues. 2026 : CHF 20'670 personne seule, CHF 31'005 couple. Loyer max. région 2 : CHF 18'300. Fortune : CHF 100'000 / CHF 200'000."),
            ("4. Rente AVS 2026",
             "Versement d'avance en début de mois, en général le premier jour bancaire ouvrable. Repères 2026 : 5 janvier, 2 février, 2 mars. La 13e rente AVS est versée avec celle de décembre."),
            ("5. Aides au loyer",
             "Certains cantons et communes versent des aides au logement en plus du plafond PC. Vérifier canton, taille du ménage, revenu imposable."),
            ("6. Déductions fiscales",
             "Enfants et garde, pilier 3a, rachats 2e pilier, primes jusqu'au maximum cantonal, frais de trajet. Barèmes : mémento cantonal."),
            ("7. Permis B/C et double nationalité",
             "Permis C : droits largement alignés sur les citoyennes et citoyens suisses. Permis B : délais de carence fréquents. La double nationalité ne change pas le droit en Suisse."),
            ("Les 2 prochaines minutes",
             "1) Prime vs revenu. 2) Enfants à la CAF ? 3) Rente + loyer + prime contre les PC. 4) Délai cantonal. 5) Formulaires via ahv-iv.ch, SVA ou commune."),
        ],
    },
    "it": {
        "file": "GuideCH-2026-IT.pdf",
        "title": "Prestazioni dello Stato in Svizzera 2026",
        "sub": "Assegni familiari · riduzione premi · PC · AVS · affitto · imposte",
        "disc": "Non è una consulenza giuridica. Importi e termini possono cambiare. Fanno fede casse, IAS e amministrazioni fiscali.",
        "blocks": [
            ("Come usare questo navigatore",
             "Ogni prestazione ha un ufficio, un termine e spesso un barème cantonale. Qui trovi le leve 2026, gli importi tipici e il passo successivo."),
            ("1. Assegni familiari",
             "Minimo federale 2026: CHF 215/mese fino a 16 anni, CHF 268/mese in formazione fino a 25. I Cantoni possono pagare di più (ZH: CHF 215 fino a 12 anni, poi CHF 268 = CHF 3'216/anno). Diritto con reddito AVS di almeno CHF 7'560/anno. Domanda tramite datore o cassa. Dalla nascita."),
            ("2. Riduzione dei premi",
             "Se il premio supera il 7–12 % del reddito determinante, il Cantone copre spesso la differenza rispetto al premio di riferimento — esempio Basilea Campagna: CHF 4'596/anno. San Gallo: diritto annuale intero di regola fino al 31 marzo."),
            ("3. Prestazioni complementari (PC)",
             "Se rendita AVS/AI più redditi non coprono le spese riconosciute. 2026: CHF 20'670 persona sola, CHF 31'005 coppia. Affitto max. regione 2: CHF 18'300. Patrimonio: CHF 100'000 / CHF 200'000."),
            ("4. Rendita AVS 2026",
             "Pagamento in anticipo a inizio mese, di regola il primo giorno bancario lavorativo. Riferimenti 2026: 5 gennaio, 2 febbraio, 2 marzo. La 13a rendita AVS arriva con quella di dicembre."),
            ("5. Contributi all'affitto",
             "Alcuni Cantoni e Comuni versano aiuti abitativi oltre al tetto PC. Verificare Cantone, nucleo, reddito imponibile."),
            ("6. Deduzioni fiscali",
             "Figli e cura, pilastro 3a, riscatti 2° pilastro, premi fino al massimo cantonale, spese di viaggio. Barème: promemoria cantonale."),
            ("7. Permesso B/C e doppia cittadinanza",
             "Permesso C: diritti in larga parte allineati ai cittadini svizzeri. Permesso B: spesso termini di carenza. La doppia cittadinanza non cambia il diritto in Svizzera."),
            ("I prossimi 2 minuti",
             "1) Premio vs reddito. 2) Figli alla CAF? 3) Rendita + affitto + premio contro le PC. 4) Termine cantonale. 5) Moduli da ahv-iv.ch, IAS o Comune."),
        ],
    },
}


class GuidePDF(FPDF):
    def header(self):
        self.set_fill_color(200, 16, 46)
        self.rect(0, 0, 210, 8, "F")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(16, 35, 58)
        self.set_y(12)
        self.cell(0, 6, "GuideCH  ·  2026", align="L")
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(91, 100, 112)
        self.cell(0, 8, f"{self.page_no()}/{{nb}}", align="C")


def build(lang, data):
    pdf = GuidePDF(format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font("DejaVu", "", FONT)
    pdf.add_font("DejaVu", "B", FONT_B)
    pdf.add_font("DejaVuSerif", "", FONT_S)
    pdf.add_page()
    pdf.set_text_color(16, 35, 58)
    pdf.set_font("DejaVuSerif", "", 22)
    pdf.multi_cell(0, 10, data["title"], new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", "", 11)
    pdf.set_text_color(91, 100, 112)
    pdf.multi_cell(0, 6, data["sub"], new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    for title, body in data["blocks"]:
        pdf.set_text_color(16, 35, 58)
        pdf.set_font("DejaVu", "B", 13)
        pdf.multi_cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("DejaVu", "", 11)
        pdf.set_text_color(40, 44, 51)
        pdf.multi_cell(0, 6, body, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)
    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(91, 100, 112)
    pdf.multi_cell(0, 5, data["disc"], new_x="LMARGIN", new_y="NEXT")
    OUT.mkdir(exist_ok=True)
    dest = OUT / data["file"]
    pdf.output(dest)
    print(dest)


if __name__ == "__main__":
    for lang, data in GUIDES.items():
        build(lang, data)
