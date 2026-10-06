#!/usr/bin/env python3
"""Generate trilingual PDF guides for the landing page."""

from pathlib import Path

from fpdf import FPDF

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
OUT = Path(__file__).resolve().parent.parent / "downloads"

GUIDES = {
    "leitfaden-de.pdf": {
        "title": "Staatliche Leistungen in der Schweiz 2026",
        "subtitle": "Kostenloser Leitfaden – Auszahlungen & Ansprüche",
        "sections": [
            ("Familienzulagen", "Kinderzulage: je nach Kanton mindestens CHF 215/Monat, teilweise mehr, bis 16 Jahre. Ausbildungszulage: mindestens CHF 268/Monat während anerkannter Ausbildung. In Zürich gelten je nach Alter und Art der Zulage unterschiedliche Beträge. Antrag bei der kantonalen Ausgleichskasse."),
            ("Prämienverbilligung", "Unter bestimmten Voraussetzungen kann eine Prämienverbilligung möglich sein. Die Höhe hängt von persönlichen und kantonalen Faktoren ab. Fristen sind je nach Kanton unterschiedlich. Basel-Landschaft Richtprämie Erwachsene: CHF 4'596/Jahr (Referenzwert)."),
            ("Ergänzungsleistungen (EL)", "Leistung zur Deckung anerkannter Lebens- und Wohnkosten, wenn Einkommen und Vermögen nicht ausreichen. Max. CHF 20'670/Jahr (Alleinstehende), CHF 31'005/Jahr (Paare). Anerkannte Mietkosten werden berücksichtigt; es gelten gesetzliche Mietzinsmaxima. Vermögensgrenze: CHF 100'000 / CHF 200'000."),
            ("AHV-Rente – Auszahlungstermine 2026", "Renten werden zu Monatsbeginn im Voraus ausbezahlt: 5. Jan, 2. Feb, 2. Mär, 1. Apr, 4. Mai, 2. Jun, 2. Jul, 3. Aug, 2. Sep, 1. Okt, 2. Nov, 2. Dez. Im Dezember 2026 zusätzlich die 13. AHV-Altersrente."),
            ("Mietzinsbeiträge", "Kantonale Mietzuschüsse für Familien und Rentner. Höhe und Voraussetzungen variieren je nach Kanton."),
            ("Steuerabzüge", "Abzüge für Kinder, Krankenkassenprämien, Säule 3a, Berufsauslagen und weitere Posten senken die Steuerlast."),
            ("Für Ausländer", "Mit C-Ausweis (Niederlassungsbewilligung) gleiche Rechte wie Schweizer. Mit B-Ausweis gelten Fristbeschränkungen."),
        ],
        "footer": "Quellen: BSV, kantonale Ausgleichskassen, GDK. Kein Rechtsrat – Navigator durch offizielle Verfahren. benefitseurope.com © 2026",
    },
    "guide-fr.pdf": {
        "title": "Allocations de l'État en Suisse 2026",
        "subtitle": "Guide gratuit – prestations et droits",
        "sections": [
            ("Allocations familiales", "Selon le canton, min. CHF 215/mois, parfois plus, jusqu'à 16 ans. Allocation formation: min. CHF 268/mois pendant formation reconnue. À Zurich, montants variables selon l'âge et le type. Demande auprès de la caisse de compensation cantonale."),
            ("Réduction des primes", "Sous certaines conditions, une réduction des primes est possible. Le montant dépend des facteurs personnels et cantonaux. Délais variables selon le canton. Prime de référence Bâle-Campagne adultes: CHF 4'596/an (valeur de référence)."),
            ("Prestations complémentaires (PC)", "Prestation pour couvrir les coûts reconnus de vie et logement. Max. CHF 20'670/an (seul), CHF 31'005/an (couple). Loyers reconnus pris en compte avec plafonds légaux. Seuil fortune: CHF 100'000 / CHF 200'000."),
            ("Rente AVS – dates de paiement 2026", "Versement en début de mois à l'avance: 5 jan, 2 fév, 2 mar, 1 avr, 4 mai, 2 jun, 2 jul, 3 aoû, 2 sep, 1 oct, 2 nov, 2 déc. En décembre 2026, 13e rente AVS en plus."),
            ("Contributions au loyer", "Subventions cantonales au loyer pour familles et retraités. Montants et conditions varient selon le canton."),
            ("Déductions fiscales", "Déductions pour enfants, primes maladie, pilier 3a, frais professionnels et autres postes réduisent l'impôt."),
            ("Pour les étrangers", "Avec permis C (établissement), mêmes droits que les Suisses. Avec permis B, restrictions de délai."),
        ],
        "footer": "Sources: OFAS, caisses cantonales, CDS. Pas de conseil juridique – navigateur des procédures officielles. benefitseurope.com © 2026",
    },
    "guida-it.pdf": {
        "title": "Prestazioni statali in Svizzera 2026",
        "subtitle": "Guida gratuita – pagamenti e diritti",
        "sections": [
            ("Assegni familiari", "A seconda del cantone, min. CHF 215/mese, talvolta di più, fino a 16 anni. Assegno formazione: min. CHF 268/mese durante formazione riconosciuta. A Zurigo, importi variabili per età e tipo. Domanda alla cassa di compensazione cantonale."),
            ("Riduzione dei premi", "Sotto determinate condizioni, riduzione dei premi possibile. L'importo dipende da fattori personali e cantonali. Scadenze diverse per cantone. Premio di riferimento Basilea Campagna adulti: CHF 4'596/anno (valore di riferimento)."),
            ("Prestazioni complementari (PC)", "Prestazione per coprire costi riconosciuti di vita e alloggio. Max. CHF 20'670/anno (single), CHF 31'005/anno (coppia). Affitti riconosciuti con massimali legali. Limite patrimonio: CHF 100'000 / CHF 200'000."),
            ("Rendita AVS – date pagamento 2026", "Pagamento a inizio mese in anticipo: 5 gen, 2 feb, 2 mar, 1 apr, 4 mag, 2 giu, 2 lug, 3 ago, 2 set, 1 ott, 2 nov, 2 dic. A dicembre 2026, 13a rendita AVS in più."),
            ("Contributi all'affitto", "Sussidi cantonali all'affitto per famiglie e pensionati. Importi e condizioni variano per cantone."),
            ("Deduzioni fiscali", "Deduzioni per figli, premi malattia, pilastro 3a, spese professionali e altre voci riducono le tasse."),
            ("Per gli stranieri", "Con permesso C (domicilio), stessi diritti degli svizzeri. Con permesso B, limitazioni temporali."),
        ],
        "footer": "Fonti: UFAS, casse cantonali, CDS. Nessuna consulenza legale – navigatore tra procedure ufficiali. benefitseurope.com © 2026",
    },
}


class GuidePDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", size=8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Seite {self.page_no()}", align="C")


def build_pdf(filename: str, data: dict) -> None:
    pdf = GuidePDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_font("DejaVu", "", FONT)
    pdf.add_font("DejaVu", "B", FONT_BOLD)
    pdf.add_page()

    pdf.set_font("DejaVu", "B", 18)
    pdf.multi_cell(0, 10, data["title"])
    pdf.ln(4)

    pdf.set_font("DejaVu", size=12)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 8, data["subtitle"])
    pdf.ln(8)

    pdf.set_text_color(0, 0, 0)
    for heading, body in data["sections"]:
        pdf.set_font("DejaVu", "B", 13)
        pdf.multi_cell(0, 8, heading)
        pdf.ln(2)
        pdf.set_font("DejaVu", size=11)
        pdf.multi_cell(0, 7, body)
        pdf.ln(6)

    pdf.ln(4)
    pdf.set_font("DejaVu", size=9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 6, data["footer"])

    OUT.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT / filename))


def main() -> None:
    for filename, data in GUIDES.items():
        build_pdf(filename, data)
        print(f"Created {OUT / filename}")


if __name__ == "__main__":
    main()
