"use client";

import { useEffect } from "react";
import { inject } from "@vercel/analytics";

type Preferences = { analytics: boolean };

function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem("cookie-preferences");
  if (!raw) return false;
  try {
    return (JSON.parse(raw) as Preferences).analytics === true;
  } catch {
    return false;
  }
}

let injected = false;

function tryInject() {
  if (injected) return;
  if (getAnalyticsConsent()) {
    inject({ mode: "production" });
    injected = true;
  }
}

export default function VercelAnalytics() {
  useEffect(() => {
    tryInject();

    function onConsent() {
      tryInject();
    }

    window.addEventListener("consentUpdate", onConsent);
    return () => window.removeEventListener("consentUpdate", onConsent);
  }, []);

  return null;
}
