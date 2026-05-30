// Cookie consent state + helpers.
// All client-side: this file is imported by the cookie-banner component.
// localStorage key is versioned so bumping CONSENT_VERSION invalidates old
// choices and re-prompts users (GDPR best practice when policy changes).

export const CONSENT_STORAGE_KEY = "fn-cookie-consent-v1";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "fn:cookie-consent-changed";

export type ConsentCategory = "necessary" | "analytics";

export type ConsentChoice = {
  /** Always granted: necessary cookies cannot be opted out. */
  necessary: true;
  /** GA4 + analytics tracking. */
  analytics: boolean;
  /** ISO timestamp of when the user expressed the choice. */
  decidedAt: string;
  /** Version of the consent schema (matches CONSENT_VERSION). */
  version: number;
};

export const DEFAULT_DENIED: ConsentChoice = {
  necessary: true,
  analytics: false,
  decidedAt: new Date(0).toISOString(),
  version: CONSENT_VERSION,
};

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
      version: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

/** Push current analytics consent state to Google Consent Mode v2. */
export function applyConsentToGoogle(choice: Pick<ConsentChoice, "analytics">): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      analytics_storage: choice.analytics ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function writeConsent(choice: Omit<ConsentChoice, "necessary" | "version" | "decidedAt">): ConsentChoice {
  const full: ConsentChoice = {
    necessary: true,
    analytics: choice.analytics,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
    window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: full }));
    applyConsentToGoogle(full);
  }
  return full;
}

/** Programmatically reopen the banner (e.g. from a "manage cookies" footer link). */
export function openBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fn:cookie-banner-open"));
}
