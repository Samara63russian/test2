import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { HeartPulse, Users, Award, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PainPointsSectionProps {
  currentLang: Language;
  onOpenLeadModal?: () => void;
}

export const PainPointsSection: React.FC<PainPointsSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].painPoints;

  const scrollToHero = () => {
    const el = document.getElementById('lead-form-hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="claims" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Subtle Glowing Spheres */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.sectionTag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.mainTitle}
          </h2>

          <p className="text-base sm:text-lg text-slate-300">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Major Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Health Insurance (Prämienverbilligung) */}
          <div className="flex flex-col bg-slate-800/80 rounded-3xl p-7 border border-slate-700/80 hover:border-red-500/50 shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                {t.card1.tag}
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>

            {/* Pain / Misconception */}
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/40 mb-5">
              <p className="text-sm font-semibold text-red-200 italic">
                {t.card1.question}
              </p>
            </div>

            {/* Fact / Entitlement */}
            <div className="space-y-3 flex-1">
              <h3 className="text-base font-bold text-white flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t.card1.answerTitle}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.card1.answerText}
              </p>
            </div>

            {/* Bottom Highlight */}
            <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.card1.highlight}
                </div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  {t.card1.stat}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Children & Family Allowances */}
          <div className="flex flex-col bg-slate-800/80 rounded-3xl p-7 border border-slate-700/80 hover:border-emerald-500/50 shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {t.card2.tag}
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Pain / Misconception */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 mb-5">
              <p className="text-sm font-semibold text-slate-200 italic">
                {t.card2.question}
              </p>
            </div>

            {/* Fact / Entitlement */}
            <div className="space-y-3 flex-1">
              <h3 className="text-base font-bold text-white flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t.card2.answerTitle}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.card2.answerText}
              </p>
            </div>

            {/* Bottom Highlight */}
            <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.card2.highlight}
                </div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  {t.card2.stat}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Pensioners & Supplementary Benefits (EL) */}
          <div className="flex flex-col bg-slate-800/80 rounded-3xl p-7 border border-slate-700/80 hover:border-blue-500/50 shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                {t.card3.tag}
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
            </div>

            {/* Pain / Misconception */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 mb-5">
              <p className="text-sm font-semibold text-slate-200 italic">
                {t.card3.question}
              </p>
            </div>

            {/* Fact / Entitlement */}
            <div className="space-y-3 flex-1">
              <h3 className="text-base font-bold text-white flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t.card3.answerTitle}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.card3.answerText}
              </p>
            </div>

            {/* Bottom Highlight */}
            <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.card3.highlight}
                </div>
                <div className="text-base font-extrabold text-blue-400 font-mono">
                  {t.card3.stat}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action strip below cards */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-slate-800/80 to-slate-800/80 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white">
              {currentLang === 'de' ? 'Möchtest du genau wissen, was dir in deinem Wohnkanton zusteht?' :
               currentLang === 'fr' ? 'Souhaitez-vous savoir exactement ce qui vous revient dans votre canton ?' :
               'Vuoi sapere esattamente a quanto hai diritto nel tuo Cantone?'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentLang === 'de' ? 'Der kostenlose 18-Seiten Leitfaden schlüsselt alle kantonalen Richtprämien & Ausgleichskassen auf.' :
               currentLang === 'fr' ? 'Le guide gratuit de 18 pages détaille l\'ensemble des primes de référence cantonales.' :
               'La guida gratuita di 18 pagine elenca tutti i premi di riferimento cantonali e le casse.'}
            </p>
          </div>

          <button
            onClick={scrollToHero}
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
          >
            <span>
              {currentLang === 'de' ? 'Jetzt Leitfaden herunterladen' :
               currentLang === 'fr' ? 'Télécharger le guide maintenant' :
               'Scarica subito la guida'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </section>
  );
};
