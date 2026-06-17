"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Check, Settings2, ShieldCheck, BarChart3 } from "lucide-react";

type Preferences = { analytics: boolean };

const STORAGE_KEY = "cookie-preferences";

function getPreferences(): Preferences | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Preferences;
  } catch {
    return null;
  }
}

function savePreferences(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event("consentUpdate"));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!getPreferences()) setVisible(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  function acceptAll() {
    savePreferences({ analytics: true });
    setVisible(false);
    setModalOpen(false);
  }

  function refuseAll() {
    savePreferences({ analytics: false });
    setVisible(false);
    setModalOpen(false);
  }

  function openModal() {
    setAnalyticsEnabled(getPreferences()?.analytics ?? false);
    setModalOpen(true);
  }

  function saveCustom() {
    savePreferences({ analytics: analyticsEnabled });
    setVisible(false);
    setModalOpen(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Bannière principale */}
      {!modalOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-[900] flex justify-center pointer-events-none animate-[fadeUp_0.4s_ease_both]">
          <div className="w-full max-w-xl bg-[rgba(8,6,30,0.97)] border border-[rgba(80,60,200,0.35)] rounded-[18px] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] backdrop-blur-[14px] p-5 pointer-events-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-[10px] bg-[rgba(80,60,200,0.2)] border border-[rgba(80,60,200,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4 h-4 text-[rgba(140,120,255,0.9)]" />
              </div>
              <div>
                <p className="font-bold text-white text-[13px] mb-[5px] tracking-[0.03em]">
                  Cookies & confidentialité
                </p>
                <p className="text-[12px] text-[rgba(160,140,220,0.75)] leading-relaxed">
                  Nous utilisons des cookies analytiques pour mesurer l&apos;audience du site. Vous pouvez personnaliser vos préférences ou tout accepter / refuser en un clic.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={openModal}
                className="cursor-pointer px-3.5 py-[8px] text-[12px] text-[rgba(140,120,200,0.65)] hover:text-[rgba(180,160,255,0.9)] transition-colors duration-150 font-semibold tracking-[0.04em]"
              >
                Personnaliser
              </button>
              <button
                onClick={refuseAll}
                className="cursor-pointer flex items-center gap-[6px] px-3.5 py-[8px] text-[12px] text-[rgba(180,160,255,0.8)] border border-[rgba(80,60,200,0.4)] rounded-[10px] hover:bg-[rgba(60,40,180,0.2)] hover:border-[rgba(120,100,255,0.55)] hover:text-white transition-all duration-150 font-semibold tracking-[0.04em]"
              >
                <X className="w-3 h-3" />
                Tout refuser
              </button>
              <button
                onClick={acceptAll}
                className="cursor-pointer flex items-center gap-[6px] px-3.5 py-[8px] text-[12px] bg-[#3b2fb5] text-white rounded-[10px] hover:bg-[#4c3dd4] transition-colors duration-150 font-bold tracking-[0.04em]"
              >
                <Check className="w-3 h-3" />
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal personnalisation */}
      {modalOpen && (
        <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[rgba(8,6,30,0.98)] border border-[rgba(80,60,200,0.35)] rounded-[18px] shadow-[0_0_80px_rgba(40,20,180,0.3),0_0_0_1px_rgba(100,80,255,0.08)] overflow-hidden animate-[fadeUp_0.3s_ease_both]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(80,60,200,0.18)]">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[rgba(140,120,255,0.85)]" />
                <h2 className="font-bold text-white text-[13px] tracking-[0.03em]">
                  Personnaliser mes préférences
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-[rgba(80,60,200,0.25)] transition-colors text-[rgba(140,120,200,0.6)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catégories */}
            <div className="divide-y divide-[rgba(80,60,200,0.12)]">

              {/* Fonctionnels */}
              <div className="px-6 py-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(60,40,80,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[rgba(140,120,200,0.6)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-[6px]">
                    <p className="text-[13px] font-bold text-white tracking-[0.02em]">
                      Cookies fonctionnels
                    </p>
                    <span className="text-[11px] text-[rgba(120,100,180,0.6)] shrink-0 tracking-[0.06em] uppercase font-semibold">
                      Toujours actifs
                    </span>
                  </div>
                  <p className="text-[12px] text-[rgba(160,140,220,0.65)] leading-relaxed">
                    Nécessaires au fonctionnement du site : session de réservation, préférence de thème clair/sombre. Ne collectent aucune donnée personnelle.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="px-6 py-5 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200 ${
                  analyticsEnabled
                    ? "bg-[rgba(80,60,200,0.25)] border border-[rgba(80,60,200,0.45)]"
                    : "bg-[rgba(60,40,80,0.35)]"
                }`}>
                  <BarChart3 className={`w-4 h-4 transition-colors duration-200 ${
                    analyticsEnabled ? "text-[rgba(140,120,255,0.9)]" : "text-[rgba(140,120,200,0.6)]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-[6px]">
                    <p className="text-[13px] font-bold text-white tracking-[0.02em]">
                      Analytics (Vercel)
                    </p>
                    <button
                      onClick={() => setAnalyticsEnabled((v) => !v)}
                      className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                        analyticsEnabled ? "bg-[#3b2fb5]" : "bg-[rgba(60,40,80,0.6)]"
                      }`}
                      role="switch"
                      aria-checked={analyticsEnabled}
                    >
                      <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        analyticsEnabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  <p className="text-[12px] text-[rgba(160,140,220,0.65)] leading-relaxed">
                    Mesure d&apos;audience anonyme : pages vues, durée de visite, type d&apos;appareil, pays d&apos;origine. Aucune publicité, aucun pistage tiers, aucune donnée personnelle.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[rgba(80,60,200,0.15)] flex items-center justify-between gap-3">
              <button
                onClick={refuseAll}
                className="cursor-pointer text-[12px] text-[rgba(140,120,200,0.6)] hover:text-[rgba(180,160,255,0.9)] transition-colors duration-150 font-semibold tracking-[0.04em]"
              >
                Tout refuser
              </button>
              <div className="flex gap-2">
                <button
                  onClick={acceptAll}
                  className="cursor-pointer px-3.5 py-[8px] text-[12px] text-[rgba(180,160,255,0.85)] border border-[rgba(80,60,200,0.4)] rounded-[10px] hover:bg-[rgba(60,40,180,0.2)] hover:border-[rgba(120,100,255,0.55)] hover:text-white transition-all duration-150 font-semibold tracking-[0.04em]"
                >
                  Tout accepter
                </button>
                <button
                  onClick={saveCustom}
                  className="cursor-pointer flex items-center gap-[6px] px-3.5 py-[8px] text-[12px] bg-[#3b2fb5] text-white rounded-[10px] hover:bg-[#4c3dd4] transition-colors duration-150 font-bold tracking-[0.04em]"
                >
                  <Check className="w-3 h-3" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
