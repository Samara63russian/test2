import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Globe, ShieldCheck, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenLeadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLanguageChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = translations[currentLang].nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languageLabels: Record<Language, { label: string; flag: string; short: string }> = {
    de: { label: 'Deutsch (Schweiz)', flag: '🇨🇭 DE', short: 'DE' },
    fr: { label: 'Français (Suisse)', flag: '🇨🇭 FR', short: 'FR' },
    it: { label: 'Italiano (Svizzera)', flag: '🇨🇭 IT', short: 'IT' }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3' 
        : 'bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              {/* Swiss Cross */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <div className="absolute w-5 h-1.5 bg-white rounded-sm"></div>
                <div className="absolute w-1.5 h-5 bg-white rounded-sm"></div>
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-2">
                {t.brandName}
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full border border-red-200">
                  2026
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.brandSubtitle}</span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => scrollToSection('claims')} 
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {t.claims}
            </button>
            <button 
              onClick={() => scrollToSection('calculator')} 
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {t.calculator}
            </button>
            <button 
              onClick={() => scrollToSection('guide-content')} 
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {t.guideContent}
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {t.faq}
            </button>
            <button 
              onClick={() => scrollToSection('sources')} 
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {t.sources}
            </button>
          </nav>

          {/* Right Area: Language Switcher + CTA */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4 text-red-600" />
                <span>{languageLabels[currentLang].flag}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Sprache / Langue / Lingua
                    </div>
                    {(['de', 'fr', 'it'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onLanguageChange(lang);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                          currentLang === lang 
                            ? 'bg-red-50 text-red-700 font-bold' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-600" style={{ opacity: currentLang === lang ? 1 : 0 }} />
                          {languageLabels[lang].label}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {languageLabels[lang].short}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Header CTA Button */}
            <button
              onClick={() => scrollToSection('lead-form-hero')}
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <span>{t.ctaButton}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            <button 
              onClick={() => scrollToSection('claims')} 
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              {t.claims}
            </button>
            <button 
              onClick={() => scrollToSection('calculator')} 
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              {t.calculator}
            </button>
            <button 
              onClick={() => scrollToSection('guide-content')} 
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              {t.guideContent}
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              {t.faq}
            </button>
            <button 
              onClick={() => scrollToSection('sources')} 
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              {t.sources}
            </button>
            
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => scrollToSection('lead-form-hero')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md text-sm"
              >
                <span>{t.ctaButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
