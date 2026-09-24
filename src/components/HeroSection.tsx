import React, { useState } from 'react';
import { Language, LeadSubmission } from '../types';
import { translations } from '../i18n/translations';
import { generateSwissGuidePdf } from '../utils/pdfGenerator';
import { extractUtmParams, saveLeadToLocalStorage } from '../utils/utmTracker';
import { 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  TrendingUp, 
  Sparkles, 
  Lock, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroSectionProps {
  currentLang: Language;
  onOpenPrivacyModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentLang, onOpenPrivacyModal }) => {
  const t = translations[currentLang].hero;

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

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      // Generate & Download the PDF
      generateSwissGuidePdf(currentLang, email, birthYear);
    }, 1200);
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      
      {/* Background Decorative Gradients & Swiss Motif */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-50/50 via-red-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Impact Stats */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-800 text-xs sm:text-sm font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t.mainTitlePrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-700 to-red-800 underline decoration-red-300 decoration-wavy decoration-2">
                {t.mainTitleHighlight}
              </span>
              {t.mainTitleSuffix && ` ${t.mainTitleSuffix}`}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {t.subtitle}
            </p>

            {/* Highlighted Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  {t.stat1Label}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {t.stat1Value}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {t.stat2Label}
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                  {t.stat2Value}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  {t.stat3Label}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {t.stat3Value}
                </div>
              </div>

            </div>

            {/* Micro-Trust line */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t.trustText}</span>
            </div>

          </div>

          {/* Right Column: High-Converting Lead Form Card */}
          <div className="lg:col-span-5" id="lead-form-hero">
            
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 overflow-hidden">
              
              {/* Top Accent Ribbon */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />

              {/* Instant download badge */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>{t.instantDownloadBadge}</span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  PDF • 18 Seiten (2026)
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {t.formTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 mb-6">
                {t.formSubtitle}
              </p>

              {isSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">
                      {currentLang === 'de' ? 'PDF-Download gestartet!' :
                       currentLang === 'fr' ? 'Téléchargement PDF démarré !' :
                       'Download PDF avviato!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                      {currentLang === 'de' ? `Der Leitfaden wurde heruntergeladen und zusätzlich an ${email} gesendet.` :
                       currentLang === 'fr' ? `Le guide a été téléchargé et transmis à ${email}.` :
                       `La guida è stata scaricata e inviata a ${email}.`}
                    </p>
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

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t.emailLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Birth Year Select (2007 / 2008 / 2009 / earlier / later) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{t.birthYearLabel} <span className="text-red-500">*</span></span>
                      <span className="text-[11px] text-slate-400 normal-case font-normal">
                        {currentLang === 'de' ? 'Für Altersgrenzen 16/18/25' : 
                         currentLang === 'fr' ? 'Pour tranches d\'âge 16/18/25' : 
                         'Per fasce d\'età 16/18/25'}
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="2007">{t.birthYearOptions.y2007}</option>
                        <option value="2008">{t.birthYearOptions.y2008}</option>
                        <option value="2009">{t.birthYearOptions.y2009}</option>
                        <option value="earlier">{t.birthYearOptions.earlier}</option>
                        <option value="later">{t.birthYearOptions.later}</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-tight">
                        {t.consentLabel}{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPrivacyModal();
                          }}
                          className="text-red-600 underline font-semibold hover:text-red-700"
                        >
                          {t.consentLink}
                        </button>
                        . <span className="text-slate-400">({currentLang === 'de' ? 'Schweizer FADP / DSG' : currentLang === 'fr' ? 'nLPD / FADP' : 'nLPD / FADP'})</span>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{currentLang === 'de' ? 'Wird vorbereitet...' : currentLang === 'fr' ? 'Préparation...' : 'In preparazione...'}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          <span>{t.ctaButton}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Privacy note */}
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed flex items-center justify-center gap-1.5 pt-1">
                    <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{t.privacyNotice}</span>
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
