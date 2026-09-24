import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PainPointsSection } from './components/PainPointsSection';
import { BenefitsCalculator } from './components/BenefitsCalculator';
import { GuideContentSection } from './components/GuideContentSection';
import { SecondaryCtaSection } from './components/SecondaryCtaSection';
import { TrustSourcesSection } from './components/TrustSourcesSection';
import { FaqSection } from './components/FaqSection';
import { UrgencySection } from './components/UrgencySection';
import { TrafficAttributionSection } from './components/TrafficAttributionSection';
import { Footer } from './components/Footer';
import { LegalModals } from './components/LegalModals';
import { CookieBanner } from './components/CookieBanner';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('de');
  const [activeLegalModal, setActiveLegalModal] = useState<'impressum' | 'privacy' | 'cookies' | null>(null);

  // Initialize language from URL param if available (e.g. ?lang=fr or ?lang=it)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam === 'fr' || langParam === 'it' || langParam === 'de') {
      setCurrentLang(langParam as Language);
    }
  }, []);

  // Update page document title & meta tags when language changes
  useEffect(() => {
    document.title = translations[currentLang].meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', translations[currentLang].meta.description);
    }
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* 1. Header & Navigation with Multi-Language Switcher */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        
        {/* 2. Hero Section with Value Prop, Stats, and Primary Lead Capture Form */}
        <HeroSection
          currentLang={currentLang}
          onOpenPrivacyModal={() => setActiveLegalModal('privacy')}
        />

        {/* 3. Problem / Misconceptions Breakdown Cards (300+ CHF insurance, 2 kids, pensioner) */}
        <PainPointsSection
          currentLang={currentLang}
        />

        {/* 4. Interactive Cantonal Benefits & Deadline Calculator */}
        <BenefitsCalculator
          currentLang={currentLang}
        />

        {/* 5. What's Inside the 18-page Guide (7 Pillars) */}
        <GuideContentSection
          currentLang={currentLang}
        />

        {/* 6. Secondary High-Conversion CTA Form with instant PDF generator */}
        <SecondaryCtaSection
          currentLang={currentLang}
          onOpenPrivacyModal={() => setActiveLegalModal('privacy')}
        />

        {/* 7. Urgency & Deadlines Alert (St. Gallen 31 May, EL, FamZG) */}
        <UrgencySection
          currentLang={currentLang}
        />

        {/* 8. Trust & Official Legal Sources (BSV, GDK, AHV/IV, PwC, OECD) */}
        <TrustSourcesSection
          currentLang={currentLang}
        />

        {/* 9. Comprehensive FAQ Accordion */}
        <FaqSection
          currentLang={currentLang}
        />

        {/* 10. Traffic Sources & UTM Campaign Attribution Engine */}
        <TrafficAttributionSection
          currentLang={currentLang}
        />

      </main>

      {/* 11. Swiss Law Compliant Footer */}
      <Footer
        currentLang={currentLang}
        onOpenImpressum={() => setActiveLegalModal('impressum')}
        onOpenPrivacy={() => setActiveLegalModal('privacy')}
        onOpenCookies={() => setActiveLegalModal('cookies')}
      />

      {/* 12. Legal Modals (Impressum, FADP Privacy, Cookie Settings) */}
      <LegalModals
        currentLang={currentLang}
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* 13. Swiss FADP / GDPR Opt-In Cookie Consent Banner */}
      <CookieBanner
        currentLang={currentLang}
        onOpenPrivacy={() => setActiveLegalModal('privacy')}
        onOpenCookieSettings={() => setActiveLegalModal('cookies')}
      />

    </div>
  );
};

export default App;
