const GEO_CONTENT = {
  ch: typeof CH_TRANSLATIONS !== "undefined" ? CH_TRANSLATIONS : {},
  nl: typeof NL_TRANSLATIONS !== "undefined" ? NL_TRANSLATIONS : {},
  be: typeof BE_TRANSLATIONS !== "undefined" ? BE_TRANSLATIONS : {},
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
  nl: {
    flag: "🇳🇱",
    label: "Nederland",
    languages: ["nl"],
    defaultLang: "nl",
    sourceLinks: [
      { href: "https://www.belastingdienst.nl", label: "belastingdienst.nl" },
      { href: "https://www.rijksoverheid.nl", label: "rijksoverheid.nl" },
    ],
  },
  be: {
    flag: "🇧🇪",
    label: "België / Belgique",
    languages: ["nl", "fr"],
    defaultLang: "nl",
    sourceLinks: [
      { href: "https://www.socialsecurity.be", label: "socialsecurity.be" },
      { href: "https://www.belgium.be", label: "belgium.be" },
    ],
  },
};

// Map ISO country codes to geo profile (default: ch)
const COUNTRY_TO_GEO = {
  CH: "ch",
  LI: "ch",
  NL: "nl",
  BE: "be",
};
