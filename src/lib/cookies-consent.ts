const STORAGE_KEY = "leconomie_cookie_consent";
const CONSENT_DURATION_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 mois

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export function getConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const prefs: CookiePreferences = JSON.parse(raw);
    if (Date.now() - prefs.timestamp > CONSENT_DURATION_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return prefs;
  } catch {
    return null;
  }
}

export function setConsent(prefs: Omit<CookiePreferences, "essential" | "timestamp">) {
  const consent: CookiePreferences = {
    essential: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-update", { detail: consent }));
  return consent;
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics ?? false;
}

export function hasMarketingConsent(): boolean {
  const consent = getConsent();
  return consent?.marketing ?? false;
}
