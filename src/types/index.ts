export type Language = 'de' | 'fr' | 'it';

export interface CantonData {
  code: string;
  name: {
    de: string;
    fr: string;
    it: string;
  };
  childAllowance: number; // CHF / month (<16)
  educationAllowance: number; // CHF / month (16-25)
  pvDeadline: string; // e.g. "31.05.2026"
  pvAutoOrApplication: {
    de: string;
    fr: string;
    it: string;
  };
  sampleRichtpraemie: number; // CHF / year
}

export interface LeadSubmission {
  email: string;
  birthYear: string;
  consent: boolean;
  language: Language;
  canton?: string;
  timestamp: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}
