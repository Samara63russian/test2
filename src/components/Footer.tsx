import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Shield, Lock, FileText, ExternalLink } from 'lucide-react';

interface FooterProps {
  currentLang: Language;
  onOpenImpressum: () => void;
  onOpenPrivacy: () => void;
  onOpenCookies: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenImpressum,
  onOpenPrivacy,
  onOpenCookies
}) => {
  const t = translations[currentLang].footer;

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute w-4 h-1 bg-white rounded-sm"></div>
                  <div className="absolute w-1 h-4 bg-white rounded-sm"></div>
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Schweizer Auszahlungs-Kompass 2026
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {t.tagline}
            </p>

            <div className="text-[11px] text-slate-500 font-mono">
              {t.securityNote}
            </div>
          </div>

          {/* Legal Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {currentLang === 'de' ? 'Rechtliches & Konformität' : currentLang === 'fr' ? 'Mentions Légales & Droits' : 'Note Legali & Conformità'}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenImpressum}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.impressum}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.privacy}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCookies}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t.cookies}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {currentLang === 'de' ? 'Offizielle Bundesstellen' : currentLang === 'fr' ? 'Services Officiels' : 'Servizi Federali'}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.bsv.admin.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span>BSV / OFAS / UFAS Admin</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ahv-iv.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Ausgleichskassen AHV/IV</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.gdk-cds.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span>GDK / CDS Gesundheitsdirektoren</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900 text-[11px] text-slate-500 leading-relaxed">
          {t.disclaimer}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Swiss Benefits Guide. {t.rights}
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>🇨🇭 Made for Switzerland</span>
            <span>•</span>
            <span>HTTPS Secured</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
