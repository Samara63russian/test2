import streamlit as st


st.set_page_config(
    page_title="auszahlung — Schweizer Sozialleistungen 2026",
    page_icon="🇨🇭",
    layout="wide",
    initial_sidebar_state="collapsed",
)


COPY = {
    "de": {
        "language": "DE",
        "nav_guide": "Der Guide",
        "nav_faq": "FAQ",
        "nav_sources": "Quellen",
        "eyebrow": "SCHWEIZ · 2026",
        "hero_title": "Geld, das dir zusteht.",
        "hero_title_2": "Endlich verstehen.",
        "hero_body": "Die Schweiz zahlt laufend. Viele wissen nur nicht, was ihnen zusteht. Familienzulagen, Prämienverbilligung, Ergänzungsleistungen und mehr — hol dir den kostenlosen Guide und finde es in 2 Minuten heraus.",
        "primary_cta": "Guide kostenlos holen",
        "secondary_cta": "Was ist drin?",
        "hero_note": "PDF · kostenlos · ohne Spam",
        "floating_label": "DEIN ANSPRUCH",
        "floating_value": "CHF 3'216",
        "floating_sub": "pro Kind / Jahr",
        "trust": "Aktuelle Orientierung für die Schweiz · 2026",
        "section_kicker": "NICHTS ZU VERSCHENKEN",
        "section_title": "Das Geld liegt nicht auf der Straße.",
        "section_title_2": "Aber vielleicht auf deinem Konto.",
        "section_body": "Du hast die Beiträge schon bezahlt. Jetzt ist es Zeit zu prüfen, was zurückkommen kann.",
        "cards": [
            ("01", "Prämienverbilligung", "Du zahlst mehr als 7–12 % deines Einkommens für die Krankenkasse? Dein Kanton kann einen Teil übernehmen.", "Bis zu CHF 4'596 / Jahr"),
            ("02", "Familienzulagen", "Kinderzulagen gibt es fast für alle Erwerbstätigen: ab Geburt bis 16, in Ausbildung bis 25.", "Ab CHF 215 / Monat"),
            ("03", "Ergänzungsleistungen", "Wenn die AHV- oder IV-Rente nicht zum Leben reicht, kann der Staat bis zum Existenzminimum ergänzen.", "Bis CHF 20'670 / Jahr"),
        ],
        "guide_kicker": "IM GUIDE",
        "guide_title": "Dein Überblick. Ohne Behörden-Deutsch.",
        "guide_body": "Die wichtigsten Leistungen, Fristen und Anlaufstellen auf wenigen klaren Seiten — damit du weißt, was dir zusteht und wo du es beantragst.",
        "guide_items": [
            "Familienzulagen in deinem Kanton — Höhe, Alter und Antrag",
            "Prämienverbilligung — Fristen und Rückerstattung der Krankenkasse",
            "Ergänzungsleistungen zu AHV / IV — Anspruch und Vermögensgrenze",
            "AHV-Rente — genaue Auszahlungstermine 2026",
            "Mietzinsbeiträge und Steuerabzüge, die du nicht verpassen solltest",
            "FAQ: Fristen, ausländische Staatsangehörigkeit und Doppelpass",
        ],
        "form_kicker": "JETZT HERUNTERLADEN",
        "form_title": "Hol dir den Guide.",
        "form_body": "Gib deine E-Mail ein — das PDF kommt sofort. Keine Werbung. Abmeldung mit einem Klick.",
        "email": "E-Mail-Adresse",
        "birth": "Geburtsjahr",
        "birth_placeholder": "Bitte auswählen",
        "birth_options": ["Bitte auswählen", "2007", "2008", "2009", "Vor 2007", "Nach 2009"],
        "consent": "Ich stimme der Verarbeitung meiner Daten gemäss Datenschutzerklärung zu.",
        "submit": "Guide kostenlos senden",
        "form_hint": "Deine Daten werden nur für den Versand des PDFs und Updates zu Sozialleistungen verwendet.",
        "success": "Geschafft — dein Guide ist unterwegs. Bitte prüfe auch deinen Spam-Ordner.",
        "required": "Bitte fülle E-Mail, Geburtsjahr und Zustimmung aus.",
        "facts_kicker": "AUF EINEN BLICK",
        "facts_title": "Was du vielleicht gerade liegen lässt.",
        "facts": [
            ("CHF 215–245", "Kinderzulage pro Monat, mindestens nach Bundesrecht"),
            ("31. Mai", "Frist für die Prämienverbilligung im Kanton St. Gallen"),
            ("CHF 100'000", "Vermögensgrenze für EL bei Einzelpersonen"),
        ],
        "faq_kicker": "DU FRAGST, WIR ORDNEN EIN",
        "faq_title": "Die wichtigsten Fragen.",
        "faq": [
            ("Habe ich wirklich Anspruch auf etwas?", "Wenn deine Krankenkassenprämie mehr als 7–12 % deines Einkommens ausmacht, lohnt sich die Prüfung einer Prämienverbilligung. Familienzulagen stehen fast allen Erwerbstätigen mit Kindern zu. Bei einer kleinen AHV- oder IV-Rente kommen EL infrage."),
            ("Ich bin Ausländer. Gilt das auch für mich?", "Ja — mit einer Niederlassungsbewilligung (C-Ausweis) gelten grundsätzlich dieselben Ansprüche wie für Schweizerinnen und Schweizer. Mit einem B-Ausweis können Fristen und Voraussetzungen abweichen."),
            ("Wann wird die AHV-Rente ausgezahlt?", "Die AHV wird zu Beginn des Monats für den laufenden Monat im Voraus ausbezahlt. Die genauen Daten für 2026 findest du im Guide. Die 13. AHV-Rente kommt mit der Dezemberzahlung."),
            ("Was passiert, wenn ich eine Frist verpasst habe?", "Das hängt vom Kanton ab. Für die Prämienverbilligung ist der aktuelle Anspruch oft verloren, aber du kannst den Antrag für das Folgejahr rechtzeitig stellen. Im Kanton St. Gallen kommt das Formular bis zum 10. Januar automatisch."),
        ],
        "source_kicker": "SAUBER EINGEORDNET",
        "source_title": "Offizielle Quellen. Klar erklärt.",
        "source_body": "Der Guide basiert auf öffentlichen Informationen von BSV, kantonalen Ausgleichskassen, GDK sowie offiziellen Publikationen von PwC und OECD. Wir sind keine Kanzlei — der Guide ist ein Navigator durch offizielle Verfahren.",
        "source_links": ["ahv-iv.ch", "gdk-cds.ch", "Impressum", "Datenschutz"],
        "footer_note": "© 2026 auszahlung · Orientierung, die sich auszahlt.",
        "legal": "Datenschutz · Impressum",
    },
    "fr": {
        "language": "FR",
        "nav_guide": "Le guide",
        "nav_faq": "FAQ",
        "nav_sources": "Sources",
        "eyebrow": "SUISSE · 2026",
        "hero_title": "L’argent auquel",
        "hero_title_2": "tu as droit.",
        "hero_body": "La Suisse verse des aides en permanence. Beaucoup ignorent simplement ce qui leur revient. Allocations familiales, réduction de primes, prestations complémentaires et plus encore — télécharge le guide gratuit et fais le point en 2 minutes.",
        "primary_cta": "Obtenir le guide gratuit",
        "secondary_cta": "Que contient-il ?",
        "hero_note": "PDF · gratuit · sans spam",
        "floating_label": "TON DROIT",
        "floating_value": "CHF 3'216",
        "floating_sub": "par enfant / an",
        "trust": "Un aperçu actuel de la Suisse · 2026",
        "section_kicker": "NE LAISSE RIEN SUR LA TABLE",
        "section_title": "L’argent n’est pas dans la rue.",
        "section_title_2": "Mais peut-être sur ton compte.",
        "section_body": "Tu as déjà payé les cotisations. Il est temps de vérifier ce qui peut revenir.",
        "cards": [
            ("01", "Réduction de primes", "Tu consacres plus de 7 à 12 % de tes revenus à l’assurance-maladie ? Ton canton peut en prendre une partie en charge.", "Jusqu’à CHF 4'596 / an"),
            ("02", "Allocations familiales", "Les allocations sont accessibles à presque tous les actifs : dès la naissance jusqu’à 16 ans, et jusqu’à 25 ans en formation.", "Dès CHF 215 / mois"),
            ("03", "Prestations complémentaires", "Si la rente AVS ou AI ne suffit pas pour vivre, l’État peut compléter jusqu’au minimum vital.", "Jusqu’à CHF 20'670 / an"),
        ],
        "guide_kicker": "DANS LE GUIDE",
        "guide_title": "Ton aperçu. Sans jargon administratif.",
        "guide_body": "Les prestations, délais et interlocuteurs essentiels réunis en quelques pages claires — pour savoir ce qui t’est dû et où le demander.",
        "guide_items": [
            "Allocations familiales dans ton canton — montants, âge et demande",
            "Réduction de primes — délais et remboursement de l’assurance",
            "Prestations complémentaires AVS / AI — droit et fortune maximale",
            "Rente AVS — dates exactes de versement en 2026",
            "Aides au logement et déductions fiscales à ne pas manquer",
            "FAQ : délais, nationalité étrangère et double nationalité",
        ],
        "form_kicker": "TÉLÉCHARGER MAINTENANT",
        "form_title": "Reçois le guide.",
        "form_body": "Entre ton e-mail — le PDF arrive immédiatement. Pas de publicité. Désinscription en un clic.",
        "email": "Adresse e-mail",
        "birth": "Année de naissance",
        "birth_placeholder": "Choisir",
        "birth_options": ["Choisir", "2007", "2008", "2009", "Avant 2007", "Après 2009"],
        "consent": "J’accepte le traitement de mes données conformément à la déclaration de protection des données.",
        "submit": "Envoyer le guide gratuitement",
        "form_hint": "Tes données servent uniquement à l’envoi du PDF et aux mises à jour sur les prestations sociales.",
        "success": "C’est fait — ton guide est en route. Pense à vérifier tes spams.",
        "required": "Merci de renseigner ton e-mail, ton année de naissance et ton consentement.",
        "facts_kicker": "EN UN COUP D’ŒIL",
        "facts_title": "Ce que tu laisses peut-être de côté.",
        "facts": [
            ("CHF 215–245", "Allocation pour enfant par mois, minimum légal"),
            ("31 mai", "Délai pour la réduction de primes dans le canton de Saint-Gall"),
            ("CHF 100'000", "Fortune maximale pour les PC d’une personne seule"),
        ],
        "faq_kicker": "TU DEMANDES, ON CLARIFIE",
        "faq_title": "Les questions essentielles.",
        "faq": [
            ("Ai-je vraiment droit à quelque chose ?", "Si ta prime d’assurance dépasse 7 à 12 % de tes revenus, vérifie la réduction de primes. Les allocations familiales sont accessibles à presque tous les actifs avec enfants. Avec une petite rente AVS ou AI, les PC peuvent compléter ton revenu."),
            ("Je suis étranger. Est-ce valable pour moi ?", "Oui — avec une autorisation d’établissement (permis C), les droits sont en principe les mêmes que pour les Suisses. Avec un permis B, les délais et conditions peuvent varier."),
            ("Quand la rente AVS est-elle versée ?", "La rente AVS est versée au début du mois, d’avance pour le mois en cours. Le guide reprend les dates exactes de 2026. La 13e rente AVS arrive avec le versement de décembre."),
            ("Que se passe-t-il si j’ai dépassé un délai ?", "Cela dépend du canton. Pour la réduction de primes, le droit de l’année en cours est souvent perdu, mais tu peux déposer la demande pour l’année suivante. Dans le canton de Saint-Gall, le formulaire arrive automatiquement avant le 10 janvier."),
        ],
        "source_kicker": "DES INFORMATIONS FIABLES",
        "source_title": "Des sources officielles. Enfin lisibles.",
        "source_body": "Le guide s’appuie sur les informations publiques de l’OFAS, des caisses de compensation cantonales, de la CDS ainsi que sur des publications officielles de PwC et de l’OCDE. Nous ne sommes pas un cabinet juridique : le guide t’aide à naviguer les démarches officielles.",
        "source_links": ["ahv-iv.ch", "gdk-cds.ch", "Mentions légales", "Confidentialité"],
        "footer_note": "© 2026 auszahlung · Des repères qui rapportent.",
        "legal": "Confidentialité · Mentions légales",
    },
    "it": {
        "language": "IT",
        "nav_guide": "La guida",
        "nav_faq": "FAQ",
        "nav_sources": "Fonti",
        "eyebrow": "SVIZZERA · 2026",
        "hero_title": "I soldi che ti",
        "hero_title_2": "spettano.",
        "hero_body": "In Svizzera vengono versati aiuti continuamente. Molti semplicemente non sanno cosa spetta loro. Assegni familiari, riduzione dei premi, prestazioni complementari e altro — scarica la guida gratuita e fai chiarezza in 2 minuti.",
        "primary_cta": "Ricevi la guida gratis",
        "secondary_cta": "Cosa contiene?",
        "hero_note": "PDF · gratuito · niente spam",
        "floating_label": "IL TUO DIRITTO",
        "floating_value": "CHF 3'216",
        "floating_sub": "per figlio / anno",
        "trust": "Una panoramica aggiornata per la Svizzera · 2026",
        "section_kicker": "NON LASCIARE SOLDI SUL TAVOLO",
        "section_title": "I soldi non sono per strada.",
        "section_title_2": "Ma forse sono sul tuo conto.",
        "section_body": "Hai già pagato i contributi. Ora è il momento di verificare cosa può tornare indietro.",
        "cards": [
            ("01", "Riduzione dei premi", "Paghi più del 7–12% del tuo reddito per la cassa malati? Il Cantone può coprirne una parte.", "Fino a CHF 4'596 / anno"),
            ("02", "Assegni familiari", "Gli assegni spettano a quasi tutti i lavoratori: dalla nascita fino a 16 anni, e fino a 25 anni durante la formazione.", "Da CHF 215 / mese"),
            ("03", "Prestazioni complementari", "Se la rendita AVS o AI non basta per vivere, lo Stato può integrarla fino al minimo vitale.", "Fino a CHF 20'670 / anno"),
        ],
        "guide_kicker": "NELLA GUIDA",
        "guide_title": "La tua panoramica. Senza burocratese.",
        "guide_body": "Prestazioni, scadenze e contatti importanti raccolti in poche pagine chiare — per sapere cosa ti spetta e dove richiederlo.",
        "guide_items": [
            "Assegni familiari nel tuo Cantone — importi, età e richiesta",
            "Riduzione dei premi — scadenze e rimborso dell’assicurazione",
            "Prestazioni complementari AVS / AI — diritto e limite patrimoniale",
            "Rendita AVS — date esatte dei versamenti nel 2026",
            "Contributi per l’affitto e deduzioni fiscali da non perdere",
            "FAQ: scadenze, cittadinanza straniera e doppio passaporto",
        ],
        "form_kicker": "SCARICA ORA",
        "form_title": "Ricevi la guida.",
        "form_body": "Inserisci la tua e-mail — il PDF arriva subito. Niente pubblicità. Disiscrizione con un clic.",
        "email": "Indirizzo e-mail",
        "birth": "Anno di nascita",
        "birth_placeholder": "Seleziona",
        "birth_options": ["Seleziona", "2007", "2008", "2009", "Prima del 2007", "Dopo il 2009"],
        "consent": "Accetto il trattamento dei miei dati secondo l’informativa sulla privacy.",
        "submit": "Invia la guida gratuitamente",
        "form_hint": "I tuoi dati vengono usati solo per inviare il PDF e gli aggiornamenti sulle prestazioni sociali.",
        "success": "Fatto — la guida è in arrivo. Controlla anche la cartella spam.",
        "required": "Inserisci e-mail, anno di nascita e consenso.",
        "facts_kicker": "IN BREVE",
        "facts_title": "Quello che forse stai lasciando sul tavolo.",
        "facts": [
            ("CHF 215–245", "Assegno per figlio al mese, minimo previsto dalla legge"),
            ("31 maggio", "Scadenza per la riduzione dei premi nel Cantone San Gallo"),
            ("CHF 100'000", "Limite patrimoniale per le PC delle persone sole"),
        ],
        "faq_kicker": "TU CHIEDI, NOI CHIARIAMO",
        "faq_title": "Le domande più importanti.",
        "faq": [
            ("Ho davvero diritto a qualcosa?", "Se il premio della cassa malati supera il 7–12% del tuo reddito, verifica la riduzione dei premi. Gli assegni familiari spettano a quasi tutti i lavoratori con figli. Con una rendita AVS o AI bassa puoi avere diritto alle PC."),
            ("Sono straniero. Vale anche per me?", "Sì — con un permesso di domicilio (permesso C) i diritti sono in linea di principio gli stessi degli svizzeri. Con un permesso B, scadenze e condizioni possono variare."),
            ("Quando viene pagata la rendita AVS?", "La rendita AVS viene versata all’inizio del mese, in anticipo per il mese corrente. La guida riporta le date esatte del 2026. La 13a rendita AVS arriva con il pagamento di dicembre."),
            ("Cosa succede se ho perso una scadenza?", "Dipende dal Cantone. Per la riduzione dei premi spesso si perde il diritto per l’anno in corso, ma si può presentare la domanda per l’anno successivo. Nel Cantone San Gallo il modulo arriva automaticamente entro il 10 gennaio."),
        ],
        "source_kicker": "INFORMAZIONI VERIFICATE",
        "source_title": "Fonti ufficiali. Spiegate bene.",
        "source_body": "La guida si basa sulle informazioni pubbliche dell’UFAS, delle casse di compensazione cantonali, della CDS e sulle pubblicazioni ufficiali di PwC e OCSE. Non siamo uno studio legale: la guida è un navigatore tra le procedure ufficiali.",
        "source_links": ["ahv-iv.ch", "gdk-cds.ch", "Note legali", "Privacy"],
        "footer_note": "© 2026 auszahlung · Informazioni che fanno la differenza.",
        "legal": "Privacy · Note legali",
    },
}


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        :root { --ink:#132b35; --muted:#63757a; --lime:#d9f36a; --paper:#f7f6f1; --line:#d9ded8; --coral:#ff8064; }
        html, body, [class*="css"] { font-family:'DM Sans', sans-serif; color:var(--ink); }
        .stApp { background:var(--paper); }
        [data-testid="stHeader"] { background:transparent; }
        [data-testid="stToolbar"] { display:none; }
        .block-container { max-width:1180px; padding:18px 32px 0; }
        .topbar { display:flex; align-items:center; justify-content:space-between; gap:24px; margin:0 0 58px; }
        .brand { display:flex; align-items:center; gap:10px; font-family:'Space Grotesk'; font-weight:700; font-size:21px; letter-spacing:-.8px; color:var(--ink); }
        .brand-mark { width:30px; height:30px; display:grid; place-items:center; background:var(--ink); color:var(--lime); border-radius:50%; font-size:15px; font-weight:700; }
        .nav-copy { display:flex; gap:25px; align-items:center; font-size:13px; color:var(--muted); }
        .nav-copy a { color:inherit; text-decoration:none; }
        .hero { display:grid; grid-template-columns:1.08fr .92fr; gap:72px; align-items:center; padding:20px 0 78px; }
        .eyebrow, .section-kicker { font-family:'DM Mono', monospace; font-size:11px; letter-spacing:1.6px; color:#73864a; font-weight:500; }
        .hero h1 { font-family:'Space Grotesk'; font-size:clamp(48px, 6vw, 82px); line-height:.98; letter-spacing:-5px; margin:17px 0 25px; max-width:620px; }
        .hero h1 span { color:#96a6a7; }
        .hero-lead { font-size:17px; line-height:1.65; color:#50656a; max-width:550px; margin:0 0 31px; }
        .hero-actions { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
        .button-link { display:inline-block; background:var(--ink); color:#fff !important; border-radius:4px; padding:15px 20px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0 var(--lime); }
        .text-link { font-size:14px; font-weight:600; color:var(--ink) !important; text-decoration:none; padding:10px; }
        .hero-note { font-family:'DM Mono'; font-size:10px; color:#889597; margin-top:22px; }
        .hero-visual { min-height:460px; position:relative; display:grid; place-items:center; }
        .visual-orbit { width:380px; height:380px; border-radius:50%; background:var(--lime); position:relative; transform:rotate(-12deg); }
        .visual-orbit:before { content:''; position:absolute; inset:34px; border:1px solid rgba(19,43,53,.22); border-radius:50%; }
        .visual-orbit:after { content:'CHF'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) rotate(12deg); font-family:'Space Grotesk'; font-size:104px; font-weight:700; letter-spacing:-8px; color:var(--ink); }
        .visual-card { position:absolute; background:#fff; border:1px solid var(--ink); padding:18px 19px; box-shadow:7px 7px 0 var(--ink); transform:rotate(7deg); }
        .visual-card.main { width:190px; right:-4px; top:70px; }
        .visual-card.small { left:-12px; bottom:74px; transform:rotate(-7deg); width:165px; padding:14px; box-shadow:5px 5px 0 var(--coral); }
        .visual-card .label { font-family:'DM Mono'; font-size:9px; color:#839194; letter-spacing:1px; }
        .visual-card .amount { font-family:'Space Grotesk'; font-size:33px; letter-spacing:-2px; font-weight:700; margin:15px 0 1px; }
        .visual-card .sub { color:#617174; font-size:11px; }
        .visual-card.small .amount { font-size:24px; margin:10px 0 1px; }
        .trust-row { border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:17px 0; color:#7a898b; font-family:'DM Mono'; font-size:10px; letter-spacing:.5px; }
        .section { padding:112px 0 35px; }
        .section-head { display:flex; justify-content:space-between; gap:30px; align-items:flex-end; margin-bottom:45px; }
        .section h2 { font-family:'Space Grotesk'; font-size:clamp(34px,4vw,54px); line-height:1.02; letter-spacing:-3px; margin:13px 0 0; max-width:690px; }
        .section-desc { max-width:280px; line-height:1.55; color:var(--muted); font-size:14px; }
        .cards { display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; }
        .benefit-card { border:1px solid var(--ink); min-height:270px; padding:24px; display:flex; flex-direction:column; justify-content:space-between; background:#fff; }
        .benefit-card:nth-child(2) { background:var(--coral); }
        .benefit-card:nth-child(3) { background:var(--ink); color:#fff; }
        .card-num { font-family:'DM Mono'; font-size:11px; opacity:.65; }
        .benefit-card h3 { font-family:'Space Grotesk'; font-size:24px; letter-spacing:-1px; margin:38px 0 9px; }
        .benefit-card p { color:inherit; opacity:.77; font-size:13px; line-height:1.5; margin:0; }
        .card-stat { font-family:'DM Mono'; font-size:11px; margin-top:20px; }
        .guide-wrap { display:grid; grid-template-columns:.82fr 1.18fr; gap:70px; align-items:start; padding:90px 0 100px; }
        .guide-panel { background:var(--ink); color:white; padding:43px; min-height:430px; position:relative; overflow:hidden; }
        .guide-panel:after { content:'2026'; position:absolute; right:-18px; bottom:-22px; font-family:'Space Grotesk'; font-size:150px; letter-spacing:-12px; color:rgba(255,255,255,.06); font-weight:700; }
        .guide-panel h2 { max-width:440px; font-size:44px; margin-top:15px; }
        .guide-panel p { color:#bdc9c9; max-width:390px; line-height:1.6; font-size:14px; }
        .guide-mark { border:1px solid rgba(255,255,255,.3); width:52px; height:52px; display:grid; place-items:center; font-family:'DM Mono'; font-size:12px; color:var(--lime); margin-top:48px; }
        .check-list { list-style:none; padding:0; margin:49px 0 0; }
        .check-list li { border-bottom:1px solid var(--line); padding:15px 0; font-size:14px; line-height:1.35; display:flex; gap:13px; }
        .check-list li:before { content:'↗'; color:#829a4b; font-family:'DM Mono'; }
        .facts { background:var(--lime); padding:30px; display:grid; grid-template-columns:repeat(3,1fr); gap:25px; border:1px solid var(--ink); }
        .fact strong { display:block; font-family:'Space Grotesk'; font-size:31px; letter-spacing:-2px; margin-bottom:10px; }
        .fact span { display:block; font-size:12px; line-height:1.4; max-width:170px; }
        .download-section { padding:105px 0 110px; display:grid; grid-template-columns:.8fr 1.2fr; gap:80px; align-items:start; }
        .download-section h2 { font-family:'Space Grotesk'; font-size:54px; letter-spacing:-3px; line-height:1; margin:15px 0; }
        .download-section .form-lead { color:var(--muted); font-size:14px; line-height:1.55; max-width:350px; }
        .download-card { background:#fff; border:1px solid var(--ink); padding:30px 34px 27px; box-shadow:10px 10px 0 var(--lime); }
        .download-card [data-testid="stForm"] { border:0; padding:0; }
        .download-card label { font-size:12px !important; color:var(--ink) !important; }
        .download-card input, .download-card [data-baseweb="select"] > div { border-color:#bcc9c5 !important; border-radius:2px !important; background:#fff !important; }
        .download-card [data-testid="stFormSubmitButton"] button { background:var(--ink); color:#fff; border:0; border-radius:2px; min-height:47px; font-weight:700; width:100%; }
        .download-card [data-testid="stFormSubmitButton"] button:hover { background:#274b58; color:#fff; }
        .download-card [data-testid="stCheckbox"] label p { font-size:11px !important; line-height:1.35; color:#68787b; }
        .form-hint { font-family:'DM Mono'; color:#879497; font-size:9px; line-height:1.45; margin-top:17px; }
        .success-note { border:1px solid #9bb46c; background:#f1f7d6; color:#49622e; padding:12px; font-size:12px; margin:13px 0; }
        .error-note { border:1px solid #e8a995; background:#fff2ee; color:#994b39; padding:12px; font-size:12px; margin:13px 0; }
        .faq-section { border-top:1px solid var(--line); padding:100px 0 70px; }
        .faq-grid { display:grid; grid-template-columns:1fr 1fr; column-gap:60px; margin-top:42px; }
        .faq-item { border-top:1px solid var(--line); padding:23px 0 25px; }
        .faq-item h3 { font-family:'Space Grotesk'; font-size:17px; letter-spacing:-.4px; margin:0 0 10px; }
        .faq-item p { color:var(--muted); font-size:13px; line-height:1.6; margin:0; }
        .sources { border-top:1px solid var(--line); padding:73px 0 77px; display:flex; justify-content:space-between; gap:40px; }
        .sources h2 { font-family:'Space Grotesk'; letter-spacing:-2px; font-size:30px; margin:14px 0; }
        .sources p { max-width:560px; color:var(--muted); font-size:13px; line-height:1.6; }
        .source-links { display:flex; gap:10px; flex-wrap:wrap; align-content:center; justify-content:flex-end; max-width:330px; }
        .source-links a { border:1px solid var(--ink); padding:9px 11px; color:var(--ink); text-decoration:none; font-family:'DM Mono'; font-size:10px; }
        .footer { border-top:1px solid var(--line); padding:22px 0 30px; display:flex; justify-content:space-between; color:#819092; font-size:11px; }
        .footer a { color:inherit; text-decoration:none; }
        div[data-testid="stHorizontalBlock"] { gap:1rem; }
        @media (max-width:800px) {
          .block-container { padding:15px 20px 0; }
          .topbar { margin-bottom:30px; align-items:flex-start; }
          .nav-copy { gap:10px; font-size:11px; flex-wrap:wrap; justify-content:flex-end; }
          .hero, .guide-wrap, .download-section { grid-template-columns:1fr; gap:35px; }
          .hero { padding-bottom:55px; }
          .hero-visual { min-height:330px; transform:scale(.8); margin:-30px 0; }
          .hero h1 { letter-spacing:-3px; }
          .section { padding-top:72px; }
          .section-head, .sources, .footer { display:block; }
          .section-desc { margin-top:24px; }
          .cards, .faq-grid { grid-template-columns:1fr; }
          .benefit-card { min-height:220px; }
          .guide-wrap, .download-section { padding:70px 0; }
          .guide-panel { padding:30px; }
          .guide-panel h2, .download-section h2 { font-size:40px; }
          .facts { grid-template-columns:1fr; gap:22px; }
          .fact span { max-width:none; }
          .source-links { justify-content:flex-start; margin-top:28px; }
          .footer > div + div { margin-top:10px; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def language_switcher() -> str:
    if "lang" not in st.session_state:
        st.session_state.lang = "de"
    columns = st.columns([0.6, 0.14, 0.14, 0.14])
    with columns[0]:
        st.markdown('<div class="brand"><span class="brand-mark">+</span>auszahlung</div>', unsafe_allow_html=True)
    for code, column in zip(["de", "fr", "it"], columns[1:]):
        with column:
            if st.button(code.upper(), key=f"lang_{code}", use_container_width=True):
                st.session_state.lang = code
                st.rerun()
    return st.session_state.lang


def render_form(copy: dict) -> None:
    with st.form("guide_form", clear_on_submit=False):
        email = st.text_input(copy["email"], placeholder="name@email.com")
        birth = st.selectbox(copy["birth"], copy["birth_options"], index=0)
        consent = st.checkbox(copy["consent"])
        submitted = st.form_submit_button(copy["submit"])
    if submitted:
        if not email or "@" not in email or birth == copy["birth_options"][0] or not consent:
            st.markdown(f'<div class="error-note">{copy["required"]}</div>', unsafe_allow_html=True)
        else:
            st.session_state.form_sent = True
    if st.session_state.get("form_sent"):
        st.markdown(f'<div class="success-note">{copy["success"]}</div>', unsafe_allow_html=True)


def render_page(copy: dict) -> None:
    st.markdown(
        f"""
        <div class="topbar">
          <div></div>
          <div class="nav-copy">
            <a href="#guide">{copy["nav_guide"]}</a>
            <a href="#faq">{copy["nav_faq"]}</a>
            <a href="#sources">{copy["nav_sources"]}</a>
          </div>
        </div>
        <section class="hero">
          <div>
            <div class="eyebrow">{copy["eyebrow"]}</div>
            <h1>{copy["hero_title"]}<br><span>{copy["hero_title_2"]}</span></h1>
            <p class="hero-lead">{copy["hero_body"]}</p>
            <div class="hero-actions">
              <a class="button-link" href="#download">{copy["primary_cta"]} ↗</a>
              <a class="text-link" href="#guide">{copy["secondary_cta"]} ↓</a>
            </div>
            <div class="hero-note">↳ {copy["hero_note"]}</div>
          </div>
          <div class="hero-visual">
            <div class="visual-orbit"></div>
            <div class="visual-card main">
              <div class="label">{copy["floating_label"]}</div>
              <div class="amount">{copy["floating_value"]}</div>
              <div class="sub">{copy["floating_sub"]}</div>
            </div>
            <div class="visual-card small">
              <div class="label">PRÄMIENVERBILLIGUNG</div>
              <div class="amount">+ CHF 384</div>
              <div class="sub">pro Monat möglich</div>
            </div>
          </div>
        </section>
        <div class="trust-row">✦ &nbsp; {copy["trust"]} &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; AUS ÖFFENTLICHEN QUELLEN</div>
        <section class="section">
          <div class="section-head">
            <div><div class="section-kicker">{copy["section_kicker"]}</div><h2>{copy["section_title"]}<br>{copy["section_title_2"]}</h2></div>
            <p class="section-desc">{copy["section_body"]}</p>
          </div>
          <div class="cards">
            {''.join(f'<article class="benefit-card"><div><div class="card-num">{num}</div><h3>{title}</h3><p>{body}</p></div><div class="card-stat">{stat} ↗</div></article>' for num, title, body, stat in copy["cards"])}
          </div>
        </section>
        <section id="guide" class="guide-wrap">
          <div class="guide-panel">
            <div class="section-kicker">{copy["guide_kicker"]}</div>
            <h2>{copy["guide_title"]}</h2>
            <p>{copy["guide_body"]}</p>
            <div class="guide-mark">PDF<br>2026</div>
          </div>
          <div>
            <ul class="check-list">{''.join(f'<li>{item}</li>' for item in copy["guide_items"])}</ul>
          </div>
        </section>
        <div class="facts">
          {''.join(f'<div class="fact"><strong>{value}</strong><span>{label}</span></div>' for value, label in copy["facts"])}
        </div>
        <section id="download" class="download-section">
          <div>
            <div class="section-kicker">{copy["form_kicker"]}</div>
            <h2>{copy["form_title"]}</h2>
            <p class="form-lead">{copy["form_body"]}</p>
          </div>
          <div class="download-card">
        """,
        unsafe_allow_html=True,
    )
    render_form(copy)
    st.markdown(
        f"""
            <div class="form-hint">✓ {copy["form_hint"]}<br>✓ DSGVO / Schweizer FADP</div>
          </div>
        </section>
        <section id="faq" class="faq-section">
          <div class="section-kicker">{copy["faq_kicker"]}</div>
          <h2>{copy["faq_title"]}</h2>
          <div class="faq-grid">
            {''.join(f'<article class="faq-item"><h3>{question}</h3><p>{answer}</p></article>' for question, answer in copy["faq"])}
          </div>
        </section>
        <section id="sources" class="sources">
          <div>
            <div class="section-kicker">{copy["source_kicker"]}</div>
            <h2>{copy["source_title"]}</h2>
            <p>{copy["source_body"]}</p>
          </div>
          <div class="source-links">{''.join(f'<a href="https://{link}" target="_blank">{link}</a>' if "." in link else f'<a href="#">{link}</a>' for link in copy["source_links"])}</div>
        </section>
        <footer class="footer"><div>{copy["footer_note"]}</div><div><a href="#">{copy["legal"]}</a> &nbsp;·&nbsp; HTTPS</div></footer>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    inject_styles()
    current_lang = language_switcher()
    render_page(COPY[current_lang])