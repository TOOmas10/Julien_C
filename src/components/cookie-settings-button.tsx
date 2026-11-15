"use client";

import { openConsentPreferences } from "@/lib/consent";

/** Rouvre le panneau de préférences cookies (retrait du consentement à tout moment). */
export default function CookieSettingsButton({
  className,
  children = "Gérer les cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      {children}
    </button>
  );
}
