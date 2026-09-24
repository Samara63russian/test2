import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { ShieldCheck, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';

interface TrustSourcesSectionProps {
  currentLang: Language;
}

export const TrustSourcesSection: React.FC<TrustSourcesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].sources;

  return (
    <section id="sources" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-sm">
            <Scale className="w-4 h-4" />
            <span>{t.sectionTag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Disclaimer Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {t.disclaimerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.disclaimerText}
              </p>
            </div>
          </div>
        </div>

        {/* Official Sources 4-Card Grid */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center sm:text-left">
            {t.officialPortals}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.sourcesList.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      CH-Recht
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">
                    {source.name}
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {source.role}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400 group-hover:text-slate-700">
                  {source.url.replace('https://', '')}
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
