import React, { useState } from 'react';
import { Language, LeadSubmission } from '../types';
import { translations } from '../i18n/translations';
import { generateSwissGuidePdf } from '../utils/pdfGenerator';
import { extractUtmParams, saveLeadToLocalStorage } from '../utils/utmTracker';
import { 
  FileDown, 
  CheckCircle, 
  ShieldCheck, 
  Calendar, 
  Lock, 
  AlertCircle,
  Download,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecondaryCtaSectionProps {
  currentLang: Language;
  onOpenPrivacyModal: () => void;
}

export const SecondaryCtaSection: React.FC<SecondaryCtaSectionProps> = ({ currentLang, onOpenPrivacyModal }) => {
  const t = translations[currentLang].secondaryCta;

  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('2007');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage(
        currentLang === 'de' ? 'Bitte gib eine gültige E-Mail-Adresse ein.' :
        currentLang === 'fr' ? 'Veuillez saisir une adresse e-mail valide.' :
        'Inserisci un indirizzo e-mail valido.'
      );
      return;
    }

    if (!consent) {
      setErrorMessage(
        currentLang === 'de' ? 'Bitte akzeptiere die Datenschutzerklärung.' :
        currentLang === 'fr' ? 'Veuillez accepter la déclaration de confidentialité.' :
        'Accetta l\'informativa sulla privacy per procedere.'
      );
      return;
    }

    setIsSubmitting(true);

    const utm = extractUtmParams();
    const lead: LeadSubmission = {
      email,
      birthYear,
      consent,
      language: currentLang,
      timestamp: new Date().toISOString(),
      utm
    };

    saveLeadToLocalStorage(lead);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      generateSwissGuidePdf(currentLang, email, birthYear);
    }, 1200);
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Benefits & Guarantee */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{t.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t.title}
            </h2>

            <p className="text-base sm:text-lg text-slate-300">
              {t.subtitle}
            </p>

            <ul className="space-y-3 pt-2">
              {t.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{t.guaranteeTitle}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.guaranteeText}
              </p>
            </div>

          </div>

          {/* Right Column: Lead Form Card with Green/Red CTA */}
          <div className="lg:col-span-5">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {currentLang === 'de' ? 'Leitfaden 2026 herunterladen' :
                     currentLang === 'fr' ? 'Télécharger le guide 2026' :
                     'Scarica la guida 2026'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    PDF • Sofort-Download • 100% Kostenlos
                  </p>
                </div>
              </div>

              {isSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900">
                      {t.successMsg}
                    </h4>
                  </div>
                  <button
                    onClick={() => generateSwissGuidePdf(currentLang, email, birthYear)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {currentLang === 'de' ? 'PDF erneut herunterladen' :
                       currentLang === 'fr' ? 'Télécharger à nouveau le PDF' :
                       'Scarica di nuovo il PDF'}
                    </span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t.emailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beispiel.ch"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{t.birthYearLabel}</span>
                    </label>
                    <div className="relative">
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="2007">2007</option>
                        <option value="2008">2008</option>
                        <option value="2009">2009</option>
                        <option value="earlier">
                          {currentLang === 'de' ? 'Vor 2007 (Erwachsene / Rentner)' :
                           currentLang === 'fr' ? 'Avant 2007 (Adultes / Retraités)' :
                           'Prima del 2007 (Adulti / Pensionati)'}
                        </option>
                        <option value="later">
                          {currentLang === 'de' ? 'Nach 2009' :
                           currentLang === 'fr' ? 'Après 2009' :
                           'Dopo il 2009'}
                        </option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-tight">
                        {t.consentLabel}{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPrivacyModal();
                          }}
                          className="text-emerald-700 underline font-semibold hover:text-emerald-800"
                        >
                          Datenschutzerklärung
                        </button>
                        .
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t.downloading}</span>
                        </>
                      ) : (
                        <span>{t.submitBtn}</span>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed flex items-center justify-center gap-1.5 pt-1">
                    <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{t.privacyNote}</span>
                  </p>

                </form>
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
