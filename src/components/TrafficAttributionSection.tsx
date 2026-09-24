import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { extractUtmParams, UtmParams } from '../utils/utmTracker';
import { Share2, Tag, Compass, Layers, Globe2, Link2, Copy, Check } from 'lucide-react';

interface TrafficAttributionSectionProps {
  currentLang: Language;
}

export const TrafficAttributionSection: React.FC<TrafficAttributionSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].trafficSources;
  const [utm, setUtm] = useState<UtmParams>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    setUtm(extractUtmParams());
  }, []);

  const sampleChannels = [
    {
      name: 'Google Ads / Search',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'praemienverbilligung_2026',
      badge: 'SEA'
    },
    {
      name: 'Meta Ads (Facebook & Instagram)',
      utm_source: 'meta',
      utm_medium: 'paid_social',
      utm_campaign: 'familienzulagen_schweiz',
      badge: 'Paid Social'
    },
    {
      name: 'TikTok Ads',
      utm_source: 'tiktok',
      utm_medium: 'video_feed',
      utm_campaign: 'auszahlungen_leitfaden_young',
      badge: 'Video Feed'
    },
    {
      name: 'Kantonale Foren & Portale',
      utm_source: 'community_forum',
      utm_medium: 'referral',
      utm_campaign: 'el_pensioners_guide',
      badge: 'Organic / Referral'
    }
  ];

  const copyChannelUrl = (source: string, medium: string, campaign: string) => {
    const url = `${window.location.origin}${window.location.pathname}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&lang=${currentLang}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(source);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <section className="py-14 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-red-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Live Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Touch UTM Parameter Tracker & Attribution Matrix für Schweizer Traffic-Kampagnen
              </p>
            </div>
          </div>

          {/* Current Visitor Detection Pill */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">{t.currentSource}</span>
            <span className="font-bold text-white">
              {utm.source ? `${utm.source} / ${utm.medium || 'direct'}` : t.directSource}
            </span>
          </div>
        </div>

        {/* Traffic Channels Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleChannels.map((channel, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    {channel.badge}
                  </span>
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h4 className="text-xs font-bold text-white">
                  {channel.name}
                </h4>
                <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                  <div>utm_source={channel.utm_source}</div>
                  <div>utm_medium={channel.utm_medium}</div>
                  <div>utm_campaign={channel.utm_campaign}</div>
                </div>
              </div>

              <button
                onClick={() => copyChannelUrl(channel.utm_source, channel.utm_medium, channel.utm_campaign)}
                className="w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedUrl === channel.utm_source ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kampagnen-Link</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
