const CH_TRANSLATIONS = {
  de: {
    meta: {
      title: "Auszahlungen – Staatliche Leistungen in der Schweiz 2026",
      description: "Familienzulagen, Prämienverbilligung, Ergänzungsleistungen und mehr – kostenloser Leitfaden für die Schweiz 2026.",
    },
    header: {
      logo: "Schweiz zahlt",
    },
    hero: {
      badge: "Auszahlungen",
      title: "Staatliche Leistungen in der Schweiz 2026: Was steht dir zu?",
      subtitle: "Die Schweiz zahlt. Ständig. Aber viele wissen nicht, was ihnen zusteht. Familienzulagen, Prämienverbilligung, Ergänzungsleistungen zur Rente, Mietzinsbeiträge – der Staat gibt Geld zurück, wenn du weisst, wo du suchen musst. Lade den kostenlosen Leitfaden herunter und finde in 2 Minuten heraus, was dir zusteht.",
      downloadTitle: "📄 Leitfaden kostenlos herunterladen",
      downloadText: "Programm sofort verfügbar. Keine Registrierung, kein E-Mail nötig.",
      downloadBtn: "Leitfaden kostenlos herunterladen",
      downloadNote: "Die Datei wird direkt auf dein Gerät heruntergeladen.",
      downloadFile: "downloads/leitfaden-de.exe",
    },
    pain: {
      title: "Geld liegt auf Konten. Du hast nur keinen Antrag gestellt.",
      items: [
        {
          question: "Ich zahle 300+ CHF Krankenkasse pro Monat. Ist das normal?",
          answer: "Das kann je nach Alter, Wohnort, Versicherung und Franchise unterschiedlich sein. Liegt dein Einkommen unter einer bestimmten Schwelle, kannst du unter bestimmten Voraussetzungen eine Prämienverbilligung erhalten. In Basel-Landschaft beträgt die Richtprämie für Erwachsene CHF 4'596 pro Jahr. Wie hoch die Prämienverbilligung ausfällt, hängt von den persönlichen und kantonalen Voraussetzungen ab.",
        },
        {
          question: "Ich habe zwei Kinder. Zahlt der Staat etwas?",
          answer: "Ja. Kinderzulage – je nach Kanton mindestens CHF 215 pro Monat, teilweise mehr, pro Kind bis 16 Jahre. Ausbildungszulage – mindestens CHF 268 pro Monat während einer anerkannten Ausbildung. In Zürich gelten je nach Alter und Art der Zulage unterschiedliche Beträge.",
        },
        {
          question: "Ich bin pensioniert. Die Rente reicht nicht zum Leben.",
          answer: "Ergänzungsleistungen (EL) – Leistung zur Deckung der anerkannten Lebens- und Wohnkosten, wenn Einkommen und Vermögen dafür nicht ausreichen. CHF 20'670 pro Jahr für Alleinstehende, CHF 31'005 für Paare. Die anerkannten Mietkosten werden bei der Berechnung der EL berücksichtigt; dabei gelten gesetzliche Mietzinsmaxima.",
        },
      ],
    },
    guide: {
      title: "Was du im Leitfaden findest",
      items: [
        { title: "Familienzulagen", text: "Wie viel in deinem Kanton gezahlt wird, ab welchem Alter, bis wann, wie man den Antrag stellt" },
        { title: "Prämienverbilligung", text: "Wie du einen Teil der Krankenkasse zurückbekommst (Fristen sind je nach Kanton unterschiedlich)" },
        { title: "Ergänzungsleistungen", text: "Zuschuss zur AHV/IV, wer Anspruch hat, maximale Beträge, Vermögensgrenze" },
        { title: "AHV-Rente", text: "Genaue Auszahlungstermine 2026 (erste Arbeitstage des Monats). Im Dezember 2026 wird zusätzlich die 13. AHV-Altersrente ausbezahlt." },
        { title: "Mietzinsbeiträge", text: "Mietzuschuss für Familien und Rentner – in welchen Kantonen und wie viel" },
        { title: "Steuerabzüge", text: "Welche Abzüge deine Steuerlast senken (Kinder, Krankenkasse, Pensionsbeiträge)" },
        { title: "FAQ", text: "Was tun bei verpasster Frist? Was gilt für Ausländer? Was gilt bei doppelter Staatsbürgerschaft?" },
      ],
    },
    cta: {
      title: "Hol dir den Leitfaden jetzt",
      subtitle: "Kostenlos – sofort herunterladen.",
      downloadBtn: "🟩 Leitfaden kostenlos herunterladen",
      note: "Keine Registrierung erforderlich.",
    },
    sources: {
      title: "Woher stammen die Daten",
      text: "Der Leitfaden basiert auf offenen Quellen: Bundesamt für Sozialversicherungen (BSV), kantonale Ausgleichskassen, Konferenz der kantonalen Gesundheitsdirektorinnen und -direktoren (GDK), offizielle Publikationen von PwC und OECD. Wir sind keine Anwaltskanzlei – der Leitfaden dient als «Navigator» durch offizielle Verfahren.",
      impressum: "Impressum",
      privacy: "Datenschutzerklärung",
      officialSources: "Offizielle Quellen:",
    },
    faq: {
      title: "FAQ – Einwände ausräumen",
      items: [
        {
          question: "Steht mir wirklich etwas zu?",
          answer: "Wenn du mehr als 7–12 % deines Einkommens für die Krankenkasse zahlst – ja, gibt es Prämienverbilligung. Hast du Kinder – Familienzulagen werden fast allen Erwerbstätigen gezahlt. Bist du Rentner mit niedriger Rente – EL.",
        },
        {
          question: "Ich bin Ausländer. Gilt das auch für mich?",
          answer: "Ja, mit Niederlassungsbewilligung (C-Ausweis) hast du die gleichen Rechte wie Schweizer. Mit B-Ausweis gelten Fristbeschränkungen.",
        },
        {
          question: "Wie viel wird pro Kind gezahlt?",
          answer: "Je nach Kanton mindestens CHF 215 pro Monat bis 16 Jahre, teilweise mehr. Während anerkannter Ausbildung mindestens CHF 268 pro Monat (16–25 Jahre). In manchen Kantonen gelten höhere Beträge – z. B. Zürich, Solothurn, St. Gallen.",
        },
        {
          question: "Was sind EL und wer braucht sie?",
          answer: "Ergänzungsleistungen – Zuschuss, wenn AHV/IV-Renten die Mindestausgaben nicht decken. Vermögensgrenze: CHF 100'000 für Alleinstehende, CHF 200'000 für Paare. Umfasst Existenzminimum + Miete + Krankenkasse.",
        },
        {
          question: "Wann kommen AHV-Auszahlungen?",
          answer: "Renten werden zu Monatsbeginn für den laufenden Monat (im Voraus) ausbezahlt. Genaue Termine: 5. Januar, 2. Februar, 2. März usw. Im Dezember 2026 wird zusätzlich die 13. AHV-Altersrente ausbezahlt.",
        },
        {
          question: "Ich habe die Frist für Prämienverbilligung verpasst. Kann ich die Leistung noch beantragen?",
          answer: "In den meisten Kantonen – ja, für das laufende Jahr. Aber den Antrag fürs nächste Jahr kannst du rechtzeitig stellen. Im Kanton St. Gallen kommt das Formular automatisch bis 10. Januar.",
        },
      ],
    },
    urgency: {
      title: "Geld wartet nicht. Fristen auch nicht.",
      text: "Prämienverbilligung – je nach Kanton unterschiedliche Fristen. Familienzulagen – ab dem Geburtsmonat des Kindes. EL – ab dem Zeitpunkt, an dem die Rente die Ausgaben nicht mehr deckt. Lade den Leitfaden herunter – prüfe, was dir möglicherweise zusteht.",
      cta: "📄 Leitfaden kostenlos herunterladen",
    },
    footer: {
      impressumTitle: "Impressum",
      impressumText: "Schweiz zahlt GmbH<br>Musterstrasse 1<br>8000 Zürich<br>Schweiz<br>Web: benefitseurope.com<br>E-Mail: info@benefitseurope.com",
      privacyTitle: "Datenschutzerklärung",
      privacyText: "Diese Website erhebt keine personenbezogenen Daten über Formulare. Der Leitfaden kann ohne Registrierung heruntergeladen werden. Bei aktivierter Analyse können anonyme Nutzungsdaten über Cookies verarbeitet werden (nur mit Einwilligung). Kontakt: info@benefitseurope.com.",
      sourcesTitle: "Quellen",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 Schweiz zahlt. Alle Rechte vorbehalten.",
    },
    cookie: {
      text: "Wir verwenden Cookies für die Analyse des Website-Traffics. Du kannst zustimmen oder ablehnen.",
      accept: "Akzeptieren",
      decline: "Ablehnen",
    },
  },

  fr: {
    meta: {
      title: "Prestations – Allocations de l'État en Suisse 2026",
      description: "Allocations familiales, réduction des primes, prestations complémentaires et plus – guide gratuit pour la Suisse 2026.",
    },
    header: {
      logo: "La Suisse paie",
    },
    hero: {
      badge: "Prestations",
      title: "Allocations de l'État en Suisse 2026 : à quoi avez-vous droit ?",
      subtitle: "La Suisse paie. En permanence. Mais beaucoup ignorent ce qui leur est dû. Allocations familiales, réduction des primes, prestations complémentaires à la retraite, subventions au loyer – l'État vous rend de l'argent si vous savez où chercher. Téléchargez le guide gratuit et découvrez en 2 minutes ce qui vous est dû.",
      downloadTitle: "📄 Télécharger le guide gratuitement",
      downloadText: "Programme disponible immédiatement. Pas d'inscription, pas d'e-mail requis.",
      downloadBtn: "Télécharger le guide gratuitement",
      downloadNote: "Le fichier est téléchargé directement sur votre appareil.",
      downloadFile: "downloads/guide-fr.exe",
    },
    pain: {
      title: "L'argent est sur les comptes. Vous n'avez simplement pas fait de demande.",
      items: [
        {
          question: "Je paie 300+ CHF d'assurance maladie par mois. C'est normal ?",
          answer: "Cela peut varier selon l'âge, le lieu de résidence, l'assurance et la franchise. Si vos revenus sont inférieurs à un certain seuil, vous pouvez obtenir une réduction des primes sous certaines conditions. À Bâle-Campagne, la prime de référence pour les adultes est de CHF 4'596 par an. Le montant de la réduction dépend des conditions personnelles et cantonales.",
        },
        {
          question: "J'ai deux enfants. L'État paie quelque chose ?",
          answer: "Oui. Allocation pour enfant – selon le canton, minimum CHF 215 par mois, parfois plus, par enfant jusqu'à 16 ans. Allocation de formation – minimum CHF 268 par mois pendant une formation reconnue. À Zurich, les montants varient selon l'âge et le type d'allocation.",
        },
        {
          question: "Je suis retraité. Ma rente ne suffit pas pour vivre.",
          answer: "Prestations complémentaires (PC) – prestation pour couvrir les coûts de vie et de logement reconnus, lorsque revenus et fortune ne suffisent pas. CHF 20'670 par an pour les personnes seules, CHF 31'005 pour les couples. Les loyers reconnus sont pris en compte dans le calcul des PC, avec des plafonds légaux.",
        },
      ],
    },
    guide: {
      title: "Ce que vous trouverez dans le guide",
      items: [
        { title: "Allocations familiales", text: "Combien est payé dans votre canton, à partir de quel âge, jusqu'à quand, comment déposer une demande" },
        { title: "Réduction des primes", text: "Comment récupérer une partie de l'assurance maladie (les délais varient selon le canton)" },
        { title: "Prestations complémentaires", text: "Supplément à l'AVS/AI, qui a droit, montants maximums, seuil de fortune" },
        { title: "Rente AVS", text: "Dates exactes de paiement en 2026 (premiers jours ouvrables du mois). En décembre 2026, la 13e rente AVS sera versée en plus." },
        { title: "Contributions au loyer", text: "Subvention au loyer pour les familles et retraités – dans quels cantons et combien" },
        { title: "Déductions fiscales", text: "Quelles déductions réduisent votre charge fiscale (enfants, assurance, cotisations de prévoyance)" },
        { title: "FAQ", text: "Que faire si vous avez manqué le délai ? Et pour les étrangers ? Qu'en est-il de la double nationalité ?" },
      ],
    },
    cta: {
      title: "Obtenez le guide maintenant",
      subtitle: "Gratuit – téléchargement immédiat.",
      downloadBtn: "🟩 Télécharger le guide gratuitement",
      note: "Aucune inscription requise.",
    },
    sources: {
      title: "D'où viennent les données",
      text: "Le guide est basé sur des sources ouvertes : Office fédéral des assurances sociales (OFAS), caisses de compensation cantonales, Conférence suisse des directrices et directeurs cantonaux de la santé publique (CDS), publications officielles de PwC et de l'OCDE. Nous ne sommes pas un cabinet d'avocats – le guide sert de « navigateur » dans les procédures officielles.",
      impressum: "Mentions légales",
      privacy: "Politique de confidentialité",
      officialSources: "Sources officielles :",
    },
    faq: {
      title: "FAQ – Lever les objections",
      items: [
        {
          question: "Ai-je vraiment droit à quelque chose ?",
          answer: "Si vous payez plus de 7–12 % de vos revenus pour l'assurance maladie – oui, il y a la réduction des primes. Si vous avez des enfants – les allocations familiales sont versées à presque tous les actifs. Si vous êtes retraité avec une faible rente – PC.",
        },
        {
          question: "Je suis étranger. Est-ce que ça s'applique aussi à moi ?",
          answer: "Oui, avec un permis d'établissement (permis C), vous avez les mêmes droits que les Suisses. Avec le permis B, des restrictions de délai s'appliquent.",
        },
        {
          question: "Combien est versé par enfant ?",
          answer: "Selon le canton, minimum CHF 215/mois jusqu'à 16 ans, parfois plus. Pendant une formation reconnue, minimum CHF 268/mois (16–25 ans). Dans certains cantons, montants plus élevés – p. ex. Zurich, Soleure, Saint-Gall.",
        },
        {
          question: "Que sont les PC et qui en a besoin ?",
          answer: "Prestations complémentaires – supplément si les rentes AVS/AI ne couvrent pas les dépenses minimales. Seuil de fortune : CHF 100'000 pour les personnes seules, CHF 200'000 pour les couples. Comprend le minimum vital + loyer + assurance.",
        },
        {
          question: "Quand arrivent les paiements AVS ?",
          answer: "Les rentes sont versées en début de mois, pour le mois en cours (à l'avance). Dates exactes : 5 janvier, 2 février, 2 mars, etc. En décembre 2026, la 13e rente AVS sera versée en plus.",
        },
        {
          question: "J'ai manqué le délai pour la réduction des primes. Puis-je encore faire une demande ?",
          answer: "Dans la plupart des cantons – oui, pour l'année en cours. Mais la demande pour l'année suivante peut être déposée à temps. Dans le canton de Saint-Gall, le formulaire arrive automatiquement avant le 10 janvier.",
        },
      ],
    },
    urgency: {
      title: "L'argent n'attend pas. Les délais non plus.",
      text: "Réduction des primes – délais variables selon le canton. Allocations familiales – dès le mois de naissance de l'enfant. PC – dès le moment où la rente ne couvre plus les dépenses. Téléchargez le guide – vérifiez ce qui pourrait vous être dû.",
      cta: "📄 Télécharger le guide gratuitement",
    },
    footer: {
      impressumTitle: "Mentions légales",
      impressumText: "La Suisse paie SA<br>Rue Exemple 1<br>8000 Zurich<br>Suisse<br>Web : benefitseurope.com<br>E-mail : info@benefitseurope.com",
      privacyTitle: "Politique de confidentialité",
      privacyText: "Ce site ne collecte pas de données personnelles via des formulaires. Le guide peut être téléchargé sans inscription. Si l'analyse est activée, des données d'utilisation anonymes peuvent être traitées via des cookies (uniquement avec consentement). Contact : info@benefitseurope.com.",
      sourcesTitle: "Sources",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 La Suisse paie. Tous droits réservés.",
    },
    cookie: {
      text: "Nous utilisons des cookies pour analyser le trafic du site. Vous pouvez accepter ou refuser.",
      accept: "Accepter",
      decline: "Refuser",
    },
  },

  it: {
    meta: {
      title: "Prestazioni – Pagamenti statali in Svizzera 2026",
      description: "Assegni familiari, riduzione premi, prestazioni complementari e altro – guida gratuita per la Svizzera 2026.",
    },
    header: {
      logo: "La Svizzera paga",
    },
    hero: {
      badge: "Prestazioni",
      title: "Pagamenti statali in Svizzera 2026: a cosa hai diritto?",
      subtitle: "La Svizzera paga. Sempre. Ma molti non sanno cosa spetta loro. Assegni familiari, riduzione dei premi, integrazioni alla pensione, contributi all'affitto – lo Stato restituisce denaro se sai dove guardare. Scarica la guida gratuita e scopri in 2 minuti cosa ti spetta.",
      downloadTitle: "📄 Scarica la guida gratuitamente",
      downloadText: "Programma disponibile subito. Nessuna registrazione, nessuna e-mail richiesta.",
      downloadBtn: "Scarica la guida gratuitamente",
      downloadNote: "Il file viene scaricato direttamente sul tuo dispositivo.",
      downloadFile: "downloads/guida-it.exe",
    },
    pain: {
      title: "I soldi sono sui conti. Non hai semplicemente presentato la domanda.",
      items: [
        {
          question: "Pago 300+ CHF di assicurazione malattia al mese. È normale?",
          answer: "Può variare in base a età, luogo di domicilio, assicurazione e franchigia. Se il reddito è inferiore a una certa soglia, puoi ottenere una riduzione dei premi sotto determinate condizioni. A Basilea Campagna, il premio di riferimento per gli adulti è CHF 4'596 all'anno. L'importo della riduzione dipende dalle condizioni personali e cantonali.",
        },
        {
          question: "Ho due figli. Lo Stato paga qualcosa?",
          answer: "Sì. Assegno per figlio – a seconda del cantone, minimo CHF 215 al mese, talvolta di più, per figlio fino a 16 anni. Assegno di formazione – minimo CHF 268 al mese durante una formazione riconosciuta. A Zurigo gli importi variano in base all'età e al tipo di assegno.",
        },
        {
          question: "Sono pensionato. La rendita non basta per vivere.",
          answer: "Prestazioni complementari (PC) – prestazione per coprire i costi di vita e di alloggio riconosciuti, quando reddito e patrimonio non bastano. CHF 20'670 all'anno per single, CHF 31'005 per coppie. I costi di affitto riconosciuti sono considerati nel calcolo delle PC, con massimali legali.",
        },
      ],
    },
    guide: {
      title: "Cosa troverai nella guida",
      items: [
        { title: "Assegni familiari", text: "Quanto viene pagato nel tuo cantone, da quale età, fino a quando, come presentare la domanda" },
        { title: "Riduzione dei premi", text: "Come recuperare parte dell'assicurazione malattia (le scadenze variano a seconda del cantone)" },
        { title: "Prestazioni complementari", text: "Integrazione AVS/AI, chi ha diritto, importi massimi, limite patrimoniale" },
        { title: "Rendita AVS", text: "Date esatte dei pagamenti nel 2026 (primi giorni lavorativi del mese). A dicembre 2026 verrà pagata in più la 13a rendita AVS." },
        { title: "Contributi all'affitto", text: "Sussidio all'affitto per famiglie e pensionati – in quali cantoni e quanto" },
        { title: "Deduzioni fiscali", text: "Quali deduzioni riducono il tuo carico fiscale (figli, assicurazione, contributi previdenziali)" },
        { title: "FAQ", text: "Cosa fare se hai perso la scadenza? E per gli stranieri? Cosa vale per la doppia cittadinanza?" },
      ],
    },
    cta: {
      title: "Ottieni la guida adesso",
      subtitle: "Gratis – download immediato.",
      downloadBtn: "🟩 Scarica la guida gratuitamente",
      note: "Nessuna registrazione richiesta.",
    },
    sources: {
      title: "Da dove provengono i dati",
      text: "La guida è basata su fonti aperte: Ufficio federale delle assicurazioni sociali (UFAS), casse di compensazione cantonali, Conferenza dei direttori cantonali della sanità (CDS), pubblicazioni ufficiali di PwC e OCSE. Non siamo uno studio legale – la guida funge da «navigatore» tra le procedure ufficiali.",
      impressum: "Impressum",
      privacy: "Informativa sulla privacy",
      officialSources: "Fonti ufficiali:",
    },
    faq: {
      title: "FAQ – Rispondere alle obiezioni",
      items: [
        {
          question: "Mi spetta davvero qualcosa?",
          answer: "Se paghi più del 7–12 % del reddito per l'assicurazione malattia – sì, c'è la riduzione dei premi. Se hai figli – gli assegni familiari vengono pagati quasi a tutti i lavoratori. Se sei pensionato con una rendita bassa – PC.",
        },
        {
          question: "Sono straniero. Vale anche per me?",
          answer: "Sì, con permesso di domicilio (permesso C) hai gli stessi diritti degli svizzeri. Con permesso B si applicano limitazioni temporali.",
        },
        {
          question: "Quanto viene pagato per figlio?",
          answer: "A seconda del cantone, minimo CHF 215/mese fino a 16 anni, talvolta di più. Durante una formazione riconosciuta, minimo CHF 268/mese (16–25 anni). In alcuni cantoni importi più alti – es. Zurigo, Soleura, San Gallo.",
        },
        {
          question: "Cosa sono le PC e chi ne ha bisogno?",
          answer: "Prestazioni complementari – integrazione se le rendite AVS/AI non coprono le spese minime. Limite patrimoniale: CHF 100'000 per single, CHF 200'000 per coppie. Include minimo vitale + affitto + assicurazione.",
        },
        {
          question: "Quando arrivano i pagamenti AVS?",
          answer: "Le pensioni vengono pagate all'inizio del mese, per il mese in corso (anticipatamente). Date esatte: 5 gennaio, 2 febbraio, 2 marzo, ecc. A dicembre 2026 verrà pagata in più la 13a rendita AVS.",
        },
        {
          question: "Ho perso la scadenza per la riduzione dei premi. Posso ancora fare domanda?",
          answer: "Nella maggior parte dei cantoni – sì, per l'anno in corso. Ma la domanda per l'anno successivo può essere presentata in tempo. Nel cantone San Gallo il modulo arriva automaticamente entro il 10 gennaio.",
        },
      ],
    },
    urgency: {
      title: "I soldi non aspettano. Nemmeno le scadenze.",
      text: "Riduzione dei premi – scadenze diverse a seconda del cantone. Assegni familiari – dal mese di nascita del figlio. PC – dal momento in cui la rendita non copre più le spese. Scarica la guida – verifica cosa potrebbe spettarti.",
      cta: "📄 Scarica la guida gratuitamente",
    },
    footer: {
      impressumTitle: "Impressum",
      impressumText: "La Svizzera paga SA<br>Via Esempio 1<br>8000 Zurigo<br>Svizzera<br>Web: benefitseurope.com<br>E-mail: info@benefitseurope.com",
      privacyTitle: "Informativa sulla privacy",
      privacyText: "Questo sito non raccoglie dati personali tramite moduli. La guida può essere scaricata senza registrazione. Se l'analisi è attiva, dati di utilizzo anonimi possono essere trattati tramite cookie (solo con consenso). Contatto: info@benefitseurope.com.",
      sourcesTitle: "Fonti",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 La Svizzera paga. Tutti diritti riservati.",
    },
    cookie: {
      text: "Utilizziamo cookie per analizzare il traffico del sito. Puoi accettare o rifiutare.",
      accept: "Accettare",
      decline: "Rifiutare",
    },
  },
};
