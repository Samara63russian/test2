import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { CalendarClock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface UrgencySectionProps {
  currentLang: Language;
}

export const UrgencySection: React.FC<UrgencySectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].urgency;

  const scrollToHero = () => {
    const el = document.getElementById('lead-form-hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white relative overflow-hidden">
      
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs sm:text-sm font-bold">
            <CalendarClock className="w-4 h-4" />
            <span>Fristen 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t.title}
          </h2>

          <p className="text-base sm:text-lg text-red-100">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Deadline Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {t.deadlines.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-2 hover:bg-white/15 transition-all"
            >
              <div className="text-xs font-bold text-red-200 uppercase tracking-wider">
                {item.benefit}
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {item.date}
              </div>
              <div className="text-xs text-red-100/90 pt-1 border-t border-white/10">
                {item.note}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={scrollToHero}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-red-600 font-extrabold text-base sm:text-lg shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            <span>{t.ctaText}</span>
            <ArrowRight className="w-5 h-5 text-red-600" />
          </button>
        </div>

      </div>

    </section>
  );
};
