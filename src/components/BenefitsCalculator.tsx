import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { swissCantons } from '../data/cantons';
import { 
  Calculator, 
  MapPin, 
  Users, 
  BadgePercent, 
  CalendarClock, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface BenefitsCalculatorProps {
  currentLang: Language;
}

export const BenefitsCalculator: React.FC<BenefitsCalculatorProps> = ({ currentLang }) => {
  const t = translations[currentLang].calculator;

  const [selectedCanton, setSelectedCanton] = useState<string>('ZH');
  const [householdType, setHouseholdType] = useState<'single' | 'couple' | 'family' | 'pensioner'>('family');
  const [childrenCount, setChildrenCount] = useState<number>(2);
  const [incomeBracket, setIncomeBracket] = useState<'low' | 'med' | 'high'>('low');

  const cantonInfo = useMemo(() => {
    return swissCantons.find(c => c.code === selectedCanton) || swissCantons[0];
  }, [selectedCanton]);

  // Dynamic estimate calculation based on official 2026 heuristics
  const estimatedBenefits = useMemo(() => {
    let total = 0;
    let pvAmount = 0;
    let familyAmount = 0;
    let elAmount = 0;
    let taxSaved = 0;

    // 1. Health insurance premium subsidy (IPV)
    if (incomeBracket === 'low') {
      pvAmount = Math.round(cantonInfo.sampleRichtpraemie * (householdType === 'couple' ? 1.8 : householdType === 'family' ? 2.2 : 0.9));
    } else if (incomeBracket === 'med') {
      pvAmount = Math.round(cantonInfo.sampleRichtpraemie * 0.45 * (householdType === 'family' ? 1.6 : 1));
    } else {
      pvAmount = householdType === 'family' ? 800 : 0;
    }

    // 2. Family allowance
    if (householdType === 'family' && childrenCount > 0) {
      familyAmount = cantonInfo.childAllowance * 12 * childrenCount;
    }

    // 3. Ergänzungsleistungen (EL)
    if (householdType === 'pensioner') {
      if (incomeBracket === 'low') {
        elAmount = 14500;
      } else if (incomeBracket === 'med') {
        elAmount = 4200;
      }
    }

    // 4. Tax savings deductions
    if (householdType === 'family' && childrenCount > 0) {
      taxSaved = childrenCount * 1200;
    } else if (incomeBracket === 'low') {
      taxSaved = 600;
    }

    total = pvAmount + familyAmount + elAmount + taxSaved;

    return {
      total,
      pvAmount,
      familyAmount,
      elAmount,
      taxSaved
    };
  }, [selectedCanton, householdType, childrenCount, incomeBracket, cantonInfo]);

  const scrollToHero = () => {
    const el = document.getElementById('lead-form-hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="calculator" className="py-20 md:py-28 bg-slate-50 border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold shadow-sm">
            <Calculator className="w-4 h-4" />
            <span>{t.sectionTag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Main Calculator Interactive Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Controls Left Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            
            {/* 1. Canton Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>{t.cantonLabel}</span>
              </label>
              <select
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all cursor-pointer"
              >
                {swissCantons.map((canton) => (
                  <option key={canton.code} value={canton.code}>
                    {canton.name[currentLang]} ({canton.code}) — Kinderzulage: CHF {canton.childAllowance}/Mt.
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Household Structure */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                <span>{t.householdLabel}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'single', label: t.householdSingle },
                  { id: 'couple', label: t.householdCouple },
                  { id: 'family', label: t.householdFamily },
                  { id: 'pensioner', label: t.householdPensioner }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHouseholdType(item.id as any)}
                    className={`py-3 px-3 text-xs sm:text-xs font-bold rounded-xl border text-center transition-all ${
                      householdType === item.id
                        ? 'bg-red-50 text-red-700 border-red-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Number of children (conditional if family) */}
            {householdType === 'family' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.childrenLabel}
                  </span>
                  <span className="text-sm font-mono font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {childrenCount} {childrenCount === 1 ? 'Kind' : 'Kinder'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(parseInt(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>1 Kind</span>
                  <span>2 Kinder</span>
                  <span>3 Kinder</span>
                  <span>4 Kinder</span>
                  <span>5+ Kinder</span>
                </div>
              </div>
            )}

            {/* 4. Income bracket */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-red-600" />
                <span>{t.incomeBracketLabel}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'low', label: t.incomeLow },
                  { id: 'med', label: t.incomeMed },
                  { id: 'high', label: t.incomeHigh }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIncomeBracket(item.id as any)}
                    className={`py-3 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      incomeBracket === item.id
                        ? 'bg-red-50 text-red-700 border-red-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantonal Deadline Notice */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <CalendarClock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t.cantonDeadlines} </span>
                <span>{cantonInfo.pvAutoOrApplication[currentLang]} </span>
                <span className="font-semibold text-amber-800 underline decoration-amber-400">
                  (Frist: {cantonInfo.pvDeadline})
                </span>
              </div>
            </div>

          </div>

          {/* Results Right Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-10 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
            
            <div className="space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.resultTitle}</span>
                </div>
                
                {/* Big Number */}
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 text-sm font-semibold">{t.resultPotential}</span>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                    {estimatedBenefits.total.toLocaleString('de-CH')} .–
                  </span>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  CHF {t.perYear} ({cantonInfo.name[currentLang]})
                </span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.breakdownTitle}
                </div>

                {estimatedBenefits.pvAmount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{t.itemPV}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ca. CHF {estimatedBenefits.pvAmount.toLocaleString('de-CH')}
                    </span>
                  </div>
                )}

                {estimatedBenefits.familyAmount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{t.itemFamily}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      CHF {estimatedBenefits.familyAmount.toLocaleString('de-CH')}
                    </span>
                  </div>
                )}

                {estimatedBenefits.elAmount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">{t.itemEL}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      bis CHF {estimatedBenefits.elAmount.toLocaleString('de-CH')}
                    </span>
                  </div>
                )}

                {estimatedBenefits.taxSaved > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5">
                    <span className="text-slate-300">{t.itemTax}</span>
                    <span className="font-mono font-bold text-blue-400">
                      ca. CHF {estimatedBenefits.taxSaved.toLocaleString('de-CH')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {currentLang === 'de' ? 'Unverbindliche Schätzung basierend auf Bundesgesetzen & kantonalen Richtprämien 2026.' :
                   currentLang === 'fr' ? 'Estimation indicative basée sur les lois fédérales et primes cantonales 2026.' :
                   'Stima indicativa basata sulle leggi federali e premi di riferimento cantonali 2026.'}
                </span>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-6">
              <button
                onClick={scrollToHero}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
              >
                <span>{t.calcCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
