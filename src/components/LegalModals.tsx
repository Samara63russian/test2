import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { X, ShieldCheck, Lock, FileText, Check } from 'lucide-react';

interface LegalModalsProps {
  currentLang: Language;
  activeModal: 'impressum' | 'privacy' | 'cookies' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ currentLang, activeModal, onClose }) => {
  const t = translations[currentLang].legalModals;

  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto z-10 space-y-6 text-slate-800 text-sm">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {activeModal === 'impressum' && <FileText className="w-5 h-5 text-red-600" />}
            {activeModal === 'privacy' && <Lock className="w-5 h-5 text-red-600" />}
            {activeModal === 'cookies' && <ShieldCheck className="w-5 h-5 text-red-600" />}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {activeModal === 'impressum' && t.impressumTitle}
              {activeModal === 'privacy' && t.privacyTitle}
              {activeModal === 'cookies' && t.cookieTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. IMPRESSUM CONTENT (Swiss UWG Art. 3 Abs. 1 lit. s compliant) */}
        {activeModal === 'impressum' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Angaben gemäss Schweizer Recht (UWG Art. 3 Abs. 1 lit. s):</h4>
              <p className="font-mono text-xs text-slate-800">
                <strong>Betreiber & Redaktion:</strong><br />
                Schweizer Auszahlungs-Kompass 2026<br />
                Informationsplattform & Leitfaden-Service<br />
                Gotthardstrasse 26<br />
                CH-8002 Zürich, Schweiz
              </p>
              <p className="mt-2 text-xs">
                <strong>Kontakt:</strong> kontakt@auszahlungen-schweiz-2026.ch<br />
                <strong>Vertretungsberechtigte Person:</strong> Redaktionsleitung Schweiz
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Zweck des Angebots:</h4>
              <p>
                Bereitstellung von kostenlosen, redaktionell recherchierten Leitfäden zu gesetzlichen Ansprüchen in der Schweiz (Familienzulagen FamZG, Krankenkassen-Prämienverbilligung KVG, Ergänzungsleistungen ELG).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Haftungsausschluss:</h4>
              <p>
                Die Inhalte dieses Leitfadens und dieser Webseite wurden mit grösstmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte wird jedoch keine Gewähr übernommen. Es handelt sich um eine Informationsdienstleistung, nicht um eine Rechts- oder Versicherungsberatung.
              </p>
            </div>
          </div>
        )}

        {/* 2. PRIVACY POLICY (Swiss FADP / nDSG & EU GDPR compliant) */}
        {activeModal === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
              <strong>Konformitäts-Status:</strong> Vollständig konform mit dem revidierten Schweizer Bundesgesetz über den Datenschutz (nDSG / FADP) sowie der EU-DSGVO.
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">1. Erhebung und Bearbeitung von Personendaten</h4>
              <p>
                Wir erheben ausschliesslich die im Formular angegebenen Daten (E-Mail-Adresse, Geburtsjahrgang) sowie technische Metadaten (Zeitstempel, Referrer/UTM-Parameter) zum Zweck des PDF-Versands und zur personalisierten Fristen-Erinnerung.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">2. Weitergabe an Dritte & Hosting</h4>
              <p>
                Eine Weitergabe oder ein Verkauf deiner Personendaten an Dritte findet unter keinen Umständen statt. Sämtliche Systeme sind per SSL/TLS (256-Bit) verschlüsselt.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">3. Deine Rechte (Auskunft & Löschung)</h4>
              <p>
                Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten sowie ein Recht auf Berichtigung, Sperrung oder vollständige Löschung («Recht auf Vergessenwerden»). Eine Abmeldung aus unserem Verteiler ist jederzeit mit einem einzigen Klick möglich.
              </p>
            </div>
          </div>
        )}

        {/* 3. COOKIE & PRIVACY SETTINGS */}
        {activeModal === 'cookies' && (
          <div className="space-y-5 text-xs sm:text-sm text-slate-600">
            <p>
              Wir verwenden Technologien, um deine Präferenzen (Sprachauswahl, Formularstatus) zu speichern und die Nutzung unseres Leitfadens anonymisiert zu verbessern.
            </p>

            {/* Essential Cookies */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Essenzielle Cookies & SessionStorage</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">Immer aktiv</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Notwendig für die Sprachauswahl (DE/FR/IT) und die PDF-Generierung.
                </div>
              </div>
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            </div>

            {/* Analytics Cookies */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">
                  Anonymisierte Reichweitenmessung
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Hilft uns zu verstehen, aus welchen Kantonen der Leitfaden aufgerufen wird.
                </div>
              </div>
              <input
                type="checkbox"
                checked={analyticsCookies}
                onChange={(e) => setAnalyticsCookies(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded cursor-pointer"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">
                  Kampagnen-Attribution (UTM-Tracking)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ordnet Downloads den entsprechenden Werbekanälen zu.
                </div>
              </div>
              <input
                type="checkbox"
                checked={marketingCookies}
                onChange={(e) => setMarketingCookies(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={() => {
                  setAnalyticsCookies(true);
                  setMarketingCookies(true);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm text-center shadow transition-colors"
              >
                {t.acceptAll}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm text-center transition-colors"
              >
                {t.essentialOnly}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>

    </div>
  );
};
