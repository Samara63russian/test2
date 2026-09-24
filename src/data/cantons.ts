import { CantonData } from '../types';

export const swissCantons: CantonData[] = [
  {
    code: 'ZH',
    name: { de: 'Zürich', fr: 'Zurich', it: 'Zurigo' },
    childAllowance: 268, // CHF 3'216/yr
    educationAllowance: 323, // CHF 3'876/yr
    pvDeadline: '31.03.2026',
    pvAutoOrApplication: {
      de: 'Automatische Vorausberechnung auf Basis der Steuerdaten; Meldefrist für Korrekturen bis 31. März',
      fr: 'Calcul automatique basé sur la taxation fiscale ; délai de réclamation au 31 mars',
      it: 'Calcolo automatico basato sui dati fiscali; termine per reclami entro il 31 marzo'
    },
    sampleRichtpraemie: 4320
  },
  {
    code: 'BE',
    name: { de: 'Bern', fr: 'Berne', it: 'Berna' },
    childAllowance: 230,
    educationAllowance: 290,
    pvDeadline: 'Automatisch / 30 Tage',
    pvAutoOrApplication: {
      de: 'Automatischer Versand des Antragsformulars ab Februar; Einreichung innerhalb 30 Tagen',
      fr: 'Envoi automatique du formulaire dès février ; retour sous 30 jours',
      it: 'Invio automatico del modulo da febbraio; inoltro entro 30 giorni'
    },
    sampleRichtpraemie: 4410
  },
  {
    code: 'BL',
    name: { de: 'Basel-Landschaft', fr: 'Bâle-Campagne', it: 'Basilea Campagna' },
    childAllowance: 240,
    educationAllowance: 290,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Richtprämie Erwachsene CHF 4\'596/Jahr; Gesuchseingabe online via Ausgleichskasse BL',
      fr: 'Prime de référence adulte CHF 4\'596/an ; demande en ligne auprès de la caisse BL',
      it: 'Premio di riferimento adulti CHF 4\'596/anno; richiesta online cassa BL'
    },
    sampleRichtpraemie: 4596
  },
  {
    code: 'BS',
    name: { de: 'Basel-Stadt', fr: 'Bâle-Ville', it: 'Basilea Città' },
    childAllowance: 240,
    educationAllowance: 290,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Automatische Festsetzung bei definitiver Steuerveranlagung',
      fr: 'Fixation automatique lors de la taxation fiscale définitive',
      it: 'Determinazione automatica con la tassazione fiscale definitiva'
    },
    sampleRichtpraemie: 4890
  },
  {
    code: 'SG',
    name: { de: 'St. Gallen', fr: 'Saint-Gall', it: 'San Gallo' },
    childAllowance: 240,
    educationAllowance: 290,
    pvDeadline: '31.05.2026',
    pvAutoOrApplication: {
      de: 'Formularversand erfolgt bis 10. Januar; strikte Einreichfrist bis 31. Mai 2026!',
      fr: 'Formulaire envoyé avant le 10 janvier ; délai de rigueur au 31 mai 2026 !',
      it: 'Invio del modulo entro il 10 gennaio; termine perentorio al 31 maggio 2026!'
    },
    sampleRichtpraemie: 4260
  },
  {
    code: 'LU',
    name: { de: 'Luzern', fr: 'Lucerne', it: 'Lucerna' },
    childAllowance: 230,
    educationAllowance: 280,
    pvDeadline: '31.10.2026',
    pvAutoOrApplication: {
      de: 'Online-Gesuch via Portal WAS Ausgleichskasse Luzern bis 31. Oktober',
      fr: 'Demande en ligne sur le portail WAS Caisse de compensation Lucerne avant le 31 octobre',
      it: 'Domanda online tramite portale WAS Cassa di compensazione Lucerna entro il 31 ottobre'
    },
    sampleRichtpraemie: 3980
  },
  {
    code: 'AG',
    name: { de: 'Aargau', fr: 'Argovie', it: 'Argovia' },
    childAllowance: 230,
    educationAllowance: 280,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Code-Zustellung per Post; Online-Erfassung via SVA Aargau Portal',
      fr: 'Envoi d\'un code par courrier ; saisie en ligne sur le portail SVA Argovie',
      it: 'Invio del codice per posta; inserimento online sul portale SVA Argovia'
    },
    sampleRichtpraemie: 4120
  },
  {
    code: 'VD',
    name: { de: 'Waadt (Vaud)', fr: 'Vaud', it: 'Vaud' },
    childAllowance: 300,
    educationAllowance: 360,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Automatischer Entscheid durch die OCV; Antragstellung für Zuzüger jederzeit',
      fr: 'Décision automatique par l\'OCV ; demande pour nouveaux arrivants possible en tout temps',
      it: 'Decisione automatica da parte dell\'OCV; richiesta per nuovi residenti in qualsiasi momento'
    },
    sampleRichtpraemie: 4980
  },
  {
    code: 'GE',
    name: { de: 'Genf (Genève)', fr: 'Genève', it: 'Ginevra' },
    childAllowance: 311,
    educationAllowance: 415,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Sehr grosszügige Familienzulagen (CHF 311/Mt., CHF 415 in Ausbildung); SAM Genf',
      fr: 'Allocations très généreuses (CHF 311/mois, CHF 415 en formation) ; SAM Genève',
      it: 'Assegni molto generosi (CHF 311/mese, CHF 415 in formazione); SAM Ginevra'
    },
    sampleRichtpraemie: 5210
  },
  {
    code: 'VS',
    name: { de: 'Wallis (Valais)', fr: 'Valais', it: 'Vallese' },
    childAllowance: 305,
    educationAllowance: 415,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Hohe kantonale Kinderzulagen ab CHF 305/Mt.; Gesuch bei der CCVs',
      fr: 'Allocations cantonales élevées dès CHF 305/mois ; demande auprès de la CCVs',
      it: 'Assegni cantonali elevati da CHF 305/mese; richiesta presso la CCVs'
    },
    sampleRichtpraemie: 3950
  },
  {
    code: 'TI',
    name: { de: 'Tessin (Ticino)', fr: 'Tessin', it: 'Ticino' },
    childAllowance: 220,
    educationAllowance: 270,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Anmeldung über Istituto delle assicurazioni sociali (IAS Bellinzona)',
      fr: 'Inscription via l\'Istituto delle assicurazioni sociali (IAS Bellinzona)',
      it: 'Inoltro richiesta tramite Istituto delle assicurazioni sociali (IAS Bellinzona)'
    },
    sampleRichtpraemie: 4380
  },
  {
    code: 'SO',
    name: { de: 'Solothurn', fr: 'Soleure', it: 'Soletta' },
    childAllowance: 230,
    educationAllowance: 280,
    pvDeadline: '31.08.2026',
    pvAutoOrApplication: {
      de: 'Online-Einreichung bei der Ausgleichskasse Solothurn; Frist bis 31. August',
      fr: 'Demande en ligne auprès de la caisse de Soleure ; délai au 31 août',
      it: 'Invio online presso la cassa di Soletta; scadenza al 31 agosto'
    },
    sampleRichtpraemie: 4150
  },
  {
    code: 'TG',
    name: { de: 'Thurgau', fr: 'Thurgovie', it: 'Turgovia' },
    childAllowance: 220,
    educationAllowance: 270,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Prämienverbilligung wird von der Wohngemeinde oder SVATG berechnet',
      fr: 'La réduction des primes est calculée par la commune ou la SVATG',
      it: 'La riduzione dei premi è calcolata dal comune di residenza o dalla SVATG'
    },
    sampleRichtpraemie: 4050
  },
  {
    code: 'ZG',
    name: { de: 'Zug', fr: 'Zoug', it: 'Zugo' },
    childAllowance: 300,
    educationAllowance: 360,
    pvDeadline: '30.04.2026',
    pvAutoOrApplication: {
      de: 'Hohe Zulagen und tiefe Steuern; Gesuchseingabe bis 30. April bei der Ausgleichskasse Zug',
      fr: 'Allocations élevées et fiscalité avantageuse ; demande avant le 30 avril à la caisse de Zoug',
      it: 'Assegni elevati e imposte basse; domanda entro il 30 aprile alla cassa di Zugo'
    },
    sampleRichtpraemie: 3690
  },
  {
    code: 'FR',
    name: { de: 'Freiburg (Fribourg)', fr: 'Fribourg', it: 'Friburgo' },
    childAllowance: 245,
    educationAllowance: 295,
    pvDeadline: '31.08.2026',
    pvAutoOrApplication: {
      de: 'Automatische Zustellung an Berechtigte; Nachmeldungen bis 31. August bei der ECAS',
      fr: 'Envoi automatique aux ayants droit ; demandes tardives jusqu\'au 31 août auprès de l\'ECAS',
      it: 'Invio automatico agli aventi diritto; richieste tardive fino al 31 agosto presso l\'ECAS'
    },
    sampleRichtpraemie: 4420
  },
  {
    code: 'NE',
    name: { de: 'Neuenburg (Neuchâtel)', fr: 'Neuchâtel', it: 'Neuchâtel' },
    childAllowance: 230,
    educationAllowance: 280,
    pvDeadline: '31.10.2026',
    pvAutoOrApplication: {
      de: 'Zuständig ist die Caisse cantonale neuchâteloise de compensation (CCNC)',
      fr: 'Géré par la Caisse cantonale neuchâteloise de compensation (CCNC)',
      it: 'Gestito dalla Cassa cantonale di Neuchâtel (CCNC)'
    },
    sampleRichtpraemie: 4850
  },
  {
    code: 'JU',
    name: { de: 'Jura', fr: 'Jura', it: 'Giura' },
    childAllowance: 280,
    educationAllowance: 330,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'Attraktive kantonale Familienzulagen; Anmeldung via Caisse de compensation du Jura',
      fr: 'Allocations familiales cantonales attractives ; inscription auprès de la Caisse du Jura',
      it: 'Assegni familiari cantonali vantaggiosi; iscrizione presso la Cassa del Giura'
    },
    sampleRichtpraemie: 4790
  },
  {
    code: 'GR',
    name: { de: 'Graubünden', fr: 'Grisons', it: 'Grigioni' },
    childAllowance: 240,
    educationAllowance: 290,
    pvDeadline: '31.12.2026',
    pvAutoOrApplication: {
      de: 'SVA Graubünden prüft Anspruch anhand der Steuerdaten',
      fr: 'La SVA Grisons vérifie les droits selon la déclaration fiscale',
      it: 'La SVA Grigioni verifica il diritto in base alla dichiarazione fiscale'
    },
    sampleRichtpraemie: 3990
  }
];
