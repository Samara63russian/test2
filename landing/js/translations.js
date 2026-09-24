const translations = {
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
      subtitle: "Die Schweiz zahlt. Ständig. Aber viele wissen nicht, was ihnen zusteht. Familienzulagen, Prämienrückerstattung, Ergänzungsleistungen zur Rente, Mietzinsbeiträge – der Staat gibt Geld zurück, wenn man weiss, wo man suchen muss. Lade den kostenlosen Leitfaden herunter und finde es in 2 Minuten heraus.",
      formTitle: "📄 Leitfaden kostenlos herunterladen",
      email: "E-Mail",
      emailPlaceholder: "deine@email.ch",
      birthYear: "Geburtsjahr",
      birthYearPlaceholder: "Bitte wählen",
      birthYears: {
        "2007": "2007",
        "2008": "2008",
        "2009": "2009",
        earlier: "Früher",
        later: "Später",
      },
      consent: 'Ich stimme der Datenverarbeitung gemäss der <a href="#" data-modal="privacy">Datenschutzerklärung</a> zu.',
      submit: "Leitfaden kostenlos herunterladen",
      formNote: "Daten werden nur zum Versand des PDF und für Updates zu Sozialleistungen verwendet.",
      successTitle: "Leitfaden ist unterwegs!",
      successText: "Prüfe dein Postfach – das PDF kommt in wenigen Minuten.",
    },
    pain: {
      title: "Geld liegt auf Konten. Du hast nur keinen Antrag gestellt.",
      items: [
        {
          question: "Ich zahle 300+ CHF Krankenkasse pro Monat. Ist das normal?",
          answer: "Nein. Liegt dein Einkommen unter einer bestimmten Schwelle, erstattet der Kanton einen Teil. In Basel-Landschaft beträgt die Richtprämie für Erwachsene CHF 4'596 pro Jahr. Die Differenz wird zurückerstattet.",
        },
        {
          question: "Ich habe zwei Kinder. Zahlt der Staat etwas?",
          answer: "Ja. Kinderzulage – mindestens CHF 215–245 pro Monat pro Kind bis 16 Jahre, Ausbildungszulage – CHF 268–298 nach dem 16. Lebensjahr. In Zürich sind es CHF 3'216 pro Jahr pro Kind.",
        },
        {
          question: "Ich bin pensioniert. Die Rente reicht nicht zum Leben.",
          answer: "Ergänzungsleistungen (EL) – Zuschuss bis zum Existenzminimum. CHF 20'670 pro Jahr für Alleinstehende, CHF 31'005 für Paare. Plus separate Mietzuschüsse – bis CHF 18'300 für Alleinstehende.",
        },
      ],
    },
    guide: {
      title: "Was du im Leitfaden findest",
      items: [
        { title: "Familienzulagen", text: "Wie viel in deinem Kanton gezahlt wird, ab welchem Alter, bis wann, wie man den Antrag stellt" },
        { title: "Prämienverbilligung", text: "Wie du einen Teil der Krankenkasse zurückbekommst (im Kanton SG Antrag bis 31. Mai 2026 einreichen)" },
        { title: "Ergänzungsleistungen", text: "Zuschuss zur AHV/IV, wer Anspruch hat, maximale Beträge, Vermögensgrenze" },
        { title: "AHV-Rente", text: "Genaue Auszahlungstermine 2026 (erste Arbeitstage des Monats)" },
        { title: "Mietzinsbeiträge", text: "Mietzuschuss für Familien und Rentner – in welchen Kantonen und wie viel" },
        { title: "Steuerabzüge", text: "Welche Abzüge die Steuer senken (Kinder, Krankenkasse, Pensionsbeiträge)" },
        { title: "FAQ", text: "Was tun bei verpasster Frist? Was gilt für Ausländer? Was bei doppelter Staatsbürgerschaft?" },
      ],
    },
    cta: {
      title: "Hol dir den Leitfaden jetzt",
      subtitle: "Gib deine E-Mail ein – das PDF kommt sofort. Kein Spam. Abmeldung mit einem Klick.",
      submit: "🟩 Leitfaden kostenlos erhalten",
      note: "Daten werden nur zum Versand des PDF und für Updates zu Sozialleistungen verwendet. Keine Weitergabe an Dritte. Löschung auf Anfrage (DSGVO / Schweizer DSG).",
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
          answer: "Gesetzliches Minimum: CHF 215–245/Monat bis 16 Jahre, CHF 268–298/Monat in Ausbildung 16–25 Jahre. In manchen Kantonen mehr – Zürich, Solothurn, St. Gallen.",
        },
        {
          question: "Was sind EL und wer braucht sie?",
          answer: "Ergänzungsleistungen – Zuschuss, wenn AHV/IV-Renten die Mindestausgaben nicht decken. Vermögensgrenze: CHF 100'000 für Alleinstehende, CHF 200'000 für Paare. Umfasst Existenzminimum + Miete + Krankenkasse.",
        },
        {
          question: "Wann kommen AHV-Auszahlungen?",
          answer: "Renten werden zu Monatsbeginn für den laufenden Monat (im Voraus) ausbezahlt. Genaue Termine: 5. Januar, 2. Februar, 2. März usw. 13. Monatsrente – zusammen mit der Dezemberrente.",
        },
        {
          question: "Ich habe die Frist für Prämienverbilligung verpasst. Alles verloren?",
          answer: "In den meisten Kantonen – ja, für das laufende Jahr. Aber den Antrag fürs nächste Jahr kannst du rechtzeitig stellen. Im Kanton St. Gallen kommt das Formular automatisch bis 10. Januar.",
        },
      ],
    },
    urgency: {
      title: "Geld wartet nicht. Fristen auch nicht.",
      text: "Prämienverbilligung – bis 31. Mai. Familienzulagen – ab Geburt des Kindes. EL – ab dem Moment, wenn die Rente die Ausgaben nicht mehr deckt. Lade den Leitfaden herunter – prüfe, was du verpasst.",
      cta: "📄 Leitfaden kostenlos herunterladen",
    },
    footer: {
      impressumTitle: "Impressum",
      impressumText: "Schweiz zahlt GmbH<br>Musterstrasse 1<br>8000 Zürich<br>Schweiz<br>E-Mail: info@schweiz-zahlt.ch",
      privacyTitle: "Datenschutzerklärung",
      privacyText: "Wir verarbeiten deine E-Mail-Adresse und dein Geburtsjahr ausschliesslich zum Versand des Leitfadens und für Updates zu Sozialleistungen. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO / Art. 31 DSG). Du kannst deine Einwilligung jederzeit widerrufen. Daten werden nicht an Dritte weitergegeben. Löschung auf Anfrage an info@schweiz-zahlt.ch.",
      sourcesTitle: "Quellen",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 Schweiz zahlt. Alle Rechte vorbehalten.",
    },
    cookie: {
      text: "Wir verwenden Cookies für die Analyse des Website-Traffics. Du kannst zustimmen oder ablehnen.",
      accept: "Akzeptieren",
      decline: "Ablehnen",
    },
    validation: {
      emailRequired: "Bitte gib deine E-Mail-Adresse ein.",
      emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
      birthYearRequired: "Bitte wähle dein Geburtsjahr.",
      consentRequired: "Bitte stimme der Datenschutzerklärung zu.",
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
      subtitle: "La Suisse paie. En permanence. Mais beaucoup ignorent ce qui leur est dû. Allocations familiales, remboursement d'assurance, prestations complémentaires à la retraite, subventions au loyer – l'État vous rend de l'argent si vous savez où chercher. Téléchargez le guide gratuit et découvrez-le en 2 minutes.",
      formTitle: "📄 Télécharger le guide gratuitement",
      email: "E-mail",
      emailPlaceholder: "votre@email.ch",
      birthYear: "Année de naissance",
      birthYearPlaceholder: "Veuillez choisir",
      birthYears: {
        "2007": "2007",
        "2008": "2008",
        "2009": "2009",
        earlier: "Avant",
        later: "Après",
      },
      consent: 'J\'accepte le traitement des données conformément à la <a href="#" data-modal="privacy">politique de confidentialité</a>.',
      submit: "Télécharger le guide gratuitement",
      formNote: "Les données sont utilisées uniquement pour l'envoi du PDF et les mises à jour sur les prestations sociales.",
      successTitle: "Le guide est en route !",
      successText: "Vérifiez votre boîte mail – le PDF arrive dans quelques minutes.",
    },
    pain: {
      title: "L'argent est sur les comptes. Vous n'avez simplement pas fait de demande.",
      items: [
        {
          question: "Je paie 300+ CHF d'assurance maladie par mois. C'est normal ?",
          answer: "Non. Si vos revenus sont inférieurs à un certain seuil, le canton rembourse une partie. À Bâle-Campagne, la prime de référence pour les adultes est de CHF 4'596 par an. La différence est remboursée.",
        },
        {
          question: "J'ai deux enfants. L'État paie quelque chose ?",
          answer: "Oui. Allocation pour enfant – minimum CHF 215–245 par mois par enfant jusqu'à 16 ans, allocation de formation – CHF 268–298 après 16 ans. À Zurich, c'est CHF 3'216 par an et par enfant.",
        },
        {
          question: "Je suis retraité. Ma rente ne suffit pas pour vivre.",
          answer: "Prestations complémentaires (PC) – supplément jusqu'au minimum vital. CHF 20'670 par an pour les personnes seules, CHF 31'005 pour les couples. Plus une allocation de loyer séparée – jusqu'à CHF 18'300 pour les personnes seules.",
        },
      ],
    },
    guide: {
      title: "Ce que vous trouverez dans le guide",
      items: [
        { title: "Allocations familiales", text: "Combien est payé dans votre canton, à partir de quel âge, jusqu'à quand, comment déposer une demande" },
        { title: "Réduction des primes", text: "Comment récupérer une partie de l'assurance maladie (dans le canton SG, demande à déposer avant le 31 mai 2026)" },
        { title: "Prestations complémentaires", text: "Supplément à l'AVS/AI, qui a droit, montants maximums, seuil de fortune" },
        { title: "Rente AVS", text: "Dates exactes de paiement en 2026 (premiers jours ouvrables du mois)" },
        { title: "Contributions au loyer", text: "Subvention au loyer pour les familles et retraités – dans quels cantons et combien" },
        { title: "Déductions fiscales", text: "Quelles déductions réduisent l'impôt (enfants, assurance, cotisations de prévoyance)" },
        { title: "FAQ", text: "Que faire si vous avez manqué le délai ? Et pour les étrangers ? Et la double nationalité ?" },
      ],
    },
    cta: {
      title: "Obtenez le guide maintenant",
      subtitle: "Entrez votre e-mail – le PDF arrive instantanément. Pas de spam. Désinscription en un clic.",
      submit: "🟩 Obtenir le guide gratuitement",
      note: "Les données sont utilisées uniquement pour l'envoi du PDF et les mises à jour sur les prestations sociales. Pas de transmission à des tiers. Suppression sur demande (RGPD / LPD suisse).",
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
          answer: "Minimum légal : CHF 215–245/mois jusqu'à 16 ans, CHF 268–298/mois en formation de 16 à 25 ans. Dans certains cantons plus – Zurich, Soleure, Saint-Gall.",
        },
        {
          question: "Que sont les PC et qui en a besoin ?",
          answer: "Prestations complémentaires – supplément si les rentes AVS/AI ne couvrent pas les dépenses minimales. Seuil de fortune : CHF 100'000 pour les personnes seules, CHF 200'000 pour les couples. Comprend le minimum vital + loyer + assurance.",
        },
        {
          question: "Quand arrivent les paiements AVS ?",
          answer: "Les rentes sont versées en début de mois, pour le mois en cours (à l'avance). Dates exactes : 5 janvier, 2 février, 2 mars, etc. 13e rente – avec la rente de décembre.",
        },
        {
          question: "J'ai manqué le délai pour la réduction des primes. C'est fini ?",
          answer: "Dans la plupart des cantons – oui, pour l'année en cours. Mais la demande pour l'année suivante peut être déposée à temps. Dans le canton de Saint-Gall, le formulaire arrive automatiquement avant le 10 janvier.",
        },
      ],
    },
    urgency: {
      title: "L'argent n'attend pas. Les délais non plus.",
      text: "Réduction des primes – jusqu'au 31 mai. Allocations familiales – dès la naissance de l'enfant. PC – dès que la rente ne couvre plus les dépenses. Téléchargez le guide – vérifiez ce que vous manquez.",
      cta: "📄 Télécharger le guide gratuitement",
    },
    footer: {
      impressumTitle: "Mentions légales",
      impressumText: "La Suisse paie SA<br>Rue Exemple 1<br>8000 Zurich<br>Suisse<br>E-mail : info@la-suisse-paie.ch",
      privacyTitle: "Politique de confidentialité",
      privacyText: "Nous traitons votre adresse e-mail et votre année de naissance exclusivement pour l'envoi du guide et les mises à jour sur les prestations sociales. Base juridique : consentement (art. 6 al. 1 let. a RGPD / art. 31 LPD). Vous pouvez retirer votre consentement à tout moment. Les données ne sont pas transmises à des tiers. Suppression sur demande à info@la-suisse-paie.ch.",
      sourcesTitle: "Sources",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 La Suisse paie. Tous droits réservés.",
    },
    cookie: {
      text: "Nous utilisons des cookies pour analyser le trafic du site. Vous pouvez accepter ou refuser.",
      accept: "Accepter",
      decline: "Refuser",
    },
    validation: {
      emailRequired: "Veuillez entrer votre adresse e-mail.",
      emailInvalid: "Veuillez entrer une adresse e-mail valide.",
      birthYearRequired: "Veuillez choisir votre année de naissance.",
      consentRequired: "Veuillez accepter la politique de confidentialité.",
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
      subtitle: "La Svizzera paga. Sempre. Ma molti non sanno cosa spetta loro. Assegni familiari, rimborso assicurazione, integrazioni alla pensione, contributi all'affitto – lo Stato restituisce denaro se sai dove guardare. Scarica la guida gratuita e scopri in 2 minuti.",
      formTitle: "📄 Scarica la guida gratuitamente",
      email: "E-mail",
      emailPlaceholder: "tua@email.ch",
      birthYear: "Anno di nascita",
      birthYearPlaceholder: "Seleziona",
      birthYears: {
        "2007": "2007",
        "2008": "2008",
        "2009": "2009",
        earlier: "Prima",
        later: "Dopo",
      },
      consent: 'Accetto il trattamento dei dati secondo l\'<a href="#" data-modal="privacy">informativa sulla privacy</a>.',
      submit: "Scarica la guida gratuitamente",
      formNote: "I dati vengono utilizzati solo per l'invio del PDF e aggiornamenti sulle prestazioni sociali.",
      successTitle: "La guida è in arrivo!",
      successText: "Controlla la tua casella di posta – il PDF arriverà tra pochi minuti.",
    },
    pain: {
      title: "I soldi sono sui conti. Non hai semplicemente presentato la domanda.",
      items: [
        {
          question: "Pago 300+ CHF di assicurazione malattia al mese. È normale?",
          answer: "No. Se il reddito è inferiore a una certa soglia, il cantone rimborsa una parte. A Basilea Campagna, il premio di riferimento per gli adulti è CHF 4'596 all'anno. La differenza viene restituita.",
        },
        {
          question: "Ho due figli. Lo Stato paga qualcosa?",
          answer: "Sì. Assegno per figlio – minimo CHF 215–245 al mese per figlio fino a 16 anni, assegno di formazione – CHF 268–298 dopo i 16 anni. A Zurigo sono CHF 3'216 all'anno per figlio.",
        },
        {
          question: "Sono pensionato. La rendita non basta per vivere.",
          answer: "Prestazioni complementari (PC) – integrazione fino al minimo vitale. CHF 20'670 all'anno per single, CHF 31'005 per coppie. Più un contributo separato all'affitto – fino a CHF 18'300 per single.",
        },
      ],
    },
    guide: {
      title: "Cosa troverai nella guida",
      items: [
        { title: "Assegni familiari", text: "Quanto viene pagato nel tuo cantone, da quale età, fino a quando, come presentare la domanda" },
        { title: "Riduzione dei premi", text: "Come recuperare parte dell'assicurazione malattia (nel cantone SG domanda entro il 31 maggio 2026)" },
        { title: "Prestazioni complementari", text: "Integrazione AVS/AI, chi ha diritto, importi massimi, limite patrimoniale" },
        { title: "Rendita AVS", text: "Date esatte dei pagamenti nel 2026 (primi giorni lavorativi del mese)" },
        { title: "Contributi all'affitto", text: "Sussidio all'affitto per famiglie e pensionati – in quali cantoni e quanto" },
        { title: "Deduzioni fiscali", text: "Quali deduzioni riducono le tasse (figli, assicurazione, contributi previdenziali)" },
        { title: "FAQ", text: "Cosa fare se hai perso la scadenza? E per gli stranieri? E la doppia cittadinanza?" },
      ],
    },
    cta: {
      title: "Ottieni la guida adesso",
      subtitle: "Inserisci la tua e-mail – il PDF arriva istantaneamente. Niente spam. Disiscrizione con un clic.",
      submit: "🟩 Ottieni la guida gratuitamente",
      note: "I dati vengono utilizzati solo per l'invio del PDF e aggiornamenti sulle prestazioni sociali. Nessuna trasmissione a terzi. Cancellazione su richiesta (GDPR / LPD svizzera).",
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
          answer: "Minimo legale: CHF 215–245/mese fino a 16 anni, CHF 268–298/mese in formazione 16–25 anni. In alcuni cantoni di più – Zurigo, Soleura, San Gallo.",
        },
        {
          question: "Cosa sono le PC e chi ne ha bisogno?",
          answer: "Prestazioni complementari – integrazione se le rendite AVS/AI non coprono le spese minime. Limite patrimoniale: CHF 100'000 per single, CHF 200'000 per coppie. Include minimo vitale + affitto + assicurazione.",
        },
        {
          question: "Quando arrivano i pagamenti AVS?",
          answer: "Le pensioni vengono pagate all'inizio del mese, per il mese in corso (anticipatamente). Date esatte: 5 gennaio, 2 febbraio, 2 marzo, ecc. 13a pensione – insieme alla pensione di dicembre.",
        },
        {
          question: "Ho perso la scadenza per la riduzione dei premi. È tutto perduto?",
          answer: "Nella maggior parte dei cantoni – sì, per l'anno in corso. Ma la domanda per l'anno successivo può essere presentata in tempo. Nel cantone San Gallo il modulo arriva automaticamente entro il 10 gennaio.",
        },
      ],
    },
    urgency: {
      title: "I soldi non aspettano. Nemmeno le scadenze.",
      text: "Riduzione dei premi – entro il 31 maggio. Assegni familiari – dalla nascita del figlio. PC – dal momento in cui la rendita non copre più le spese. Scarica la guida – verifica cosa ti stai perdendo.",
      cta: "📄 Scarica la guida gratuitamente",
    },
    footer: {
      impressumTitle: "Impressum",
      impressumText: "La Svizzera paga SA<br>Via Esempio 1<br>8000 Zurigo<br>Svizzera<br>E-mail: info@la-svizzera-paga.ch",
      privacyTitle: "Informativa sulla privacy",
      privacyText: "Trattiamo il tuo indirizzo e-mail e l'anno di nascita esclusivamente per l'invio della guida e aggiornamenti sulle prestazioni sociali. Base giuridica: consenso (art. 6 cpv. 1 lett. a GDPR / art. 31 LPD). Puoi revocare il consenso in qualsiasi momento. I dati non vengono trasmessi a terzi. Cancellazione su richiesta a info@la-svizzera-paga.ch.",
      sourcesTitle: "Fonti",
      sourcesLinks: "ahv-iv.ch · gdk-cds.ch",
      copyright: "© 2026 La Svizzera paga. Tutti diritti riservati.",
    },
    cookie: {
      text: "Utilizziamo cookie per analizzare il traffico del sito. Puoi accettare o rifiutare.",
      accept: "Accettare",
      decline: "Rifiutare",
    },
    validation: {
      emailRequired: "Inserisci il tuo indirizzo e-mail.",
      emailInvalid: "Inserisci un indirizzo e-mail valido.",
      birthYearRequired: "Seleziona il tuo anno di nascita.",
      consentRequired: "Accetta l'informativa sulla privacy.",
    },
  },
};
