"use client";

import { useEffect } from "react";
import { inject } from "@vercel/analytics";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";
import { GA_ID } from "@/lib/cookies-catalog";

/**
 * Charge les outils de mesure d'audience UNIQUEMENT après accord explicite
 * (bannière cookies), et les coupe immédiatement en cas de retrait.
 *
 * - Vercel Web Analytics : toujours disponible (sans cookie).
 * - Google Analytics 4 : activé seulement si NEXT_PUBLIC_GA_ID est défini.
 */

type GtagWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: string]: unknown;
};

const gaWindow = () => window as unknown as GtagWindow;

let vercelLoaded = false;
let gaLoaded = false;

function hasAnalyticsConsent() {
  return readConsent()?.analytics === true;
}

function loadVercelAnalytics() {
  if (vercelLoaded) return;
  vercelLoaded = true;
  inject({
    mode: "production",
    // Revérifie le consentement à chaque envoi : un retrait prend effet tout de suite.
    beforeSend: (event) => (hasAnalyticsConsent() ? event : null),
  });
}

function loadGoogleAnalytics() {
  if (!GA_ID) return;
  const w = gaWindow();
  w[`ga-disable-${GA_ID}`] = false;

  if (gaLoaded) {
    w.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  gaLoaded = true;

  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

function disableGoogleAnalytics() {
  if (!GA_ID) return;
  const w = gaWindow();
  w[`ga-disable-${GA_ID}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
}

export default function Analytics() {
  useEffect(() => {
    function apply() {
      if (hasAnalyticsConsent()) {
        loadVercelAnalytics();
        loadGoogleAnalytics();
      } else {
        disableGoogleAnalytics();
      }
    }

    apply();
    window.addEventListener(CONSENT_CHANGE_EVENT, apply);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, apply);
  }, []);

  return null;
}
