import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { 
  FileCheck2, 
  Baby, 
  HeartHandshake, 
  Coins, 
  CalendarRange, 
  Home, 
  Calculator, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface GuideContentSectionProps {
  currentLang: Language;
}

export const GuideContentSection: React.FC<GuideContentSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].guide;

  const icons = [
    Baby,            // 1. Familienzulagen
    HeartHandshake,  // 2. Prämienverbilligung
    Coins,           // 3. Ergänzungsleistungen
    CalendarRange,   // 4. AHV-Renten Auszahlungstermine
    Home,            // 5. Mietzinsbeiträge
    Calculator,      // 6. Steuerabzüge
    HelpCircle       // 7. FAQ & Aufenthaltsstatus
  ];

  const scrollToHero = () => {
    const el = document.getElementById('lead-form-hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="guide-content" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold shadow-sm">
            <FileCheck2 className="w-4 h-4" />
            <span>{t.sectionTag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* 7 Content Pillars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((feature, idx) => {
            const IconComponent = icons[idx] || FileCheck2;
            return (
              <div
                key={idx}
                className="flex flex-col bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-red-500/50 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/60 text-slate-700 font-mono">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                  {feature.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center text-xs font-bold text-red-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{currentLang === 'de' ? 'Im PDF enthalten' : currentLang === 'fr' ? 'Inclus dans le PDF' : 'Incluso nel PDF'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <button
            onClick={scrollToHero}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-600/20 hover:shadow-xl transition-all cursor-pointer"
          >
            <span>{currentLang === 'de' ? '📄 Kompletten Leitfaden als PDF sichern' : currentLang === 'fr' ? '📄 Obtenir le guide complet en PDF' : '📄 Ottieni la guida completa in PDF'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
