const GEO_CONTENT = {
  ch: typeof CH_TRANSLATIONS !== "undefined" ? CH_TRANSLATIONS : {},
  de: typeof DE_TRANSLATIONS !== "undefined" ? DE_TRANSLATIONS : {},
};

const GEO_META = {
  ch: {
    flag: "🇨🇭",
    label: "Schweiz",
    languages: ["de", "fr", "it"],
    defaultLang: "de",
    sourceLinks: [
      { href: "https://ahv-iv.ch", label: "ahv-iv.ch" },
      { href: "https://gdk-cds.ch", label: "gdk-cds.ch" },
    ],
  },
  de: {
    flag: "🇩🇪",
    label: "Deutschland",
    languages: ["de"],
    defaultLang: "de",
    sourceLinks: [
      { href: "https://www.arbeitsagentur.de", label: "arbeitsagentur.de" },
      { href: "https://www.bundesregierung.de", label: "bundesregierung.de" },
    ],
  },
};

// Map ISO country codes to geo profile
const COUNTRY_TO_GEO = {
  CH: "ch",
  LI: "ch",
  DE: "de",
  AT: "de",
};
