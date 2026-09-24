import { Language } from '../types';

export const translations: Record<Language, {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brandName: string;
    brandSubtitle: string;
    claims: string;
    calculator: string;
    guideContent: string;
    faq: string;
    sources: string;
    ctaButton: string;
  };
  hero: {
    badge: string;
    mainTitlePrefix: string;
    mainTitleHighlight: string;
    mainTitleSuffix: string;
    subtitle: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
    trustText: string;
    formTitle: string;
    formSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    birthYearLabel: string;
    birthYearOptions: {
      y2007: string;
      y2008: string;
      y2009: string;
      earlier: string;
      later: string;
    };
    consentLabel: string;
    consentLink: string;
    ctaButton: string;
    privacyNotice: string;
    instantDownloadBadge: string;
  };
  painPoints: {
    sectionTag: string;
    mainTitle: string;
    subtitle: string;
    card1: {
      tag: string;
      question: string;
      answerTitle: string;
      answerText: string;
      highlight: string;
      stat: string;
    };
    card2: {
      tag: string;
      question: string;
      answerTitle: string;
      answerText: string;
      highlight: string;
      stat: string;
    };
    card3: {
      tag: string;
      question: string;
      answerTitle: string;
      answerText: string;
      highlight: string;
      stat: string;
    };
  };
  calculator: {
    sectionTag: string;
    title: string;
    subtitle: string;
    cantonLabel: string;
    cantonSelect: string;
    householdLabel: string;
    householdSingle: string;
    householdCouple: string;
    householdFamily: string;
    householdPensioner: string;
    childrenLabel: string;
    incomeBracketLabel: string;
    incomeLow: string;
    incomeMed: string;
    incomeHigh: string;
    resultTitle: string;
    resultPotential: string;
    perYear: string;
    breakdownTitle: string;
    itemPV: string;
    itemFamily: string;
    itemEL: string;
    itemRent: string;
    itemTax: string;
    cantonDeadlines: string;
    calcCta: string;
  };
  guide: {
    sectionTag: string;
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      desc: string;
      tag: string;
    }>;
  };
  secondaryCta: {
    badge: string;
    title: string;
    subtitle: string;
    bullets: string[];
    guaranteeTitle: string;
    guaranteeText: string;
    emailLabel: string;
    birthYearLabel: string;
    consentLabel: string;
    submitBtn: string;
    downloading: string;
    successMsg: string;
    privacyNote: string;
  };
  sources: {
    sectionTag: string;
    title: string;
    subtitle: string;
    disclaimerTitle: string;
    disclaimerText: string;
    officialPortals: string;
    sourcesList: Array<{
      name: string;
      role: string;
      url: string;
    }>;
  };
  faq: {
    sectionTag: string;
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
      category: string;
    }>;
  };
  urgency: {
    title: string;
    subtitle: string;
    deadlines: Array<{
      benefit: string;
      date: string;
      note: string;
    }>;
    ctaText: string;
  };
  trafficSources: {
    title: string;
    currentSource: string;
    directSource: string;
    medium: string;
    campaign: string;
  };
  footer: {
    tagline: string;
    rights: string;
    impressum: string;
    privacy: string;
    cookies: string;
    disclaimer: string;
    securityNote: string;
  };
  legalModals: {
    impressumTitle: string;
    privacyTitle: string;
    cookieTitle: string;
    close: string;
    acceptAll: string;
    saveSettings: string;
    essentialOnly: string;
  };
}> = {
  de: {
    meta: {
      title: "Staatliche Auszahlungen Schweiz 2026: Worauf hast du Anspruch?",
      description: "Prämienverbilligung, Familienzulagen, Ergänzungsleistungen (EL) & Mietzuschüsse 2026 in der Schweiz. Lade den kostenlosen Leitfaden herunter."
    },
    nav: {
      brandName: "Schweizer Auszahlungs-Kompass",
      brandSubtitle: "Leitfaden 2026",
      claims: "Ansprüche",
      calculator: "Rechner",
      guideContent: "Inhalt",
      faq: "Häufige Fragen",
      sources: "Quellen",
      ctaButton: "Leitfaden laden (PDF)"
    },
    hero: {
      badge: "Offizieller Überblick 2026 • Schweizweit",
      mainTitlePrefix: "Staatliche Auszahlungen in der Schweiz 2026:",
      mainTitleHighlight: "Worauf hast du Anspruch?",
      mainTitleSuffix: "",
      subtitle: "Die Schweiz zahlt. Fortlaufend. Doch viele wissen nicht, was ihnen zusteht. Familienzulagen, Krankenkassen-Prämienverbilligung, Ergänzungsleistungen zur Rente, Mietzinsbeiträge – der Staat erstattet Geld, wenn man weiss, wo man suchen muss. Lade den kostenlosen Leitfaden herunter und verschaffe dir in 2 Minuten Klarheit.",
      stat1Label: "Familienzulage / Kind",
      stat1Value: "ab CHF 215.–/Mt.",
      stat2Label: "Prämienverbilligung BL",
      stat2Value: "bis CHF 4'596.–/J.",
      stat3Label: "EL für Alleinstehende",
      stat3Value: "bis CHF 20'670.–/J.",
      trustText: "100% kostenlos • Offizielle Rechtsgrundlagen (BSV/GDK) • DSG / nDSG-konform",
      formTitle: "Kostenlosen Leitfaden 2026 anfordern",
      formSubtitle: "Erhalte die 18-seitige PDF-Übersicht für alle 26 Kantone direkt per E-Mail.",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "name@beispiel.ch",
      birthYearLabel: "Geburtsjahr",
      birthYearOptions: {
        y2007: "2007",
        y2008: "2008",
        y2009: "2009",
        earlier: "Vor 2007 (Erwachsene / Rentner)",
        later: "Nach 2009"
      },
      consentLabel: "Ich stimme der Datenverarbeitung gemäss",
      consentLink: "Datenschutzerklärung",
      ctaButton: "📄 Leitfaden kostenlos herunterladen",
      privacyNotice: "Deine Daten werden ausschliesslich für den Versand des Leitfadens und relevante Updates zu kantonalen Fristen genutzt. Keine Weitergabe an Dritte. Abmeldung jederzeit mit 1 Klick.",
      instantDownloadBadge: "Sofortiger Download • Keine Wartezeit"
    },
    painPoints: {
      sectionTag: "Klartext & Fakten",
      mainTitle: "Das Geld liegt auf den Konten bereit.",
      subtitle: "Tausende Haushalte in der Schweiz verschenken jedes Jahr tausende Franken, weil sie keinen Antrag stellen.",
      card1: {
        tag: "Krankenkassen-Prämie",
        question: "«Ich zahle monatlich 300+ CHF für die Krankenkasse. Ist das überhaupt normal?»",
        answerTitle: "Nein. Wenn dein Einkommen unter den kantonalen Schwellen liegt, zahlt der Kanton mit.",
        answerText: "Im Kanton Basel-Landschaft beträgt die Richtprämie für Erwachsene beispielsweise CHF 4'596 pro Jahr. Liegt dein massgebendes Einkommen darunter, erstattet dir die kantonale Ausgleichskasse den Differenzbetrag direkt an deine Krankenkasse.",
        highlight: "Prämienverbilligung (IPV)",
        stat: "CHF 1'200 – 4'596 / Jahr Ersparnis"
      },
      card2: {
        tag: "Kinder & Ausbildung",
        question: "«Ich habe zwei Kinder. Zahlt der Staat da etwas dazu?»",
        answerTitle: "Ja, garantiert durch das Bundesgesetz über die Familienzulagen (FamZG).",
        answerText: "Kinderzulagen betragen gesetzlich mindestens CHF 215–245 pro Monat pro Kind bis 16 Jahre, Ausbildungszulagen CHF 268–298 ab 16 bis 25 Jahre. Viele Kantone zahlen deutlich mehr: In Zürich sind es z.B. CHF 3'216 pro Jahr und Kind.",
        highlight: "Kinder- & Ausbildungszulagen",
        stat: "Mind. CHF 5'160 – 7'152 / Jahr für 2 Kinder"
      },
      card3: {
        tag: "Altersrente & IV",
        question: "«Ich bin Rentner(in). Die AHV-Rente reicht kaum für die Miete und Lebenskosten.»",
        answerTitle: "Ergänzungsleistungen (EL) sichern das Existenzminimum – als Rechtsanspruch, nicht als Fürsorge.",
        answerText: "Der gesetzliche Betrag für den allgemeinen Lebensbedarf beträgt CHF 20'670 pro Jahr für Alleinstehende und CHF 31'005 für Ehepaare. Hinzu kommt eine separate Wohnkostenpauschale (Mietzuschuss) von bis zu CHF 18'300 pro Jahr.",
        highlight: "Ergänzungsleistungen (EL)",
        stat: "Bis zu CHF 38'970 / Jahr Gesamtunterstützung"
      }
    },
    calculator: {
      sectionTag: "Interaktiver Schnell-Check",
      title: "Prüfe deine potenziellen Auszahlungen 2026",
      subtitle: "Wähle deinen Kanton und deine Lebenssituation für eine unverbindliche Ersteinschätzung.",
      cantonLabel: "Kanton deines Wohnsitzes",
      cantonSelect: "Kanton wählen...",
      householdLabel: "Haushaltstyp",
      householdSingle: "Alleinstehend (Single)",
      householdCouple: "Paar ohne Kinder",
      householdFamily: "Familie mit Kindern",
      householdPensioner: "AHV/IV-Rentner(in)",
      childrenLabel: "Anzahl Kinder (unter 16 / in Ausbildung)",
      incomeBracketLabel: "Haushaltseinkommen (steuerbar ca.)",
      incomeLow: "Unter CHF 55'000 / Jahr",
      incomeMed: "CHF 55'000 – 90'000 / Jahr",
      incomeHigh: "Über CHF 90'000 / Jahr",
      resultTitle: "Geschätzter potenzieller Anspruch:",
      resultPotential: "ca. CHF",
      perYear: "pro Jahr",
      breakdownTitle: "Aufschlüsselung möglicher Ansprüche:",
      itemPV: "Krankenkassen-Prämienverbilligung (IPV)",
      itemFamily: "Familien- / Kinderzulagen",
      itemEL: "Ergänzungsleistungen / Mietzinsbeiträge",
      itemRent: "Kantonaler Mietzuschuss",
      itemTax: "Steuerersparnis durch Pauschalabzüge",
      cantonDeadlines: "Wichtig für deinen Kanton:",
      calcCta: "Detaillierten kantonalen Leitfaden mit Formularen anfordern"
    },
    guide: {
      sectionTag: "Inhaltsverzeichnis",
      title: "Was du im kostenlosen Leitfaden 2026 findest",
      subtitle: "18 Seiten kompaktes, verifiziertes Wissen ohne Amtsdeutsch – inklusive Schritt-für-Schritt-Anleitungen.",
      features: [
        {
          title: "1. Familienzulagen nach Kanton",
          desc: "Genaue Tarife für alle 26 Kantone: Wer hat Anspruch, Altersgrenzen (0–16 und 16–25 Jahre), wie Selbstständige und Nichterwerbstätige den Antrag einreichen.",
          tag: "Familien & Alleinerziehende"
        },
        {
          title: "2. Prämienverbilligung (IPV) & Fristen",
          desc: "Wie du bis zu CHF 4'500+ Krankenkassenkosten erstattet bekommst. Achtung: Im Kanton St. Gallen endet die Antragsfrist am 31. Mai 2026!",
          tag: "Fristen & Krankenkasse"
        },
        {
          title: "3. Ergänzungsleistungen (EL) zu AHV/IV",
          desc: "Bedarfsrechnung, Maximalbeträge, Freibetrag für Vermögen (CHF 100'000 für Alleinstehende, CHF 200'000 für Paare) und Wohnkostenentschädigung.",
          tag: "Rentner & IV-Bezüger"
        },
        {
          title: "4. AHV-Renten Auszahlungstermine 2026",
          desc: "Exakte Valutatage der Ausgleichskassen für alle 12 Monate 2026 (jeweils am Monatsanfang) sowie Regelung zur 13. AHV-Rente im Dezember.",
          tag: "Auszahlungskalender 2026"
        },
        {
          title: "5. Mietzinsbeiträge & Wohnbeihilfe",
          desc: "Zusätzliche kantonale und städtische Mietzuschüsse für Familien mit geringem Einkommen und Senioren – Tabelle aller berechtigten Kantone.",
          tag: "Wohnen & Miete"
        },
        {
          title: "6. Steuerabzüge optimal nutzen",
          desc: "Welche Pauschalen und Auslagen das steuerbare Einkommen drastisch senken: Kinderdrittbetreuung, Versicherungsprämien, Säule 3a Abzugslimiten 2026.",
          tag: "Steuern sparen"
        },
        {
          title: "7. FAQ: Sonderfälle & Aufenthaltsstatus",
          desc: "Was tun bei verpasster Frist? Rechte von Ausländern mit B- oder C-Bewilligung, Grenzgängern und Personen mit doppelter Staatsbürgerschaft.",
          tag: "Recht & Aufenthaltsstatus"
        }
      ]
    },
    secondaryCta: {
      badge: "Kostenlos & Unverbindlich",
      title: "Hol dir den Leitfaden jetzt direkt ins Postfach",
      subtitle: "Trage deine E-Mail ein – das PDF kommt innerhalb weniger Sekunden. 100% werbefrei, kein Spam, Abmeldung jederzeit möglich.",
      bullets: [
        "Vollständige Tabelle aller 26 Kantone mit aktuellen Beträgen 2026",
        "Offizielle Antragsformulare und Direkt-Links zu den Ausgleichskassen",
        "Checkliste: In 3 Schritten zur erfolgreichen Auszahlung"
      ],
      guaranteeTitle: "Datenschutz nach Schweizer Standard",
      guaranteeText: "Deine Daten werden verschlüsselt übertragen und ausschliesslich gemäss dem neuen Schweizer Datenschutzgesetz (nDSG / FADP) und DSGVO verarbeitet.",
      emailLabel: "Deine beste E-Mail-Adresse *",
      birthYearLabel: "Dein Geburtsjahr *",
      consentLabel: "Ich akzeptiere die Datenschutzerklärung und stimme dem Erhalt des Leitfadens zu.",
      submitBtn: "🟩 Leitfaden jetzt gratis anfordern",
      downloading: "Leitfaden wird generiert...",
      successMsg: "Vielen Dank! Dein Leitfaden steht bereit und wurde auch an deine E-Mail gesendet.",
      privacyNote: "Daten werden nur für den Versand des Leitfadens und kantonale Fristen-Erinnerungen genutzt. Keine Weitergabe an Dritte."
    },
    sources: {
      sectionTag: "Offizielle Rechtsquellen",
      title: "Transparenz: Woher stammen die Daten?",
      subtitle: "Der Leitfaden basiert auf öffentlich zugänglichen Rechtsnormen, Gesetzen und Statistiken der Schweizerischen Eidgenossenschaft.",
      disclaimerTitle: "Unabhängiger Leitfaden & Behörden-Navigator",
      disclaimerText: "Wir sind keine Rechtsberatungs- oder Anwaltskanzlei und keine staatliche Behörde. Dieser Leitfaden dient als strukturierter und laienverständlicher Wegweiser durch die offiziellen Melde- und Antragsverfahren der Schweizerischen Eidgenossenschaft.",
      officialPortals: "Verwendete offizielle Quellen & Portale:",
      sourcesList: [
        {
          name: "Bundesamt für Sozialversicherungen (BSV)",
          role: "Bundesgesetz über Familienzulagen (FamZG) & Ergänzungsleistungsgesetz (ELG)",
          url: "https://www.bsv.admin.ch"
        },
        {
          name: "Kantonale Ausgleichskassen (ahv-iv.ch)",
          role: "Offizielle Richtlinien der 26 kantonalen Durchführungsstellen",
          url: "https://www.ahv-iv.ch"
        },
        {
          name: "Konferenz der kantonalen Gesundheitsdirektoren (GDK)",
          role: "Prämienverbilligungs-Übersichten & kantonale Richtprämien 2026",
          url: "https://www.gdk-cds.ch"
        },
        {
          name: "PwC Schweiz & OECD Veröffentlichungen",
          role: "Steuerabzüge, Kaufkraftvergleiche und Sozialstatistiken",
          url: "https://www.pwc.ch"
        }
      ]
    },
    faq: {
      sectionTag: "Häufige Fragen",
      title: "Antworten auf die wichtigsten Fragen",
      subtitle: "Alles, was du zu Anspruchsvoraussetzungen, Fristen und Nationalität wissen musst.",
      items: [
        {
          question: "Habe ich wirklich Anspruch auf staatliche Gelder in der Schweiz?",
          answer: "Sehr wahrscheinlich ja. Wenn du mehr als 7–12 % deines steuerbaren Einkommens für Krankenkassenprämien bezahlst, besteht in fast allen Kantonen Anspruch auf Prämienverbilligung (IPV). Wenn du Kinder hast, stehen dir gesetzlich garantierte Familienzulagen zu. Als Rentner mit unzureichendem Einkommen greifen die gesetzlichen Ergänzungsleistungen (EL).",
          category: "Anspruch"
        },
        {
          question: "Ich bin Ausländer(in). Stehen mir diese Leistungen ebenfalls zu?",
          answer: "Ja. Personen mit einer Niederlassungsbewilligung (C-Ausweis) haben exakt dieselben Rechte wie Schweizer Staatsangehörige. Mit einer Aufenthaltsbewilligung (B-Ausweis) hast du ebenfalls vollen Anspruch auf Familienzulagen und Prämienverbilligung. Bei Ergänzungsleistungen gilt für B-Ausweise teilweise eine Karenzfrist von 5 bis 10 Jahren ununterbrochenem Wohnsitz.",
          category: "Aufenthaltsstatus"
        },
        {
          question: "Wie viel Geld zahlt der Staat genau pro Kind?",
          answer: "Das Bundesgesetz schreibt für Kinder bis 16 Jahre mindestens CHF 215–245 pro Monat vor. Für Jugendliche in Ausbildung (16 bis 25 Jahre) sind es mindestens CHF 268–298 pro Monat. Viele Kantone stocken diesen Betrag auf: Im Kanton Zürich beträgt die Kinderzulage z.B. CHF 3'216 pro Jahr (CHF 268/Mt.) und die Ausbildungszulage CHF 3'876 pro Jahr.",
          category: "Familie"
        },
        {
          question: "Was genau sind Ergänzungsleistungen (EL) und wer qualifiziert sich?",
          answer: "Ergänzungsleistungen (EL) sind ein verfassungsmässiger Rechtsanspruch für Personen, deren AHV- oder IV-Renten die minimalen Lebenshaltungskosten nicht decken. Sie sind keine Sozialhilfe und müssen bei rechtmässigem Bezug nicht zurückbezahlt werden. Der Vermögensfreibetrag liegt bei CHF 100'000 für Alleinstehende und CHF 200'000 für verheiratete Paare (selbstbewohntes Wohneigentum wird gesondert begünstigt angerechnet).",
          category: "Rente & EL"
        },
        {
          question: "Wann werden die AHV-Renten 2026 auf das Konto überwiesen?",
          answer: "Renten der AHV/IV werden jeweils im Voraus in den ersten Werktagen des Monats ausbezahlt. Die festen Auszahlungstermine 2026 der Ausgleichskassen sind in der Regel: 5. Januar, 2. Februar, 2. März, 6. April, 5. Mai, 2. Juni, 3. Juli, 4. August, 2. September, 2. Oktober, 3. November und 2. Dezember. Die 13. AHV-Rente wird gemäss Volksentscheid zusammen mit der Dezember-Rente ausbezahlt.",
          category: "Auszahlungstermine"
        },
        {
          question: "Ich habe die Frist für die Prämienverbilligung verpasst. Was kann ich tun?",
          answer: "Für das laufende Kalenderjahr ist die Frist in den meisten Kantonen verwirkt, sobald der Stichtag vergangen ist (z.B. 31. Mai 2026 im Kanton St. Gallen). Allerdings senden einige Kantone (wie St. Gallen oder Zürich) die Vorausfüllung automatisch bis zum 10. Januar zu. Du kannst jetzt sofort deine Unterlagen für die kommende Periode vorbereiten, um keine Frist mehr zu versäumen.",
          category: "Fristen"
        }
      ]
    },
    urgency: {
      title: "Das Geld wartet nicht. Die Fristen auch nicht.",
      subtitle: "Jeden Monat verfallen Ansprüche unwiderruflich. Überprüfe jetzt deine Rechte und sichere dir die Unterstützung.",
      deadlines: [
        {
          benefit: "Prämienverbilligung (Krankenkasse)",
          date: "31. Mai 2026",
          note: "Kanton St. Gallen & diverse Kantone (Ausschlussfrist)"
        },
        {
          benefit: "Familienzulagen",
          date: "Rückwirkend bis 5 Jahre",
          note: "Anspruch entsteht ab dem Geburtsmonat des Kindes"
        },
        {
          benefit: "Ergänzungsleistungen (EL)",
          date: "Ab Antragsmonat",
          note: "Keine rückwirkende Auszahlung – jeder Monat Verzögerung kostet Geld"
        }
      ],
      ctaText: "📄 Leitfaden kostenlos herunterladen & Fristen wahren"
    },
    trafficSources: {
      title: "Traffic-Attribution & Kampagnen-Tracking",
      currentSource: "Erkannte Quelle:",
      directSource: "Direktaufruf / Organisch",
      medium: "Medium:",
      campaign: "Kampagne:"
    },
    footer: {
      tagline: "Schweizer Auszahlungs-Kompass 2026 – Der unabhängige Leitfaden für Familien, Arbeitnehmer und Rentner in allen 26 Kantonen.",
      rights: "Alle Rechte vorbehalten. Erstellt für Bürgerinnen und Bürger sowie Einwohner der Schweiz.",
      impressum: "Impressum (CH-Recht)",
      privacy: "Datenschutzerklärung (nDSG / FADP)",
      cookies: "Cookie-Einstellungen",
      disclaimer: "Haftungsausschluss: Keine Rechtsberatung im Einzelfall. Sämtliche Angaben basieren auf den offiziellen Gesetzesständen 2026.",
      securityNote: "🔒 256-Bit SSL/TLS verschlüsselt • Hosted in Switzerland / EU"
    },
    legalModals: {
      impressumTitle: "Impressum gemäss Schweizer Recht",
      privacyTitle: "Datenschutzerklärung nach Schweizer FADP / nDSG & EU-DSGVO",
      cookieTitle: "Cookie- & Privatsphäre-Einstellungen",
      close: "Schliessen",
      acceptAll: "Alle akzeptieren",
      saveSettings: "Auswahl speichern",
      essentialOnly: "Nur essenzielle Cookies"
    }
  },
  fr: {
    meta: {
      title: "Prestations de l'État en Suisse 2026 : à quoi avez-vous droit ?",
      description: "Réduction des primes, allocations familiales, prestations complémentaires (PC) et aides au logement 2026 en Suisse. Téléchargez le guide gratuit."
    },
    nav: {
      brandName: "Boussole des Prestations Suisses",
      brandSubtitle: "Guide 2026",
      claims: "Vos Droits",
      calculator: "Calculateur",
      guideContent: "Contenu",
      faq: "FAQ",
      sources: "Sources",
      ctaButton: "Télécharger le guide (PDF)"
    },
    hero: {
      badge: "Aperçu officiel 2026 • Toute la Suisse",
      mainTitlePrefix: "Prestations de l'État en Suisse 2026 :",
      mainTitleHighlight: "À quoi avez-vous droit ?",
      mainTitleSuffix: "",
      subtitle: "La Suisse paie. Constamment. Pourtant, beaucoup ignorent ce à quoi ils ont droit. Allocations familiales, réduction des primes d'assurance-maladie, prestations complémentaires à la rente, aide au logement — l'État rembourse de l'argent si l'on sait où chercher. Téléchargez le guide gratuit et comprenez tout en 2 minutes.",
      stat1Label: "Allocation / enfant",
      stat1Value: "dès CHF 215.–/mois",
      stat2Label: "Réduction primes BL",
      stat2Value: "jusqu'à CHF 4'596.–/an",
      stat3Label: "PC personne seule",
      stat3Value: "jusqu'à CHF 20'670.–/an",
      trustText: "100% gratuit • Fondements légaux officiels (OFAS/CDS) • Conforme nLPD / FADP",
      formTitle: "Demandez le guide gratuit 2026",
      formSubtitle: "Recevez le document PDF complet de 18 pages pour les 26 cantons directement par e-mail.",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "nom@exemple.ch",
      birthYearLabel: "Année de naissance",
      birthYearOptions: {
        y2007: "2007",
        y2008: "2008",
        y2009: "2009",
        earlier: "Avant 2007 (Adultes / Retraités)",
        later: "Après 2009"
      },
      consentLabel: "J'accepte le traitement de mes données conformément à la",
      consentLink: "Déclaration de protection des données",
      ctaButton: "📄 Télécharger le guide gratuit",
      privacyNotice: "Vos données sont utilisées exclusivement pour l'envoi du guide et les rappels d'échéances cantonales. Aucune transmission à des tiers. Désinscription en 1 clic.",
      instantDownloadBadge: "Téléchargement immédiat • Sans attente"
    },
    painPoints: {
      sectionTag: "Faits & Réalités",
      mainTitle: "L'argent dort sur les comptes.",
      subtitle: "Des milliers de ménages en Suisse passent à côté de milliers de francs chaque année par simple méconnaissance des formulaires.",
      card1: {
        tag: "Assurance-Maladie",
        question: "« Je paie plus de 300 CHF d'assurance-maladie chaque mois. Est-ce normal ? »",
        answerTitle: "Non. Si votre revenu est inférieur à certains seuils, le canton prend en charge une partie.",
        answerText: "Dans le canton de Bâle-Campagne, la prime de référence adulte est de CHF 4'596 par an. Si votre revenu déterminant se situe sous les barèmes, la caisse de compensation cantonale verse directement la subvention à votre assureur.",
        highlight: "Réduction individuelle des primes (RIP)",
        stat: "Économie de CHF 1'200 à 4'596 / an"
      },
      card2: {
        tag: "Enfants & Formation",
        question: "« J'ai deux enfants. L'État verse-t-il quelque chose pour nous aider ? »",
        answerTitle: "Oui, garanti par la loi fédérale sur les allocations familiales (LAFam).",
        answerText: "L'allocation pour enfant est d'au moins CHF 215 à 245 par mois jusqu'à 16 ans, et l'allocation de formation de CHF 268 à 298 de 16 à 25 ans. Plusieurs cantons versent davantage : à Zurich par exemple, cela atteint CHF 3'216 par an et par enfant.",
        highlight: "Allocations pour enfants & formation",
        stat: "Min. CHF 5'160 à 7'152 / an pour 2 enfants"
      },
      card3: {
        tag: "Rente AVS & AI",
        question: "« Je suis retraité(e). La rente AVS suffit à peine pour le loyer et le quotidien. »",
        answerTitle: "Les prestations complémentaires (PC) couvrent le minimum vital garanti par la loi.",
        answerText: "Le montant légal pour les besoins vitaux généraux est de CHF 20'670 par an pour une personne seule et CHF 31'005 pour un couple marié. S'y ajoute un supplément loyer pouvant aller jusqu'à CHF 18'300 par an.",
        highlight: "Prestations complémentaires (PC/EL)",
        stat: "Jusqu'à CHF 38'970 / an d'aide totale"
      }
    },
    calculator: {
      sectionTag: "Test Rapide Interactif",
      title: "Estimez vos prestations potentielles 2026",
      subtitle: "Sélectionnez votre canton et votre situation familiale pour une évaluation indicative immédiate.",
      cantonLabel: "Canton de domicile",
      cantonSelect: "Sélectionnez un canton...",
      householdLabel: "Composition du ménage",
      householdSingle: "Personne seule (Célibataire)",
      householdCouple: "Couple sans enfant",
      householdFamily: "Famille avec enfant(s)",
      householdPensioner: "Bénéficiaire AVS/AI",
      childrenLabel: "Nombre d'enfants (moins de 16 ans / en formation)",
      incomeBracketLabel: "Revenu imposable approximatif du ménage",
      incomeLow: "Moins de CHF 55'000 / an",
      incomeMed: "CHF 55'000 – 90'000 / an",
      incomeHigh: "Plus de CHF 90'000 / an",
      resultTitle: "Droit potentiel estimé :",
      resultPotential: "env. CHF",
      perYear: "par an",
      breakdownTitle: "Détail des droits possibles :",
      itemPV: "Réduction des primes d'assurance-maladie (RIP)",
      itemFamily: "Allocations familiales et pour enfants",
      itemEL: "Prestations complémentaires / Subventions",
      itemRent: "Allocations de logement cantonales",
      itemTax: "Économies fiscales par déductions forfaitaires",
      cantonDeadlines: "Échéances clés dans votre canton :",
      calcCta: "Recevoir le guide cantonal détaillé avec tous les formulaires"
    },
    guide: {
      sectionTag: "Sommaire du Guide",
      title: "Ce que vous trouverez dans le guide gratuit 2026",
      subtitle: "18 pages d'informations vérifiées sans jargon administratif — démarches concrètes étape par étape.",
      features: [
        {
          title: "1. Allocations familiales par canton",
          desc: "Montants précis pour les 26 cantons : conditions d'octroi, tranches d'âge (0–16 et 16–25 ans), démarches pour indépendants et personnes sans emploi.",
          tag: "Familles & Parents isolés"
        },
        {
          title: "2. Réduction des primes d'assurance & délais",
          desc: "Comment obtenir jusqu'à CHF 4'500+ de remboursement. Attention : dans le canton de Saint-Gall, le délai de demande expire le 31 mai 2026 !",
          tag: "Délais & Assurance-Maladie"
        },
        {
          title: "3. Prestations complémentaires (PC/EL)",
          desc: "Calcul des besoins, plafonds de fortune (CHF 100'000 pour personne seule, CHF 200'000 pour couple) et remboursement des frais de logement.",
          tag: "Retraités & Rente AI"
        },
        {
          title: "4. Calendrier des versements AVS 2026",
          desc: "Dates de valeur exactes pour les 12 mois de 2026 (début de chaque mois) et modalités de versement de la 13e rente AVS en décembre.",
          tag: "Calendrier AVS 2026"
        },
        {
          title: "5. Aides au logement & subsides de loyer",
          desc: "Allocations de logement cantonales et communales pour ménages modestes et aînés — tableau récapitulatif cantonal.",
          tag: "Logement & Loyers"
        },
        {
          title: "6. Optimisation des déductions fiscales",
          desc: "Quelles déductions réduisent significativement l'impôt : frais de garde d'enfants, primes d'assurance, plafonds du 3e pilier A 2026.",
          tag: "Économies d'impôts"
        },
        {
          title: "7. FAQ : Cas particuliers & Permis de séjour",
          desc: "Que faire en cas de délai dépassé ? Droits pour permis B et C, frontaliers et personnes à double nationalité.",
          tag: "Droit & Statut de séjour"
        }
      ]
    },
    secondaryCta: {
      badge: "Gratuit & Sans Engagement",
      title: "Recevez le guide directement dans votre boîte mail",
      subtitle: "Indiquez votre adresse e-mail — le document PDF vous parvient en quelques secondes. Sans publicité, désabonnement possible à tout moment.",
      bullets: [
        "Tableau complet des 26 cantons avec les montants officiels 2026",
        "Formulaires officiels et liens directs vers les caisses de compensation",
        "Check-list : 3 étapes simples pour percevoir vos montants"
      ],
      guaranteeTitle: "Protection des données aux standards suisses",
      guaranteeText: "Vos données sont transmises de manière sécurisée et traitées strictement selon la nouvelle loi suisse sur la protection des données (nLPD / FADP) et le RGPD.",
      emailLabel: "Votre adresse e-mail principale *",
      birthYearLabel: "Votre année de naissance *",
      consentLabel: "J'accepte la déclaration de protection des données et le téléchargement du guide.",
      submitBtn: "🟩 Obtenir le guide gratuit",
      downloading: "Génération du guide...",
      successMsg: "Merci ! Votre guide est prêt à être téléchargé et vous a été transmis par e-mail.",
      privacyNote: "Données réservées à l'envoi du guide et aux rappels d'échéances. Aucune cession à des tiers."
    },
    sources: {
      sectionTag: "Sources Officielles",
      title: "Transparence : d'où proviennent ces données ?",
      subtitle: "Ce guide est rédigé à partir des textes légaux publics, statistiques et ordonnances de la Confédération suisse.",
      disclaimerTitle: "Guide indépendant & Navigateur des démarches",
      disclaimerText: "Nous ne sommes ni une étude d'avocats, ni un service étatique. Ce guide constitue une boussole vulgarisée et structurée à travers les démarches administratives officielles suisses.",
      officialPortals: "Sources et plateformes officielles utilisées :",
      sourcesList: [
        {
          name: "Office fédéral des assurances sociales (OFAS)",
          role: "Loi fédérale sur les allocations familiales (LAFam) & Loi sur les prestations complémentaires (LPC)",
          url: "https://www.bsv.admin.ch"
        },
        {
          name: "Caisses de compensation cantonales (ahv-iv.ch)",
          role: "Directives officielles des 26 organes cantonaux d'exécution",
          url: "https://www.ahv-iv.ch"
        },
        {
          name: "Conférence des directrices et directeurs cantonaux de la santé (CDS)",
          role: "Tableaux des réductions de primes et primes de référence 2026",
          url: "https://www.gdk-cds.ch"
        },
        {
          name: "Publications PwC Suisse & OCDE",
          role: "Analyses fiscales comparatives et statistiques sociales suisses",
          url: "https://www.pwc.ch"
        }
      ]
    },
    faq: {
      sectionTag: "Questions Fréquentes",
      title: "Réponses aux questions essentielles",
      subtitle: "Tout savoir sur les conditions d'éligibilité, les délais légaux et la nationalité.",
      items: [
        {
          question: "Ai-je réellement droit à des prestations en Suisse ?",
          answer: "Très probablement oui. Si vos primes d'assurance-maladie représentent plus de 7 à 12 % du revenu déterminant de votre foyer, vous avez droit à la réduction des primes (RIP) dans presque tous les cantons. Si vous avez des enfants, les allocations familiales sont garanties par la loi. Si vous êtes à la retraite avec des revenus modestes, les prestations complémentaires (PC) s'appliquent.",
          category: "Éligibilité"
        },
        {
          question: "Je suis étranger(ère). Ai-je également droit à ces aides ?",
          answer: "Oui. Les titulaires d'un permis d'établissement (permis C) ont exactement les mêmes droits que les citoyens suisses. Avec un permis de séjour (permis B), vous avez plein droit aux allocations familiales et à la réduction des primes. Pour les prestations complémentaires (PC), un délai de carence de 5 à 10 ans de résidence ininterrompue peut s'appliquer pour les permis B selon la nationalité.",
          category: "Statut de séjour"
        },
        {
          question: "Combien l'État verse-t-il exactement par enfant ?",
          answer: "La loi fédérale fixe un plancher de CHF 215 à 245 par mois par enfant de moins de 16 ans, et de CHF 268 à 298 par mois pour les jeunes en formation de 16 à 25 ans. Plusieurs cantons appliquent des barèmes supérieurs : dans le canton de Zurich par exemple, l'allocation s'élève à CHF 3'216 par an (CHF 268/mois) et CHF 3'876 par an en formation.",
          category: "Famille"
        },
        {
          question: "Que sont les prestations complémentaires (PC) et qui y a droit ?",
          answer: "Les prestations complémentaires (PC/EL) sont un droit constitutionnel pour les bénéficiaires de rentes AVS ou AI dont le revenu ne couvre pas les dépenses vitales minimales. Il ne s'agit pas d'aide sociale et elles n'ont pas à être remboursées si perçues légitimement. Le seuil de fortune est de CHF 100'000 pour une personne seule et CHF 200'000 pour un couple (le logement habité bénéficie d'un abattement avantageux).",
          category: "Retraite & PC"
        },
        {
          question: "Quand les rentes AVS 2026 sont-elles versées sur le compte bancaire ?",
          answer: "Les rentes AVS/AI sont versées d'avance dès les premiers jours ouvrables du mois. En 2026, les dates de versement effectives sont : 5 janvier, 2 février, 2 mars, 6 avril, 5 mai, 2 juin, 3 juillet, 4 août, 2 septembre, 2 octobre, 3 novembre et 2 décembre. La 13e rente AVS est versée conjointement avec la rente de décembre.",
          category: "Calendrier de paiement"
        },
        {
          question: "J'ai manqué la date limite pour la réduction des primes. Que faire ?",
          answer: "Pour l'année en cours, le délai est généralement forclos une fois la date dépassée (par exemple le 31 mai 2026 dans le canton de Saint-Gall). Cependant, certains cantons envoient le formulaire prérempli automatiquement avant le 10 janvier. Télécharger le guide vous permet de préparer sans tarder votre dossier pour la période suivante afin d'éviter toute perte de droits.",
          category: "Délais"
        }
      ]
    },
    urgency: {
      title: "L'argent n'attend pas. Les délais non plus.",
      subtitle: "Chaque mois, des montants non réclamés sont définitivement perdus. Vérifiez vos droits sans attendre.",
      deadlines: [
        {
          benefit: "Réduction des primes (Assurance-Maladie)",
          date: "31 mai 2026",
          note: "Canton de St-Gall & plusieurs cantons (délai de rigueur)"
        },
        {
          benefit: "Allocations familiales",
          date: "Rétroactif jusqu'à 5 ans",
          note: "Droit ouvert dès le mois de naissance de l'enfant"
        },
        {
          benefit: "Prestations complémentaires (PC)",
          date: "Dès le mois de la demande",
          note: "Pas d'effet rétroactif majeur — chaque mois de retard est une perte sèche"
        }
      ],
      ctaText: "📄 Télécharger le guide gratuit & respecter les délais"
    },
    trafficSources: {
      title: "Attribution du trafic & Suivi des campagnes",
      currentSource: "Origine détectée :",
      directSource: "Accès direct / Recherche organique",
      medium: "Support :",
      campaign: "Campagne :"
    },
    footer: {
      tagline: "Boussole des Prestations Suisses 2026 – Le guide de référence indépendant pour les familles, salariés et retraités dans les 26 cantons.",
      rights: "Tous droits réservés. Développé pour les citoyens et résidents de Suisse.",
      impressum: "Mentions légales / Impressum (Droit suisse)",
      privacy: "Protection des données (nLPD / FADP)",
      cookies: "Gestion des cookies",
      disclaimer: "Avis légal : Ne constitue pas un conseil juridique individuel. Données basées sur les bases légales en vigueur en 2026.",
      securityNote: "🔒 Chiffrement SSL/TLS 256 bits • Hébergement Suisse / UE"
    },
    legalModals: {
      impressumTitle: "Mentions Légales (Impressum) selon le Droit Suisse",
      privacyTitle: "Politique de Confidentialité selon la nLPD / FADP suisse & RGPD",
      cookieTitle: "Préférences de Confidentialité & Cookies",
      close: "Fermer",
      acceptAll: "Tout accepter",
      saveSettings: "Enregistrer mes choix",
      essentialOnly: "Cookies essentiels uniquement"
    }
  },
  it: {
    meta: {
      title: "Prestazioni statali in Svizzera 2026: a cosa hai diritto?",
      description: "Riduzione dei premi cassa malati, assegni familiari, prestazioni complementari (PC) e contributi affitto 2026 in Svizzera. Scarica la guida gratuita."
    },
    nav: {
      brandName: "Bussola delle Prestazioni Svizzere",
      brandSubtitle: "Guida 2026",
      claims: "Diritti",
      calculator: "Calcolatore",
      guideContent: "Contenuto",
      faq: "Domande Frequenti",
      sources: "Fonti",
      ctaButton: "Scarica guida (PDF)"
    },
    hero: {
      badge: "Panoramica ufficiale 2026 • Tutta la Svizzera",
      mainTitlePrefix: "Prestazioni statali in Svizzera 2026:",
      mainTitleHighlight: "A cosa hai diritto?",
      mainTitleSuffix: "",
      subtitle: "La Svizzera paga. Costantemente. Eppure molti non sanno a cosa hanno diritto. Assegni familiari, riduzione dei premi cassa malati, prestazioni complementari alla rendita, contributi per l'affitto — lo Stato rimborsa denaro se sai dove guardare. Scarica la guida gratuita e scopri tutto in 2 minuti.",
      stat1Label: "Assegno / figlio",
      stat1Value: "da CHF 215.–/mese",
      stat2Label: "Riduzione premi BL",
      stat2Value: "fino a CHF 4'596.–/anno",
      stat3Label: "PC persona sola",
      stat3Value: "fino a CHF 20'670.–/anno",
      trustText: "100% gratuito • Basi giuridiche ufficiali (UFAS/CDS) • Conforme nLPD / FADP",
      formTitle: "Richiedi la guida gratuita 2026",
      formSubtitle: "Ricevi il documento PDF completo di 18 pagine per tutti i 26 Cantoni direttamente via e-mail.",
      emailLabel: "Indirizzo e-mail",
      emailPlaceholder: "nome@esempio.ch",
      birthYearLabel: "Anno di nascita",
      birthYearOptions: {
        y2007: "2007",
        y2008: "2008",
        y2009: "2009",
        earlier: "Prima del 2007 (Adulti / Pensionati)",
        later: "Dopo il 2009"
      },
      consentLabel: "Acconsento al trattamento dei dati in conformità con l'",
      consentLink: "Informativa sulla privacy",
      ctaButton: "📄 Scarica la guida gratis",
      privacyNotice: "I tuoi dati vengono utilizzati esclusivamente per l'invio della guida e gli avvisi sulle scadenze cantonali. Nessuna cessione a terzi. Cancellazione in 1 clic.",
      instantDownloadBadge: "Download immediato • Nessuna attesa"
    },
    painPoints: {
      sectionTag: "Fatti & Realtà",
      mainTitle: "I soldi sono pronti sui conti.",
      subtitle: "Migliaia di famiglie in Svizzera rinunciano ogni anno a migliaia di franchi semplicemente perché non inoltrano la domanda.",
      card1: {
        tag: "Cassa Malati",
        question: "«Pago 300+ CHF per la cassa malati ogni mese. È normale?»",
        answerTitle: "No. Se il tuo reddito è inferiore a certe soglie, il Cantone rimborsa una parte consistente.",
        answerText: "Nel Canton Basilea Campagna, ad esempio, il premio di riferimento per adulti è di CHF 4'596 all'anno. Se il tuo reddito computabile rientra nei parametri, la cassa di compensazione versa direttamente il sussidio alla tua assicurazione.",
        highlight: "Riduzione individuale dei premi (RIP)",
        stat: "Risparmio di CHF 1'200 – 4'596 / anno"
      },
      card2: {
        tag: "Figli & Formazione",
        question: "«Ho due figli. Lo Stato paga qualcosa per aiutarci?»",
        answerTitle: "Sì, garantito dalla Legge federale sugli assegni familiari (LAFam).",
        answerText: "Gli assegni per figli sono di almeno CHF 215–245 al mese per figlio fino a 16 anni, e l'assegno di formazione CHF 268–298 dai 16 ai 25 anni. Diversi Cantoni pagano molto di più: a Zurigo ad esempio sono CHF 3'216 all'anno per figlio.",
        highlight: "Assegni per figli e di formazione",
        stat: "Min. CHF 5'160 – 7'152 / anno per 2 figli"
      },
      card3: {
        tag: "Rendita AVS & AI",
        question: "«Sono pensionato/a. La rendita AVS basta a malapena per affitto e spese di vita.»",
        answerTitle: "Le prestazioni complementari (PC/EL) integrano il reddito fino al minimo vitale garantito per legge.",
        answerText: "L'importo legale per il fabbisogno vitale generale è di CHF 20'670 all'anno per persone sole e CHF 31'005 per coppie sposate. Si aggiunge un contributo separato per l'affitto fino a CHF 18'300 all'anno.",
        highlight: "Prestazioni complementari (PC/EL)",
        stat: "Fino a CHF 38'970 / anno di sostegno totale"
      }
    },
    calculator: {
      sectionTag: "Calcolo Rapido Interattivo",
      title: "Verifica le tue prestazioni potenziali 2026",
      subtitle: "Seleziona il tuo Cantone e la tua situazione familiare per una stima orientativa immediata.",
      cantonLabel: "Cantone di domicilio",
      cantonSelect: "Seleziona un Cantone...",
      householdLabel: "Tipo di nucleo familiare",
      householdSingle: "Persona sola (Single)",
      householdCouple: "Coppia senza figli",
      householdFamily: "Famiglia con figli",
      householdPensioner: "Beneficiario/a AVS/AI",
      childrenLabel: "Numero di figli (sotto i 16 anni / in formazione)",
      incomeBracketLabel: "Reddito imponibile approssimativo del nucleo",
      incomeLow: "Meno di CHF 55'000 / anno",
      incomeMed: "CHF 55'000 – 90'000 / anno",
      incomeHigh: "Oltre CHF 90'000 / anno",
      resultTitle: "Diritto potenziale stimato:",
      resultPotential: "circa CHF",
      perYear: "all'anno",
      breakdownTitle: "Dettaglio delle prestazioni possibili:",
      itemPV: "Riduzione dei premi cassa malati (RIP)",
      itemFamily: "Assegni familiari e per figli",
      itemEL: "Prestazioni complementari / Sussidi",
      itemRent: "Contributi cantonali per l'affitto",
      itemTax: "Risparmio fiscale tramite deduzioni forfettarie",
      cantonDeadlines: "Scadenze fondamentali nel tuo Cantone:",
      calcCta: "Richiedi la guida cantonale dettagliata con tutti i moduli"
    },
    guide: {
      sectionTag: "Indice dei Contenuti",
      title: "Cosa troverai nella guida gratuita 2026",
      subtitle: "18 pagine di informazioni verificate senza burocrazia — istruzioni passo dopo passo.",
      features: [
        {
          title: "1. Assegni familiari per Cantone",
          desc: "Tariffe esatte per tutti i 26 Cantoni: aventi diritto, fasce d'età (0–16 e 16–25 anni), procedura per lavoratori indipendenti e persone non attive.",
          tag: "Famiglie & Genitori soli"
        },
        {
          title: "2. Riduzione dei premi cassa malati & scadenze",
          desc: "Come ottenere fino a CHF 4'500+ di rimborso premi. Attenzione: nel Canton San Gallo la scadenza di inoltro è il 31 maggio 2026!",
          tag: "Scadenze & Cassa Malati"
        },
        {
          title: "3. Prestazioni complementari (PC/EL)",
          desc: "Calcolo del fabbisogno, franchigie patrimoniali (CHF 100'000 per persone sole, CHF 200'000 per coppie) e copertura spese d'alloggio.",
          tag: "Pensionati & Rendita AI"
        },
        {
          title: "4. Calendario pagamenti rendite AVS 2026",
          desc: "Date esatte di accredito per tutti i 12 mesi del 2026 (all'inizio di ogni mese) e regolamentazione per la 13esima rendita AVS a dicembre.",
          tag: "Calendario AVS 2026"
        },
        {
          title: "5. Contributi per l'affitto e alloggio",
          desc: "Sussidi per l'abitazione comunali e cantonali per famiglie a basso reddito e anziani — tabella riepilogativa cantonale.",
          tag: "Abitazione & Affitto"
        },
        {
          title: "6. Ottimizzazione delle deduzioni fiscali",
          desc: "Quali deduzioni riducono drasticamente il reddito imponibile: spese di custodia figli, premi assicurativi, limiti 3° pilastro A 2026.",
          tag: "Risparmio fiscale"
        },
        {
          title: "7. FAQ: Casi particolari & Permessi di soggiorno",
          desc: "Cosa fare in caso di scadenza superata? Diritti con permesso B e C, frontalieri e persone con doppia cittadinanza.",
          tag: "Diritto & Permessi"
        }
      ]
    },
    secondaryCta: {
      badge: "Gratuito & Senza Impegno",
      title: "Ricevi la guida direttamente nella tua casella di posta",
      subtitle: "Inserisci la tua e-mail — il documento PDF arriverà in pochi secondi. 100% senza spam, disiscrizione possibile in qualsiasi momento.",
      bullets: [
        "Tabella completa di tutti i 26 Cantoni con gli importi ufficiali 2026",
        "Moduli ufficiali di richiesta e link diretti alle casse di compensazione",
        "Checklist: in 3 passi verso l'accredito dei tuoi importi"
      ],
      guaranteeTitle: "Protezione dati secondo gli standard svizzeri",
      guaranteeText: "I tuoi dati vengono trasmessi in modo crittografato e trattati esclusivamente secondo la nuova legge federale sulla protezione dei dati (nLPD / FADP) e il GDPR.",
      emailLabel: "Il tuo miglior indirizzo e-mail *",
      birthYearLabel: "Il tuo anno di nascita *",
      consentLabel: "Accetto l'informativa sulla privacy e acconsento alla ricezione della guida.",
      submitBtn: "🟩 Ricevi la guida gratis",
      downloading: "Generazione della guida in corso...",
      successMsg: "Grazie! La tua guida è pronta per il download ed è stata inviata anche alla tua e-mail.",
      privacyNote: "I dati sono utilizzati esclusivamente per l'invio della guida e promemoria sulle scadenze. Nessuna cessione a terzi."
    },
    sources: {
      sectionTag: "Fonti Giuridiche Ufficiali",
      title: "Trasparenza: da dove provengono i dati?",
      subtitle: "La guida è redatta sulla base di fonti accessibili pubblicamente, basi legali e statistiche della Confederazione Svizzera.",
      disclaimerTitle: "Guida indipendente & Navigatore procedurale",
      disclaimerText: "Non siamo uno studio legale né un'autorità statale. Questa guida funge da navigatore chiaro e strutturato attraverso le procedure e i moduli ufficiali della Confederazione Svizzera.",
      officialPortals: "Fonti e portali ufficiali consultati:",
      sourcesList: [
        {
          name: "Ufficio federale delle assicurazioni sociali (UFAS)",
          role: "Legge federale sugli assegni familiari (LAFam) & Legge sulle prestazioni complementari (LPC)",
          url: "https://www.bsv.admin.ch"
        },
        {
          name: "Casse di compensazione cantonali (ahv-iv.ch)",
          role: "Direttive ufficiali dei 26 organi cantonali di esecuzione",
          url: "https://www.ahv-iv.ch"
        },
        {
          name: "Conferenza delle direttrici e dei direttori cantonali della sanità (CDS)",
          role: "Prospetti sulle riduzioni dei premi e premi di riferimento 2026",
          url: "https://www.gdk-cds.ch"
        },
        {
          name: "Pubblicazioni PwC Svizzera & OCSE",
          role: "Deduzioni fiscali, potere d'acquisto e statistiche sociali",
          url: "https://www.pwc.ch"
        }
      ]
    },
    faq: {
      sectionTag: "Domande Frequenti",
      title: "Risposte alle domande più importanti",
      subtitle: "Tutto ciò che devi sapere su requisiti di idoneità, scadenze e nazionalità.",
      items: [
        {
          question: "Ho davvero diritto a prestazioni statali in Svizzera?",
          answer: "Molto probabilmente sì. Se spendi più del 7–12% del tuo reddito computabile per i premi della cassa malati, nella quasi totalità dei Cantoni hai diritto alla riduzione dei premi (RIP). Se hai figli, ti spettano gli assegni familiari garantiti per legge. Come pensionato con reddito insufficiente, entrano in gioco le prestazioni complementari (PC).",
          category: "Idoneità"
        },
        {
          question: "Sono straniero/a. Spettano anche a me queste prestazioni?",
          answer: "Sì. Chi possiede un permesso di domicilio (permesso C) ha esattamente gli stessi diritti dei cittadini svizzeri. Con un permesso di dimora (permesso B) hai pieno diritto agli assegni familiari e alla riduzione dei premi cassa malati. Per le prestazioni complementari (PC), per i titolari di permesso B può essere richiesto un periodo di residenza ininterrotta di 5–10 anni a seconda della nazionalità.",
          category: "Permessi di soggiorno"
        },
        {
          question: "Quanto paga esattamente lo Stato per ogni figlio?",
          answer: "La legge federale stabilisce un minimo di CHF 215–245 al mese per figlio fino a 16 anni, e di CHF 268–298 al mese per giovani in formazione (16–25 anni). Diversi Cantoni offrono importi superiori: nel Canton Zurigo ad esempio l'assegno per figli è di CHF 3'216 all'anno (CHF 268/mese) e quello di formazione CHF 3'876 all'anno.",
          category: "Famiglia"
        },
        {
          question: "Cosa sono le prestazioni complementari (PC/EL) e a chi spettano?",
          answer: "Le prestazioni complementari (PC/EL) sono un diritto costituzionale per chi percepisce una rendita AVS o AI insufficiente a coprire i costi minimi di sussistenza. Non sono assistenza sociale e non vanno restituite se percepite legittimamente. La franchigia sulla sostanza è di CHF 100'000 per persone sole e CHF 200'000 per coppie sposate (la casa di proprietà ad uso proprio gode di forti agevolazioni).",
          category: "Rendite & PC"
        },
        {
          question: "Quando vengono accreditate le rendite AVS 2026 sul conto?",
          answer: "Le rendite AVS/AI vengono accreditate in anticipo nei primi giorni lavorativi del mese. Le date esatte 2026 delle casse di compensazione sono: 5 gennaio, 2 febbraio, 2 marzo, 6 aprile, 5 maggio, 2 giugno, 3 luglio, 4 agosto, 2 settembre, 2 ottobre, 3 novembre e 2 dicembre. La 13esima rendita AVS viene versata insieme alla rendita di dicembre.",
          category: "Date di pagamento"
        },
        {
          question: "Ho perso la scadenza per la riduzione dei premi. È tutto perso?",
          answer: "Per l'anno in corso, nella maggior parte dei Cantoni il diritto decade una volta trascorsa la data limite (ad esempio il 31 maggio 2026 nel Canton San Gallo). Tuttavia, alcuni Cantoni (come San Gallo o Zurigo) inviano il modulo precompilato automaticamente entro il 10 gennaio. Scaricare la guida ti permette di preparare tempestivamente i documenti per il periodo successivo ed evitare ulteriori perdite.",
          category: "Scadenze"
        }
      ]
    },
    urgency: {
      title: "Il denaro non aspetta. Neanche le scadenze.",
      subtitle: "Ogni mese che passa, prestazioni non richieste vanno irrimediabilmente perse. Verifica subito i tuoi diritti.",
      deadlines: [
        {
          benefit: "Riduzione premi cassa malati (RIP)",
          date: "31 maggio 2026",
          note: "Canton San Gallo e diversi Cantoni (termine perentorio)"
        },
        {
          benefit: "Assegni familiari",
          date: "Retroattivo fino a 5 anni",
          note: "Il diritto decorre dal mese di nascita del figlio"
        },
        {
          benefit: "Prestazioni complementari (PC)",
          date: "Dal mese della domanda",
          note: "Nessun effetto retroattivo principale — ogni mese perso è denaro perso"
        }
      ],
      ctaText: "📄 Scarica la guida gratis & rispetta le scadenze"
    },
    trafficSources: {
      title: "Attribuzione Traffico & Tracciamento Campagne",
      currentSource: "Sorgente rilevata:",
      directSource: "Accesso diretto / Organico",
      medium: "Mezzo:",
      campaign: "Campagna:"
    },
    footer: {
      tagline: "Bussola delle Prestazioni Svizzere 2026 – La guida indipendente per famiglie, lavoratori e pensionati in tutti i 26 Cantoni.",
      rights: "Tutti i diritti riservati. Sviluppato per cittadini e residenti in Svizzera.",
      impressum: "Impressum (Diritto svizzero)",
      privacy: "Informativa sulla privacy (nLPD / FADP)",
      cookies: "Gestione dei cookie",
      disclaimer: "Avviso legale: Non costituisce consulenza legale individuale. Dati basati sulle normative ufficiali in vigore nel 2026.",
      securityNote: "🔒 Crittografia SSL/TLS a 256 bit • Hosting Svizzera / UE"
    },
    legalModals: {
      impressumTitle: "Impressum secondo il Diritto Svizzero",
      privacyTitle: "Informativa sulla Privacy secondo nLPD / FADP svizzera e GDPR",
      cookieTitle: "Preferenze Privacy & Cookie",
      close: "Chiudi",
      acceptAll: "Accetta tutti",
      saveSettings: "Salva preferenze",
      essentialOnly: "Solo cookie essenziali"
    }
  }
};
