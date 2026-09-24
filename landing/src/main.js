import { jsPDF } from "jspdf";

const translations = {
  de: {
    pageTitle: "CH/26 — Staatliche Leistungen in der Schweiz",
    pageDescription: "Kostenloser Guide zu staatlichen Leistungen in der Schweiz 2026.",
    skipLink: "Zum Inhalt springen",
    topline: "Aktualisiert für 2026 · Kostenloser PDF-Guide",
    sourceLink: "Offizielle Quellen",
    navBenefits: "Leistungen",
    navGuide: "Im Guide",
    heroEyebrow: "Geld, das dir zustehen kann",
    heroTitle: "Die Schweiz zahlt.<br /><span>Weisst du, wofür?</span>",
    heroLead:
      "Prämienverbilligung, Familienzulagen, Ergänzungsleistungen und Mietbeiträge: Der kostenlose Guide zeigt dir in 2 Minuten, wo du nachsehen musst.",
    heroCta: "Guide kostenlos herunterladen",
    heroProof: "Für alle 26 Kantone · Stand September 2026",
    formKicker: "Dein kostenloser Guide",
    formTitle: "Prüfe deinen Anspruch.",
    formLead: "Direkt herunterladen. Klar, kompakt, kantonal.",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "name@beispiel.ch",
    emailError: "Bitte gültige E-Mail eingeben.",
    birthLabel: "Geburtsjahr",
    birthPlaceholder: "Bitte auswählen",
    birthEarlier: "Vor 2007",
    birthLater: "Nach 2009",
    birthError: "Bitte Geburtsjahr auswählen.",
    consentStart: "Ich stimme der Datenverarbeitung gemäss",
    privacy: "Datenschutzerklärung",
    consentEnd: "zu.",
    consentError: "Zustimmung ist erforderlich.",
    formButton: "Guide kostenlos erhalten",
    privacyNote: "Kein Spam. Abmeldung mit einem Klick.",
    ribbonChapters: "Kapitel",
    ribbonCantons: "Kantone",
    ribbonCheck: "für den ersten Check",
    ribbonSources: "Basierend auf offiziellen Quellen",
    benefitsLabel: "Was oft liegen bleibt",
    benefitsTitle: "Das Geld ist da.<br /><em>Du musst es beantragen.</em>",
    benefitsIntro:
      "Viele Leistungen werden nicht automatisch ausbezahlt. Drei typische Fälle, bei denen sich ein genauer Blick lohnt.",
    healthQuestion:
      "«Ich zahle jeden Monat über CHF 300 für die Krankenkasse. Ist das normal?»",
    answerNo: "Nicht unbedingt.",
    healthAnswer:
      "Bei tieferem Einkommen beteiligt sich der Kanton an der Prämie. Höhe und Frist sind kantonal geregelt.",
    healthMetric: "Richtprämie pro Jahr für Erwachsene in BL*",
    familyQuestion: "«Ich habe zwei Kinder. Zahlt der Staat etwas dazu?»",
    answerYes: "Ja.",
    familyAnswer:
      "Familienzulagen gibt es für fast alle Erwerbstätigen. Der Betrag hängt von Alter und Kanton ab.",
    familyMetric: "pro Kind und Monat*",
    pensionQuestion: "«Meine Rente reicht kaum für den Alltag.»",
    answerCheck: "Prüfen.",
    pensionAnswer:
      "Ergänzungsleistungen helfen, wenn AHV oder IV die anerkannten Lebenskosten nicht decken.",
    pensionMetric: "allgemeiner Lebensbedarf, alleinstehend*",
    cardsFineprint:
      "* Richtwerte gemäss den im Guide genannten offiziellen Quellen; Anspruch und Betrag werden individuell geprüft.",
    guideLabel: "Was du bekommst",
    guideTitle: "Ein Guide.<br /><em>Sieben klare Antworten.</em>",
    guideIntro:
      "Kein Amtsdeutsch. Stattdessen: Voraussetzungen, Beträge, Fristen und der direkte Weg zur zuständigen Stelle.",
    chapterFamily: "Familienzulagen",
    chapterFamilyText: "Beträge nach Kanton, Altersgrenzen und Antrag.",
    chapterInsurance: "Prämienverbilligung",
    chapterInsuranceText: "Einkommen, Fristen und kantonale Anlaufstellen.",
    chapterEL: "Ergänzungsleistungen",
    chapterELText: "Anspruch, Vermögensschwelle und anerkannte Kosten.",
    chapterAHV: "AHV-Rente 2026",
    chapterAHVText: "Zahlungstermine und 13. AHV-Rente.",
    chapterRent: "Mietzinsbeiträge",
    chapterRentText: "Hilfe für Familien und Rentner nach Wohnort.",
    chapterTax: "Steuerabzüge",
    chapterTaxText: "Kinder, Versicherungen und Vorsorgebeiträge.",
    chapterFaqText: "Fristen, Ausländerstatus und Doppelbürgerschaft.",
    stepsLabel: "So funktioniert es",
    stepsTitle: "Vom Fragezeichen<br /><em>zum nächsten Schritt.</em>",
    stepOne: "E-Mail eintragen",
    stepOneText: "Nur E-Mail, Geburtsjahr und Zustimmung — mehr nicht.",
    stepTwo: "Guide öffnen",
    stepTwoText: "PDF direkt sichern und passende Leistung auswählen.",
    stepThree: "Anspruch prüfen",
    stepThreeText: "Frist notieren und über die offizielle Stelle beantragen.",
    faqTitle: "Kurz gefragt.<br /><em>Klar beantwortet.</em>",
    faqIntro:
      "Die wichtigsten Fragen vor dem Download. Im Guide findest du die Details und offiziellen Links.",
    faqOneQ: "Steht mir wirklich etwas zu?",
    faqOneA:
      "Das hängt von Einkommen, Haushalt, Alter und Kanton ab. Wer Kinder hat, hohe Prämien bezahlt oder mit kleiner Rente lebt, sollte den Anspruch besonders prüfen.",
    faqTwoQ: "Ich bin Ausländer:in. Gilt das auch für mich?",
    faqTwoA:
      "Häufig ja. Aufenthaltsstatus, Wohnsitzdauer und Leistungstyp sind entscheidend. Der Guide zeigt, welche Stelle verbindlich Auskunft gibt.",
    faqThreeQ: "Wie viel gibt es pro Kind?",
    faqThreeA:
      "Die gesetzlichen Mindestbeträge liegen 2026 je nach Alter bei CHF 215–245 bzw. CHF 268–298 pro Monat. Manche Kantone zahlen mehr.",
    faqFourQ: "Was sind Ergänzungsleistungen?",
    faqFourA:
      "EL ergänzen AHV oder IV, wenn anerkannte Ausgaben höher als die Einnahmen sind. Einkommen, Vermögen, Miete und Krankenkasse fliessen ein.",
    faqFiveQ: "Wann wird die AHV ausbezahlt?",
    faqFiveA:
      "In der Regel zu Beginn des Monats. Der Guide enthält den Kalender 2026 und erklärt die Auszahlung der 13. AHV-Rente.",
    faqSixQ: "Was, wenn ich eine Frist verpasst habe?",
    faqSixA:
      "Das ist kantonal verschieden. Oft ist eine rückwirkende Anmeldung nicht möglich — den nächsten Termin solltest du trotzdem sofort sichern.",
    downloadLabel: "Jetzt herunterladen",
    downloadTitle: "Dein Geld wartet nicht.<br /><em>Fristen auch nicht.</em>",
    downloadLead:
      "Sichere dir den Guide und prüfe heute, welche Leistungen du möglicherweise verpasst.",
    downloadPointOne: "Kostenlos und direkt verfügbar",
    downloadPointTwo: "Für alle 26 Kantone",
    downloadPointThree: "Mit Links zu offiziellen Stellen",
    dataUse: "Nur für PDF und Updates. Keine Weitergabe an Dritte.",
    sourcesLabel: "Transparenz",
    sourcesTitle: "Woher die<br /><em>Angaben kommen.</em>",
    sourcesText:
      "Der Guide basiert auf frei zugänglichen Informationen des Bundesamts für Sozialversicherungen, der kantonalen Ausgleichskassen, der GDK und weiteren offiziellen Publikationen.",
    disclaimer:
      "CH/26 ist keine Rechts- oder Sozialberatungsstelle. Der Guide ist ein Navigator; verbindlich entscheiden ausschliesslich die zuständigen Behörden.",
    footerLine: "Ein klarer Wegweiser durch Schweizer Leistungen.",
    imprint: "Impressum",
    footerPrivacy: "Datenschutz nach DSG & DSGVO",
    mobileCta: "Gratis-Guide",
    successTitle: "Der Guide ist bereit.",
    successText:
      "Danke! Lade deine Ausgabe jetzt herunter. Prüfe danach auch dein Postfach.",
    successButton: "PDF jetzt herunterladen",
    successNote:
      "Demo-Hinweis: Für den E-Mail-Versand muss noch ein Formular-Endpunkt verbunden werden.",
  },
  fr: {
    pageTitle: "CH/26 — Prestations publiques en Suisse",
    pageDescription: "Guide gratuit des prestations publiques en Suisse en 2026.",
    skipLink: "Aller au contenu",
    topline: "Mis à jour pour 2026 · Guide PDF gratuit",
    sourceLink: "Sources officielles",
    navBenefits: "Prestations",
    navGuide: "Dans le guide",
    heroEyebrow: "L'argent auquel tu peux avoir droit",
    heroTitle: "La Suisse verse.<br /><span>Sais-tu pour quoi ?</span>",
    heroLead:
      "Réduction des primes, allocations familiales, prestations complémentaires et aides au loyer : ce guide gratuit te montre en 2 minutes où regarder.",
    heroCta: "Télécharger le guide gratuit",
    heroProof: "Pour les 26 cantons · État septembre 2026",
    formKicker: "Ton guide gratuit",
    formTitle: "Vérifie tes droits.",
    formLead: "Accès direct. Clair, concis et cantonal.",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "nom@exemple.ch",
    emailError: "Saisis une adresse e-mail valide.",
    birthLabel: "Année de naissance",
    birthPlaceholder: "Sélectionner",
    birthEarlier: "Avant 2007",
    birthLater: "Après 2009",
    birthError: "Sélectionne ton année de naissance.",
    consentStart: "J'accepte le traitement de mes données selon la",
    privacy: "Déclaration de confidentialité",
    consentEnd: ".",
    consentError: "Ton consentement est requis.",
    formButton: "Recevoir le guide gratuit",
    privacyNote: "Sans spam. Désinscription en un clic.",
    ribbonChapters: "chapitres",
    ribbonCantons: "cantons",
    ribbonCheck: "pour un premier contrôle",
    ribbonSources: "Basé sur des sources officielles",
    benefitsLabel: "Ce qu'on oublie souvent",
    benefitsTitle: "L'argent est là.<br /><em>À toi de le demander.</em>",
    benefitsIntro:
      "De nombreuses prestations ne sont pas versées automatiquement. Trois situations typiques où il vaut la peine de vérifier.",
    healthQuestion:
      "« Je paie plus de CHF 300 par mois d'assurance maladie. Est-ce normal ? »",
    answerNo: "Pas forcément.",
    healthAnswer:
      "Avec un revenu plus faible, le canton peut participer à la prime. Montant et délai dépendent du canton.",
    healthMetric: "prime indicative annuelle pour un adulte à BL*",
    familyQuestion: "« J'ai deux enfants. L'État verse-t-il une aide ? »",
    answerYes: "Oui.",
    familyAnswer:
      "Presque toutes les personnes actives ont droit aux allocations familiales. Le montant dépend de l'âge et du canton.",
    familyMetric: "par enfant et par mois*",
    pensionQuestion: "« Ma rente suffit à peine pour vivre. »",
    answerCheck: "À vérifier.",
    pensionAnswer:
      "Les prestations complémentaires aident lorsque l'AVS ou l'AI ne couvre pas les dépenses reconnues.",
    pensionMetric: "besoins vitaux généraux, personne seule*",
    cardsFineprint:
      "* Valeurs indicatives selon les sources officielles citées dans le guide ; le droit et le montant sont examinés individuellement.",
    guideLabel: "Ce que tu reçois",
    guideTitle: "Un guide.<br /><em>Sept réponses claires.</em>",
    guideIntro:
      "Pas de jargon administratif. Mais des conditions, montants, délais et un accès direct au bon service.",
    chapterFamily: "Allocations familiales",
    chapterFamilyText: "Montants par canton, limites d'âge et demande.",
    chapterInsurance: "Réduction des primes",
    chapterInsuranceText: "Revenu, délais et services cantonaux.",
    chapterEL: "Prestations complémentaires",
    chapterELText: "Droit, seuil de fortune et frais reconnus.",
    chapterAHV: "Rente AVS 2026",
    chapterAHVText: "Dates de paiement et 13e rente AVS.",
    chapterRent: "Aides au loyer",
    chapterRentText: "Soutien aux familles et retraités selon le domicile.",
    chapterTax: "Déductions fiscales",
    chapterTaxText: "Enfants, assurances et cotisations de prévoyance.",
    chapterFaqText: "Délais, statut d'étranger et double nationalité.",
    stepsLabel: "Comment ça marche",
    stepsTitle: "Du point d'interrogation<br /><em>à l'étape suivante.</em>",
    stepOne: "Saisir ton e-mail",
    stepOneText: "E-mail, année de naissance et consentement — rien de plus.",
    stepTwo: "Ouvrir le guide",
    stepTwoText: "Enregistrer le PDF et choisir la prestation pertinente.",
    stepThree: "Vérifier ton droit",
    stepThreeText: "Noter le délai et déposer la demande auprès du service officiel.",
    faqTitle: "Questions courtes.<br /><em>Réponses claires.</em>",
    faqIntro:
      "Les questions essentielles avant le téléchargement. Le guide contient les détails et les liens officiels.",
    faqOneQ: "Ai-je vraiment droit à quelque chose ?",
    faqOneA:
      "Cela dépend du revenu, du ménage, de l'âge et du canton. Si tu as des enfants, paies des primes élevées ou vis avec une petite rente, vérifie en priorité.",
    faqTwoQ: "Je suis étranger·ère. Est-ce aussi valable pour moi ?",
    faqTwoA:
      "Souvent oui. Le statut de séjour, la durée de résidence et le type de prestation sont déterminants. Le guide indique le service qui peut répondre officiellement.",
    faqThreeQ: "Combien reçoit-on par enfant ?",
    faqThreeA:
      "En 2026, les minimums légaux sont de CHF 215–245 ou CHF 268–298 par mois selon l'âge. Certains cantons versent davantage.",
    faqFourQ: "Que sont les prestations complémentaires ?",
    faqFourA:
      "Les PC complètent l'AVS ou l'AI lorsque les dépenses reconnues dépassent les revenus. Revenu, fortune, loyer et assurance maladie sont pris en compte.",
    faqFiveQ: "Quand la rente AVS est-elle versée ?",
    faqFiveA:
      "En général au début du mois. Le guide contient le calendrier 2026 et explique le versement de la 13e rente AVS.",
    faqSixQ: "Et si j'ai manqué un délai ?",
    faqSixA:
      "Cela varie selon le canton. Une demande rétroactive est souvent impossible — mais note sans attendre le prochain délai.",
    downloadLabel: "Télécharger maintenant",
    downloadTitle: "Ton argent n'attend pas.<br /><em>Les délais non plus.</em>",
    downloadLead:
      "Télécharge le guide et vérifie dès aujourd'hui les prestations que tu pourrais manquer.",
    downloadPointOne: "Gratuit et disponible immédiatement",
    downloadPointTwo: "Pour les 26 cantons",
    downloadPointThree: "Avec des liens vers les services officiels",
    dataUse: "Uniquement pour le PDF et les mises à jour. Aucun partage avec des tiers.",
    sourcesLabel: "Transparence",
    sourcesTitle: "D'où viennent<br /><em>les informations.</em>",
    sourcesText:
      "Le guide repose sur les informations publiques de l'Office fédéral des assurances sociales, des caisses cantonales de compensation, de la CDS et d'autres publications officielles.",
    disclaimer:
      "CH/26 n'est pas un service de conseil juridique ou social. Le guide sert d'orientation ; seules les autorités compétentes prennent une décision contraignante.",
    footerLine: "Un chemin clair dans les prestations suisses.",
    imprint: "Mentions légales",
    footerPrivacy: "Protection des données selon LPD & RGPD",
    mobileCta: "Guide gratuit",
    successTitle: "Le guide est prêt.",
    successText:
      "Merci ! Télécharge ton édition maintenant, puis vérifie aussi ta boîte de réception.",
    successButton: "Télécharger le PDF",
    successNote:
      "Note de démo : un point d'envoi doit encore être connecté pour la livraison par e-mail.",
  },
  it: {
    pageTitle: "CH/26 — Prestazioni pubbliche in Svizzera",
    pageDescription: "Guida gratuita alle prestazioni pubbliche in Svizzera nel 2026.",
    skipLink: "Vai al contenuto",
    topline: "Aggiornato per il 2026 · Guida PDF gratuita",
    sourceLink: "Fonti ufficiali",
    navBenefits: "Prestazioni",
    navGuide: "Nella guida",
    heroEyebrow: "Il denaro a cui potresti avere diritto",
    heroTitle: "La Svizzera paga.<br /><span>Sai per cosa?</span>",
    heroLead:
      "Riduzione dei premi, assegni familiari, prestazioni complementari e contributi all'affitto: la guida gratuita ti mostra in 2 minuti dove guardare.",
    heroCta: "Scarica la guida gratuita",
    heroProof: "Per tutti i 26 cantoni · Aggiornato a settembre 2026",
    formKicker: "La tua guida gratuita",
    formTitle: "Verifica i tuoi diritti.",
    formLead: "Download diretto. Chiaro, conciso e cantonale.",
    emailLabel: "Indirizzo e-mail",
    emailPlaceholder: "nome@esempio.ch",
    emailError: "Inserisci un indirizzo e-mail valido.",
    birthLabel: "Anno di nascita",
    birthPlaceholder: "Seleziona",
    birthEarlier: "Prima del 2007",
    birthLater: "Dopo il 2009",
    birthError: "Seleziona l'anno di nascita.",
    consentStart: "Acconsento al trattamento dei dati secondo",
    privacy: "l'informativa sulla privacy",
    consentEnd: ".",
    consentError: "Il consenso è obbligatorio.",
    formButton: "Ricevi la guida gratuita",
    privacyNote: "Niente spam. Cancellazione con un clic.",
    ribbonChapters: "capitoli",
    ribbonCantons: "cantoni",
    ribbonCheck: "per il primo controllo",
    ribbonSources: "Basato su fonti ufficiali",
    benefitsLabel: "Ciò che spesso si dimentica",
    benefitsTitle: "Il denaro c'è.<br /><em>Devi richiederlo.</em>",
    benefitsIntro:
      "Molte prestazioni non vengono versate automaticamente. Tre casi tipici in cui vale la pena controllare.",
    healthQuestion:
      "«Pago oltre CHF 300 al mese di assicurazione malattia. È normale?»",
    answerNo: "Non sempre.",
    healthAnswer:
      "Con un reddito più basso, il cantone può contribuire al premio. Importo e scadenza dipendono dal cantone.",
    healthMetric: "premio di riferimento annuo per adulti in BL*",
    familyQuestion: "«Ho due figli. Lo Stato paga qualcosa?»",
    answerYes: "Sì.",
    familyAnswer:
      "Quasi tutte le persone che lavorano hanno diritto agli assegni familiari. L'importo dipende dall'età e dal cantone.",
    familyMetric: "per figlio al mese*",
    pensionQuestion: "«La mia rendita basta appena per vivere.»",
    answerCheck: "Da verificare.",
    pensionAnswer:
      "Le prestazioni complementari aiutano quando AVS o AI non coprono le spese riconosciute.",
    pensionMetric: "fabbisogno generale, persona sola*",
    cardsFineprint:
      "* Valori indicativi secondo le fonti ufficiali citate nella guida; diritto e importo sono verificati individualmente.",
    guideLabel: "Cosa ricevi",
    guideTitle: "Una guida.<br /><em>Sette risposte chiare.</em>",
    guideIntro:
      "Niente burocratese. Solo requisiti, importi, scadenze e la via diretta all'ufficio competente.",
    chapterFamily: "Assegni familiari",
    chapterFamilyText: "Importi per cantone, limiti d'età e domanda.",
    chapterInsurance: "Riduzione dei premi",
    chapterInsuranceText: "Reddito, scadenze e uffici cantonali.",
    chapterEL: "Prestazioni complementari",
    chapterELText: "Diritto, soglia patrimoniale e spese riconosciute.",
    chapterAHV: "Rendita AVS 2026",
    chapterAHVText: "Date di pagamento e 13a rendita AVS.",
    chapterRent: "Contributi all'affitto",
    chapterRentText: "Aiuti per famiglie e pensionati in base al domicilio.",
    chapterTax: "Deduzioni fiscali",
    chapterTaxText: "Figli, assicurazioni e contributi previdenziali.",
    chapterFaqText: "Scadenze, status di straniero e doppia cittadinanza.",
    stepsLabel: "Come funziona",
    stepsTitle: "Dal punto interrogativo<br /><em>al prossimo passo.</em>",
    stepOne: "Inserisci l'e-mail",
    stepOneText: "Solo e-mail, anno di nascita e consenso — nient'altro.",
    stepTwo: "Apri la guida",
    stepTwoText: "Salva il PDF e scegli la prestazione pertinente.",
    stepThree: "Verifica il diritto",
    stepThreeText: "Segna la scadenza e presenta domanda all'ufficio ufficiale.",
    faqTitle: "Domande brevi.<br /><em>Risposte chiare.</em>",
    faqIntro:
      "Le domande più importanti prima del download. Nella guida trovi dettagli e link ufficiali.",
    faqOneQ: "Ho davvero diritto a qualcosa?",
    faqOneA:
      "Dipende da reddito, nucleo familiare, età e cantone. Se hai figli, paghi premi elevati o vivi con una rendita modesta, vale la pena verificare.",
    faqTwoQ: "Sono straniero/a. Vale anche per me?",
    faqTwoA:
      "Spesso sì. Contano il permesso, la durata della residenza e il tipo di prestazione. La guida indica l'ufficio che può dare una risposta vincolante.",
    faqThreeQ: "Quanto si riceve per figlio?",
    faqThreeA:
      "Nel 2026, i minimi di legge sono CHF 215–245 o CHF 268–298 al mese a seconda dell'età. Alcuni cantoni pagano di più.",
    faqFourQ: "Cosa sono le prestazioni complementari?",
    faqFourA:
      "Le PC integrano AVS o AI quando le spese riconosciute superano le entrate. Si considerano reddito, patrimonio, affitto e cassa malati.",
    faqFiveQ: "Quando viene pagata l'AVS?",
    faqFiveA:
      "Di regola all'inizio del mese. La guida contiene il calendario 2026 e spiega il pagamento della 13a rendita AVS.",
    faqSixQ: "E se ho perso una scadenza?",
    faqSixA:
      "Dipende dal cantone. Spesso non è possibile una domanda retroattiva — ma conviene segnare subito la prossima scadenza.",
    downloadLabel: "Scarica ora",
    downloadTitle: "Il tuo denaro non aspetta.<br /><em>Nemmeno le scadenze.</em>",
    downloadLead:
      "Scarica la guida e verifica oggi quali prestazioni potresti perdere.",
    downloadPointOne: "Gratuita e subito disponibile",
    downloadPointTwo: "Per tutti i 26 cantoni",
    downloadPointThree: "Con link agli uffici ufficiali",
    dataUse: "Solo per PDF e aggiornamenti. Nessuna cessione a terzi.",
    sourcesLabel: "Trasparenza",
    sourcesTitle: "Da dove vengono<br /><em>le informazioni.</em>",
    sourcesText:
      "La guida si basa sulle informazioni pubbliche dell'Ufficio federale delle assicurazioni sociali, delle casse cantonali di compensazione, della CDS e di altre pubblicazioni ufficiali.",
    disclaimer:
      "CH/26 non è un servizio di consulenza legale o sociale. La guida orienta; solo le autorità competenti prendono decisioni vincolanti.",
    footerLine: "Una guida chiara alle prestazioni svizzere.",
    imprint: "Colophon",
    footerPrivacy: "Protezione dati secondo LPD & GDPR",
    mobileCta: "Guida gratuita",
    successTitle: "La guida è pronta.",
    successText:
      "Grazie! Scarica ora la tua edizione e poi controlla anche la posta in arrivo.",
    successButton: "Scarica ora il PDF",
    successNote:
      "Nota demo: per l'invio via e-mail deve ancora essere collegato un endpoint del modulo.",
  },
};

const legalContent = {
  de: {
    imprint: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Impressum</h2>
      <p><strong>Verantwortlich für diese Website</strong><br />[Vollständiger Name / Firmenname]<br />[Strasse und Hausnummer]<br />[PLZ und Ort], Schweiz</p>
      <p><strong>Kontakt</strong><br />[E-Mail-Adresse]<br />[Telefon, optional]</p>
      <h3>Haftungsausschluss</h3>
      <p>Die Inhalte dienen ausschliesslich der allgemeinen Orientierung und ersetzen keine Rechts-, Steuer- oder Sozialberatung. Verbindliche Auskünfte erteilen die zuständigen Behörden.</p>
      <p><strong>Vor Veröffentlichung:</strong> Die Angaben in eckigen Klammern müssen durch die Daten des Betreibers ersetzt werden.</p>
    `,
    privacy: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Datenschutzerklärung</h2>
      <p>Diese Website verarbeitet die im Formular eingegebene E-Mail-Adresse und das gewählte Geburtsjahr, um den angeforderten Guide bereitzustellen und — bei entsprechender Einwilligung — Informationen zu Sozialleistungen zu senden.</p>
      <h3>Verarbeitete Daten</h3>
      <ul><li>E-Mail-Adresse</li><li>Geburtsjahr-Kategorie</li><li>Zeitpunkt und Inhalt der Einwilligung</li></ul>
      <h3>Zweck und Rechtsgrundlage</h3>
      <p>Die Verarbeitung erfolgt zur Bereitstellung des Guides und auf Grundlage deiner Einwilligung. Daten werden nicht verkauft. Eingesetzte Versand- oder Hosting-Dienstleister dürfen Daten nur zweckgebunden verarbeiten.</p>
      <h3>Deine Rechte</h3>
      <p>Du kannst Auskunft, Berichtigung oder Löschung verlangen und deine Einwilligung jederzeit widerrufen. Kontakt: [Datenschutz-E-Mail]. Es werden aktuell keine Analyse-Cookies gesetzt.</p>
      <p><strong>Vor Veröffentlichung:</strong> Betreiber, Auftragsverarbeiter, Speicherdauer und Kontakt müssen nach Anschluss des Formular-Backends ergänzt werden.</p>
    `,
  },
  fr: {
    imprint: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Mentions légales</h2>
      <p><strong>Responsable du site</strong><br />[Nom complet / raison sociale]<br />[Rue et numéro]<br />[NPA et localité], Suisse</p>
      <p><strong>Contact</strong><br />[Adresse e-mail]<br />[Téléphone, facultatif]</p>
      <h3>Exclusion de responsabilité</h3>
      <p>Les contenus servent uniquement d'orientation générale et ne remplacent aucun conseil juridique, fiscal ou social. Seules les autorités compétentes fournissent des informations contraignantes.</p>
      <p><strong>Avant publication :</strong> remplace les indications entre crochets par les coordonnées de l'exploitant.</p>
    `,
    privacy: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Déclaration de confidentialité</h2>
      <p>Ce site traite l'adresse e-mail et la catégorie d'année de naissance saisies dans le formulaire afin de fournir le guide demandé et, avec ton consentement, des informations sur les prestations sociales.</p>
      <h3>Données traitées</h3>
      <ul><li>Adresse e-mail</li><li>Catégorie d'année de naissance</li><li>Date et contenu du consentement</li></ul>
      <h3>Finalité et base juridique</h3>
      <p>Le traitement sert à fournir le guide et repose sur ton consentement. Les données ne sont pas vendues. Les prestataires d'envoi ou d'hébergement ne peuvent les traiter que pour cette finalité.</p>
      <h3>Tes droits</h3>
      <p>Tu peux demander l'accès, la rectification ou la suppression et retirer ton consentement à tout moment. Contact : [e-mail de confidentialité]. Aucun cookie d'analyse n'est actuellement utilisé.</p>
      <p><strong>Avant publication :</strong> complète l'exploitant, les sous-traitants, la durée de conservation et le contact après le raccordement du formulaire.</p>
    `,
  },
  it: {
    imprint: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Colophon</h2>
      <p><strong>Responsabile del sito</strong><br />[Nome completo / ragione sociale]<br />[Via e numero]<br />[NPA e località], Svizzera</p>
      <p><strong>Contatto</strong><br />[Indirizzo e-mail]<br />[Telefono, facoltativo]</p>
      <h3>Esclusione di responsabilità</h3>
      <p>I contenuti servono solo come orientamento generale e non sostituiscono una consulenza legale, fiscale o sociale. Le informazioni vincolanti sono fornite dalle autorità competenti.</p>
      <p><strong>Prima della pubblicazione:</strong> sostituisci le indicazioni tra parentesi quadre con i dati del gestore.</p>
    `,
    privacy: `
      <p class="modal-kicker">CH / 2026</p>
      <h2>Informativa sulla privacy</h2>
      <p>Questo sito tratta l'indirizzo e-mail e la categoria dell'anno di nascita inseriti nel modulo per fornire la guida richiesta e, con il tuo consenso, informazioni sulle prestazioni sociali.</p>
      <h3>Dati trattati</h3>
      <ul><li>Indirizzo e-mail</li><li>Categoria dell'anno di nascita</li><li>Data e contenuto del consenso</li></ul>
      <h3>Scopo e base giuridica</h3>
      <p>Il trattamento serve a fornire la guida e si basa sul tuo consenso. I dati non vengono venduti. I fornitori di invio o hosting possono trattarli solo per questo scopo.</p>
      <h3>I tuoi diritti</h3>
      <p>Puoi chiedere accesso, rettifica o cancellazione e revocare il consenso in qualsiasi momento. Contatto: [e-mail privacy]. Al momento non vengono usati cookie analitici.</p>
      <p><strong>Prima della pubblicazione:</strong> completa gestore, responsabili del trattamento, periodo di conservazione e contatto dopo aver collegato il backend del modulo.</p>
    `,
  },
};

const guideData = {
  de: {
    title: "STAATLICHE LEISTUNGEN\nSCHWEIZ 2026",
    subtitle: "Dein kompakter Wegweiser",
    intro:
      "Dieser Guide hilft dir, mögliche Ansprüche zu erkennen und die zuständige offizielle Stelle zu finden. Er ersetzt keine individuelle Beratung.",
    howTitle: "SO NUTZT DU DIESEN GUIDE",
    howSteps: [
      "Markiere die Kapitel, die zu deiner Situation passen.",
      "Prüfe die Regeln deines Wohnkantons über den offiziellen Link.",
      "Notiere Frist und benötigte Unterlagen.",
      "Lass den Anspruch von der zuständigen Stelle verbindlich prüfen.",
    ],
    chapters: [
      ["Familienzulagen", "Für Erwerbstätige mit Kindern. Betrag, Altersgrenze und Anmeldung hängen von der Situation und teilweise vom Kanton ab."],
      ["Prämienverbilligung", "Kantonale Unterstützung an die Krankenkassenprämie für Haushalte mit begrenztem Einkommen. Fristen unbedingt früh prüfen."],
      ["Ergänzungsleistungen", "Für Personen, deren AHV- oder IV-Leistungen die anerkannten Ausgaben nicht decken. Einkommen und Vermögen werden berücksichtigt."],
      ["AHV-Rente 2026", "Überblick über Auszahlung, Termine und die 13. AHV-Rente. Verbindliche Informationen gibt die Ausgleichskasse."],
      ["Mietzinsbeiträge", "Zusätzliche kantonale oder kommunale Hilfe kann für Familien und ältere Menschen bestehen. Nicht schweizweit einheitlich."],
      ["Steuerabzüge", "Kinder, Versicherungen, Berufskosten und Vorsorge können die Steuerlast senken. Details unterscheiden sich nach Kanton."],
      ["FAQ & Sonderfälle", "Orientierung bei verpassten Fristen, ausländischer Staatsangehörigkeit, B- oder C-Ausweis und Doppelbürgerschaft."],
    ],
    checkTitle: "DEIN CHECK FÜR DIESES KAPITEL",
    checklist: [
      "Trifft die Leistung auf meine Lebenssituation zu?",
      "Welche Einkommens- oder Vermögensgrenzen gelten?",
      "Welche Frist gilt an meinem Wohnort?",
      "Welche Nachweise muss ich einreichen?",
      "Welche Behörde entscheidet verbindlich?",
    ],
    sourcesTitle: "OFFIZIELLE STARTPUNKTE",
    sourcesText:
      "ahv-iv.ch\nbsv.admin.ch\nbag.admin.ch\nch.ch\ngdk-cds.ch\n\nPrüfe zusätzlich immer die Website deines Kantons und deiner Gemeinde.",
    finalTitle: "DEIN PERSÖNLICHER NÄCHSTER SCHRITT",
    finalText:
      "Gewählte Leistung: ______________________________\n\nZuständige Stelle: _______________________________\n\nEinreichfrist: ___________________________________\n\nFehlende Unterlagen: _____________________________\n\nTermin für Prüfung: ______________________________",
    disclaimer:
      "Stand September 2026. Dieser Navigator ist keine Rechts-, Steuer- oder Sozialberatung. Verbindlich sind ausschliesslich die Angaben und Entscheide der zuständigen Behörden.",
  },
  fr: {
    title: "PRESTATIONS PUBLIQUES\nSUISSE 2026",
    subtitle: "Ton guide pratique et concis",
    intro:
      "Ce guide t'aide à repérer des droits possibles et à trouver le service officiel compétent. Il ne remplace pas un conseil individuel.",
    howTitle: "COMMENT UTILISER CE GUIDE",
    howSteps: [
      "Marque les chapitres qui correspondent à ta situation.",
      "Vérifie les règles de ton canton via le lien officiel.",
      "Note le délai et les documents nécessaires.",
      "Fais confirmer ton droit par le service compétent.",
    ],
    chapters: [
      ["Allocations familiales", "Pour les personnes actives avec enfants. Montant, limite d'âge et inscription dépendent de la situation et parfois du canton."],
      ["Réduction des primes", "Aide cantonale aux primes d'assurance maladie pour les ménages à revenu limité. Vérifie les délais sans attendre."],
      ["Prestations complémentaires", "Pour les personnes dont l'AVS ou l'AI ne couvre pas les dépenses reconnues. Revenu et fortune sont pris en compte."],
      ["Rente AVS 2026", "Aperçu des versements, dates et de la 13e rente AVS. La caisse de compensation fournit les informations contraignantes."],
      ["Aides au loyer", "Des aides cantonales ou communales peuvent exister pour les familles et les personnes âgées. Elles ne sont pas uniformes."],
      ["Déductions fiscales", "Enfants, assurances, frais professionnels et prévoyance peuvent réduire l'impôt. Les détails varient selon le canton."],
      ["FAQ et cas particuliers", "Orientation en cas de délai manqué, nationalité étrangère, permis B ou C et double nationalité."],
    ],
    checkTitle: "TON CONTRÔLE POUR CE CHAPITRE",
    checklist: [
      "Cette prestation correspond-elle à ma situation ?",
      "Quelles limites de revenu ou de fortune s'appliquent ?",
      "Quel délai vaut à mon domicile ?",
      "Quels justificatifs dois-je fournir ?",
      "Quelle autorité prend la décision ?",
    ],
    sourcesTitle: "POINTS DE DÉPART OFFICIELS",
    sourcesText:
      "ahv-iv.ch\nbsv.admin.ch\nbag.admin.ch\nch.ch\ngdk-cds.ch\n\nConsulte toujours aussi le site de ton canton et de ta commune.",
    finalTitle: "TA PROCHAINE ÉTAPE PERSONNELLE",
    finalText:
      "Prestation choisie : ____________________________\n\nService compétent : ______________________________\n\nDélai : __________________________________________\n\nDocuments manquants : ____________________________\n\nDate de vérification : ____________________________",
    disclaimer:
      "État septembre 2026. Ce guide ne constitue pas un conseil juridique, fiscal ou social. Seules les informations et décisions des autorités compétentes sont contraignantes.",
  },
  it: {
    title: "PRESTAZIONI PUBBLICHE\nSVIZZERA 2026",
    subtitle: "La tua guida pratica e concisa",
    intro:
      "Questa guida ti aiuta a individuare possibili diritti e a trovare l'ufficio ufficiale competente. Non sostituisce una consulenza individuale.",
    howTitle: "COME USARE QUESTA GUIDA",
    howSteps: [
      "Segna i capitoli adatti alla tua situazione.",
      "Verifica le regole del tuo cantone tramite il link ufficiale.",
      "Annota scadenza e documenti necessari.",
      "Fai verificare il diritto dall'ufficio competente.",
    ],
    chapters: [
      ["Assegni familiari", "Per persone che lavorano e hanno figli. Importo, limite d'età e domanda dipendono dalla situazione e in parte dal cantone."],
      ["Riduzione dei premi", "Aiuto cantonale ai premi di cassa malati per nuclei con reddito limitato. Verifica subito le scadenze."],
      ["Prestazioni complementari", "Per chi riceve AVS o AI ma non copre le spese riconosciute. Vengono considerati reddito e patrimonio."],
      ["Rendita AVS 2026", "Panoramica di versamenti, date e 13a rendita AVS. La cassa di compensazione fornisce informazioni vincolanti."],
      ["Contributi all'affitto", "Possono esistere aiuti cantonali o comunali per famiglie e anziani. Non sono uniformi in tutta la Svizzera."],
      ["Deduzioni fiscali", "Figli, assicurazioni, spese professionali e previdenza possono ridurre le imposte. I dettagli variano per cantone."],
      ["FAQ e casi particolari", "Orientamento per scadenze perse, cittadinanza straniera, permesso B o C e doppia cittadinanza."],
    ],
    checkTitle: "IL TUO CONTROLLO PER QUESTO CAPITOLO",
    checklist: [
      "Questa prestazione è adatta alla mia situazione?",
      "Quali limiti di reddito o patrimonio valgono?",
      "Qual è la scadenza nel mio luogo di domicilio?",
      "Quali documenti devo presentare?",
      "Quale autorità prende la decisione?",
    ],
    sourcesTitle: "PUNTI DI PARTENZA UFFICIALI",
    sourcesText:
      "ahv-iv.ch\nbsv.admin.ch\nbag.admin.ch\nch.ch\ngdk-cds.ch\n\nControlla sempre anche il sito del tuo cantone e del tuo comune.",
    finalTitle: "IL TUO PROSSIMO PASSO PERSONALE",
    finalText:
      "Prestazione scelta: _____________________________\n\nUfficio competente: ______________________________\n\nScadenza: ________________________________________\n\nDocumenti mancanti: ______________________________\n\nData del controllo: ______________________________",
    disclaimer:
      "Aggiornato a settembre 2026. Questa guida non è una consulenza legale, fiscale o sociale. Fanno fede solo le informazioni e le decisioni delle autorità competenti.",
  },
};

const languageNames = {
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};

let currentLanguage = getInitialLanguage();

function getInitialLanguage() {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (translations[urlLanguage]) return urlLanguage;

  const storedLanguage = window.localStorage.getItem("ch26-language");
  if (translations[storedLanguage]) return storedLanguage;

  const browserLanguage = navigator.language.slice(0, 2);
  return translations[browserLanguage] ? browserLanguage : "de";
}

function applyLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  const copy = translations[language];
  document.documentElement.lang = language;
  document.title = copy.pageTitle;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", copy.pageDescription);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[key] !== undefined) element.textContent = copy[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (copy[key] !== undefined) element.innerHTML = copy[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (copy[key] !== undefined) element.setAttribute("placeholder", copy[key]);
  });

  document.querySelectorAll(".lang-button").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute(
      "aria-label",
      `${languageNames[button.dataset.lang]}${isActive ? " — active" : ""}`,
    );
  });

  window.localStorage.setItem("ch26-language", language);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState({}, "", url);
}

function setFieldState(field, isValid) {
  field.classList.toggle("has-error", !isValid);
  const error = field.parentElement.querySelector(".field-error");
  error?.classList.toggle("is-visible", !isValid);
}

function validateForm(form) {
  const email = form.elements.email;
  const birthYear = form.elements.birthYear;
  const consent = form.elements.consent;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const birthIsValid = Boolean(birthYear.value);
  const consentIsValid = consent.checked;

  setFieldState(email, emailIsValid);
  setFieldState(birthYear, birthIsValid);
  form
    .querySelector(".consent-error")
    ?.classList.toggle("is-visible", !consentIsValid);
  form.querySelector(".custom-check")?.classList.toggle("has-error", !consentIsValid);

  if (!emailIsValid) email.focus();
  else if (!birthIsValid) birthYear.focus();
  else if (!consentIsValid) consent.focus();

  return emailIsValid && birthIsValid && consentIsValid;
}

function openDialog(dialog) {
  if (!dialog) return;
  dialog.showModal();
  document.body.classList.add("modal-open");
}

function closeDialog(dialog) {
  if (!dialog) return;
  dialog.close();
  document.body.classList.remove("modal-open");
}

function drawPdfHeader(doc, pageNumber, label) {
  doc.setFillColor(19, 37, 34);
  doc.rect(0, 0, 210, 19, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CH / 2026", 16, 12);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), 194, 12, { align: "right" });
  doc.setDrawColor(220, 221, 215);
  doc.line(16, 278, 194, 278);
  doc.setTextColor(95, 101, 98);
  doc.setFontSize(8);
  doc.text(String(pageNumber).padStart(2, "0"), 194, 286, { align: "right" });
}

function addWrappedText(doc, text, x, y, width, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function generateGuide(language) {
  const content = guideData[language];
  const doc = new jsPDF({ format: "a4", unit: "mm" });

  doc.setFillColor(243, 240, 232);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(231, 44, 47);
  doc.rect(0, 0, 210, 14, "F");
  doc.rect(16, 35, 22, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.rect(21, 43, 12, 6, "F");
  doc.rect(24, 40, 6, 12, "F");
  doc.setTextColor(23, 32, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CH / 2026", 194, 49, { align: "right" });
  doc.setFontSize(35);
  const titleLines = content.title.split("\n");
  doc.text(titleLines, 16, 106, { lineHeightFactor: 0.92 });
  doc.setTextColor(231, 44, 47);
  doc.setFontSize(16);
  doc.text(content.subtitle, 16, 145);
  doc.setTextColor(78, 86, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  addWrappedText(doc, content.intro, 16, 172, 132, 7);
  doc.setTextColor(23, 32, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${languageNames[language]} · 18 pages`, 16, 269);

  doc.addPage();
  drawPdfHeader(doc, 2, content.howTitle);
  doc.setTextColor(23, 32, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text(content.howTitle, 16, 47);
  let y = 78;
  content.howSteps.forEach((step, index) => {
    doc.setFillColor(185, 219, 201);
    doc.circle(22, y - 2, 7, "F");
    doc.setTextColor(19, 37, 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(index + 1), 22, y + 1, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    addWrappedText(doc, step, 37, y, 145, 7);
    y += 37;
  });

  content.chapters.forEach(([title, description], chapterIndex) => {
    const overviewPage = 3 + chapterIndex * 2;
    doc.addPage();
    drawPdfHeader(doc, overviewPage, title);
    doc.setTextColor(231, 44, 47);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(String(chapterIndex + 1).padStart(2, "0"), 16, 43);
    doc.setTextColor(23, 32, 30);
    doc.setFontSize(27);
    const wrappedTitle = doc.splitTextToSize(title.toUpperCase(), 166);
    doc.text(wrappedTitle, 16, 61);
    const titleBottom = 61 + wrappedTitle.length * 11;
    doc.setDrawColor(231, 44, 47);
    doc.setLineWidth(1.2);
    doc.line(16, titleBottom + 4, 54, titleBottom + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(78, 86, 83);
    addWrappedText(doc, description, 16, titleBottom + 24, 160, 7);
    doc.setFillColor(243, 240, 232);
    doc.roundedRect(16, 174, 178, 62, 2, 2, "F");
    doc.setTextColor(23, 32, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(content.checkTitle, 26, 193);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(78, 86, 83);
    doc.text(content.checklist[0], 26, 210);
    doc.text(content.checklist[1], 26, 224);

    doc.addPage();
    drawPdfHeader(doc, overviewPage + 1, content.checkTitle);
    doc.setTextColor(23, 32, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text(content.checkTitle, 16, 47);
    y = 73;
    content.checklist.forEach((item) => {
      doc.setDrawColor(160, 167, 163);
      doc.rect(16, y - 5, 7, 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(52, 61, 58);
      const lines = doc.splitTextToSize(item, 153);
      doc.text(lines, 31, y);
      y += Math.max(31, lines.length * 6 + 17);
    });
    doc.setDrawColor(210, 211, 205);
    doc.line(16, 239, 194, 239);
    doc.setTextColor(110, 116, 113);
    doc.setFontSize(9);
    doc.text("Notizen / Notes", 16, 250);
    doc.line(16, 261, 194, 261);
    doc.line(16, 271, 194, 271);
  });

  doc.addPage();
  drawPdfHeader(doc, 17, content.sourcesTitle);
  doc.setTextColor(23, 32, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(content.sourcesTitle, 16, 49);
  doc.setFillColor(185, 219, 201);
  doc.rect(16, 70, 178, 126, "F");
  doc.setTextColor(19, 37, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(content.sourcesText.split("\n"), 28, 91, { lineHeightFactor: 1.65 });
  doc.setTextColor(78, 86, 83);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  addWrappedText(doc, content.disclaimer, 16, 220, 178, 5);

  doc.addPage();
  drawPdfHeader(doc, 18, content.finalTitle);
  doc.setTextColor(23, 32, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const finalTitle = doc.splitTextToSize(content.finalTitle, 178);
  doc.text(finalTitle, 16, 49);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(52, 61, 58);
  doc.text(content.finalText.split("\n"), 16, 91, { lineHeightFactor: 1.65 });
  doc.setFillColor(231, 44, 47);
  doc.rect(16, 224, 178, 31, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CH / 2026", 27, 243);

  doc.save(`CH26-guide-${language}-2026.pdf`);
}

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    window.setTimeout(() => {
      submitButton.disabled = false;
      openDialog(document.querySelector("#success-modal"));
      form.reset();
    }, 420);
  });

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.type === "checkbox") {
        form
          .querySelector(".consent-error")
          ?.classList.toggle("is-visible", !field.checked);
      } else {
        setFieldState(field, field.validity.valid);
      }
    });
  });
});

const legalModal = document.querySelector("#legal-modal");
const modalContent = document.querySelector("#modal-content");

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modalContent.innerHTML = legalContent[currentLanguage][button.dataset.modal];
    openDialog(legalModal);
  });
});

document.querySelectorAll(".modal").forEach((dialog) => {
  dialog.querySelector(".modal-close")?.addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

document.querySelector(".download-guide")?.addEventListener("click", () => {
  generateGuide(currentLanguage);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll("dialog[open]").forEach((dialog) => closeDialog(dialog));
  }
});

applyLanguage(currentLanguage);
