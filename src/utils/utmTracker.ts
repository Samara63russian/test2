export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
}

export function extractUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  
  const searchParams = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};

  if (searchParams.get('utm_source')) utm.source = searchParams.get('utm_source') || undefined;
  if (searchParams.get('utm_medium')) utm.medium = searchParams.get('utm_medium') || undefined;
  if (searchParams.get('utm_campaign')) utm.campaign = searchParams.get('utm_campaign') || undefined;
  if (searchParams.get('utm_content')) utm.content = searchParams.get('utm_content') || undefined;
  if (searchParams.get('utm_term')) utm.term = searchParams.get('utm_term') || undefined;
  
  if (document.referrer) {
    utm.referrer = document.referrer;
  }

  // Persist in sessionStorage so multi-page/hash navigations retain UTMs
  if (utm.source || utm.medium || utm.campaign) {
    sessionStorage.setItem('swiss_lead_utm', JSON.stringify(utm));
  } else {
    const saved = sessionStorage.getItem('swiss_lead_utm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
  }

  return utm;
}

export function saveLeadToLocalStorage(lead: any): void {
  try {
    const existing = JSON.parse(localStorage.getItem('swiss_leads_2026') || '[]');
    existing.push({
      ...lead,
      id: 'lead_' + Date.now(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem('swiss_leads_2026', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save lead:', e);
  }
}
