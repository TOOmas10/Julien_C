/**
 * Gestion du consentement cookies (côté navigateur uniquement).
 * Le choix est stocké dans un vrai cookie first-party « jc_consent »,
 * valable 6 mois (recommandation CNIL), puis la question est reposée.
 */
import { CONSENT_MAX_AGE_DAYS } from "./site";

export type Consent = {
  /** Version des catégories : l'incrémenter pour redemander le consentement. */
  v: number;
  analytics: boolean;
  /** Date du choix (ms) */
  t: number;
};

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "jc_consent";
/** Émis quand le choix change. */
export const CONSENT_CHANGE_EVENT = "jc:consent-change";
/** Émis pour rouvrir le panneau de préférences (lien « Gérer les cookies »). */
export const CONSENT_OPEN_EVENT = "jc:consent-open";

const LEGACY_STORAGE_KEY = "cookie-preferences";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);

  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as Consent;
      if (parsed.v === CONSENT_VERSION && typeof parsed.analytics === "boolean") return parsed;
    } catch {}
    return null;
  }

  // Reprise de l'ancien choix enregistré dans le localStorage
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      const analytics = (JSON.parse(legacy) as { analytics?: boolean }).analytics === true;
      return writeConsent(analytics, { silent: true });
    }
  } catch {}
  return null;
}

export function writeConsent(analytics: boolean, opts: { silent?: boolean } = {}): Consent {
  const consent: Consent = { v: CONSENT_VERSION, analytics, t: Date.now() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Max-Age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}; Path=/; SameSite=Lax${secure}`;

  if (!analytics) clearAnalyticsCookies();
  if (!opts.silent) window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }));
  return consent;
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/** Supprime les cookies de mesure d'audience déjà déposés (_ga, _ga_XXXX…). */
export function clearAnalyticsCookies() {
  const names = document.cookie
    .split("; ")
    .map((c) => c.split("=")[0])
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat");
  if (names.length === 0) return;

  const host = location.hostname;
  const parts = host.split(".");
  const domains = ["", host, `.${host}`];
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);

  for (const name of names) {
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
    }
  }
}
