import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { ShieldCheck, X } from 'lucide-react';

interface CookieBannerProps {
  currentLang: Language;
  onOpenPrivacy: () => void;
  onOpenCookieSettings: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  currentLang,
  onOpenPrivacy,
  onOpenCookieSettings
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('swiss_cookie_consent_2026');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('swiss_cookie_consent_2026', 'all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('swiss_cookie_consent_2026', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold text-white">
            {currentLang === 'de' ? 'Datenschutz & Cookies (nDSG)' :
             currentLang === 'fr' ? 'Confidentialité & Cookies (nLPD)' :
             'Privacy & Cookie (nLPD)'}
          </h4>
        </div>
        <button
          onClick={handleAcceptEssential}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {currentLang === 'de' ? 'Wir nutzen Cookies und Tracking, um dir den Leitfaden zur Verfügung zu stellen und Reichweitenmessungen durchzuführen. Details in unserer ' :
         currentLang === 'fr' ? 'Nous utilisons des cookies pour vous fournir le guide et analyser l\'audience. Détails dans notre ' :
         'Utilizziamo cookie per fornirti la guida e misurare le visite. Dettagli nella nostra '}
        <button
          onClick={onOpenPrivacy}
          className="text-red-400 underline font-semibold hover:text-red-300"
        >
          Datenschutzerklärung
        </button>
        .
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleAcceptAll}
          className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          {currentLang === 'de' ? 'Alle akzeptieren' : currentLang === 'fr' ? 'Tout accepter' : 'Accetta tutti'}
        </button>
        <button
          onClick={handleAcceptEssential}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
        >
          {currentLang === 'de' ? 'Nur essenzielle' : currentLang === 'fr' ? 'Essentiels seuls' : 'Solo essenziali'}
        </button>
      </div>
    </div>
  );
};
