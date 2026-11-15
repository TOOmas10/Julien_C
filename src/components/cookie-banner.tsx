"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cookie, X, Check, Settings2, ShieldCheck, BarChart3, ChevronDown } from "lucide-react";
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import { COOKIE_CATEGORIES, type CookieCategory } from "@/lib/cookies-catalog";

const ICONS = { necessary: ShieldCheck, analytics: BarChart3 } as const;

export default function CookieBanner() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Affiche la bannière si aucun choix valide n'est enregistré
  useEffect(() => {
    const t = setTimeout(() => {
      if (!readConsent()) setBannerVisible(true);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const openModal = useCallback(() => {
    setAnalyticsEnabled(readConsent()?.analytics ?? false);
    setExpanded(null);
    setModalOpen(true);
  }, []);

  // Lien « Gérer les cookies » (pied de page, page /cookies)
  useEffect(() => {
    window.addEventListener(CONSENT_OPEN_EVENT, openModal);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openModal);
  }, [openModal]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    // Sans choix enregistré, on revient à la bannière
    if (!readConsent()) setBannerVisible(true);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  function save(analytics: boolean) {
    writeConsent(analytics);
    setBannerVisible(false);
    setModalOpen(false);
  }

  if (!bannerVisible && !modalOpen) return null;

  return (
    <>
      {/* Bannière principale */}
      {bannerVisible && !modalOpen && (
        <div
          role="region"
          aria-label="Consentement aux cookies"
          className="fixed bottom-4 left-4 right-4 z-[900] flex justify-center pointer-events-none animate-[fadeUp_0.4s_ease_both]"
        >
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
                  Avec votre accord, nous mesurons l&apos;audience du site (pages consultées,
                  provenance des visiteurs) pour l&apos;améliorer. Aucune publicité, aucune revente
                  de données. Vous pouvez changer d&apos;avis à tout moment via « Gérer les cookies »
                  en bas de page.{" "}
                  <Link href="/cookies" className="underline hover:text-white">
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={openModal}
                className="cursor-pointer px-3.5 py-[8px] text-[12px] text-[rgba(160,140,220,0.8)] hover:text-white transition-colors duration-150 font-semibold tracking-[0.04em] underline-offset-2 hover:underline"
              >
                Personnaliser
              </button>
              <button
                onClick={() => save(false)}
                className="cursor-pointer flex items-center gap-[6px] px-3.5 py-[8px] text-[12px] text-white border border-[rgba(120,100,255,0.55)] rounded-[10px] hover:bg-[rgba(60,40,180,0.25)] transition-all duration-150 font-bold tracking-[0.04em]"
              >
                <X className="w-3 h-3" />
                Tout refuser
              </button>
              <button
                onClick={() => save(true)}
                className="cursor-pointer flex items-center gap-[6px] px-3.5 py-[8px] text-[12px] bg-[#3b2fb5] border border-[#3b2fb5] text-white rounded-[10px] hover:bg-[#4c3dd4] transition-colors duration-150 font-bold tracking-[0.04em]"
              >
                <Check className="w-3 h-3" />
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de préférences */}
      {modalOpen && (
        <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            className="relative w-full max-w-lg max-h-[calc(100vh-32px)] flex flex-col bg-[rgba(8,6,30,0.98)] border border-[rgba(80,60,200,0.35)] rounded-[18px] shadow-[0_0_80px_rgba(40,20,180,0.3),0_0_0_1px_rgba(100,80,255,0.08)] overflow-hidden animate-[fadeUp_0.3s_ease_both]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(80,60,200,0.18)] shrink-0">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[rgba(140,120,255,0.85)]" />
                <h2 id="cookie-modal-title" className="font-bold text-white text-[13px] tracking-[0.03em]">
                  Gérer mes préférences cookies
                </h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Fermer"
                className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-[rgba(80,60,200,0.25)] transition-colors text-[rgba(140,120,200,0.6)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catégories */}
            <div className="divide-y divide-[rgba(80,60,200,0.12)] overflow-y-auto">
              {COOKIE_CATEGORIES.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  enabled={cat.required || analyticsEnabled}
                  onToggle={cat.required ? undefined : () => setAnalyticsEnabled((v) => !v)}
                  expanded={expanded === cat.id}
                  onExpand={() => setExpanded((e) => (e === cat.id ? null : cat.id))}
                />
              ))}
              <p className="px-6 py-4 text-[11px] text-[rgba(160,140,220,0.6)] leading-relaxed">
                Votre choix est conservé 6 mois. Détails complets dans notre{" "}
                <Link href="/cookies" onClick={() => setModalOpen(false)} className="underline hover:text-white">
                  politique cookies
                </Link>{" "}
                et notre{" "}
                <Link href="/politique-de-confidentialite" onClick={() => setModalOpen(false)} className="underline hover:text-white">
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[rgba(80,60,200,0.15)] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => save(false)}
                className="cursor-pointer px-3.5 py-[8px] text-[12px] text-white border border-[rgba(120,100,255,0.55)] rounded-[10px] hover:bg-[rgba(60,40,180,0.25)] transition-all duration-150 font-bold tracking-[0.04em]"
              >
                Tout refuser
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => save(true)}
                  className="cursor-pointer px-3.5 py-[8px] text-[12px] text-white border border-[rgba(120,100,255,0.55)] rounded-[10px] hover:bg-[rgba(60,40,180,0.25)] transition-all duration-150 font-bold tracking-[0.04em]"
                >
                  Tout accepter
                </button>
                <button
                  onClick={() => save(analyticsEnabled)}
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

function CategoryRow({
  category,
  enabled,
  onToggle,
  expanded,
  onExpand,
}: {
  category: CookieCategory;
  enabled: boolean;
  onToggle?: () => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  const Icon = ICONS[category.id];
  const detailsId = `cookie-details-${category.id}`;

  return (
    <div className="px-6 py-5">
      <div className="flex items-start gap-4">
        <div
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200 ${
            enabled && !category.required
              ? "bg-[rgba(80,60,200,0.25)] border border-[rgba(80,60,200,0.45)]"
              : "bg-[rgba(60,40,80,0.35)]"
          }`}
        >
          <Icon className={`w-4 h-4 ${enabled && !category.required ? "text-[rgba(140,120,255,0.9)]" : "text-[rgba(140,120,200,0.6)]"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-[6px]">
            <p className="text-[13px] font-bold text-white tracking-[0.02em]">{category.title}</p>
            {category.required ? (
              <span className="text-[11px] text-[rgba(120,100,180,0.7)] shrink-0 tracking-[0.06em] uppercase font-semibold">
                Toujours actifs
              </span>
            ) : (
              <button
                onClick={onToggle}
                role="switch"
                aria-checked={enabled}
                aria-label={`${category.title} : ${enabled ? "activé" : "désactivé"}`}
                className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                  enabled ? "bg-[#3b2fb5]" : "bg-[rgba(60,40,80,0.6)]"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-[12px] text-[rgba(160,140,220,0.7)] leading-relaxed">{category.description}</p>

          <button
            onClick={onExpand}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="cursor-pointer mt-[8px] flex items-center gap-1 text-[11px] font-semibold text-[rgba(150,130,255,0.85)] hover:text-white tracking-[0.04em]"
          >
            {expanded ? "Masquer le détail" : `Voir le détail (${category.cookies.length})`}
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {expanded && (
            <ul id={detailsId} className="mt-[10px] flex flex-col gap-[8px]">
              {category.cookies.map((c) => (
                <li
                  key={c.name}
                  className="rounded-[10px] border border-[rgba(80,60,200,0.2)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-[11px] leading-relaxed text-[rgba(180,170,230,0.8)]"
                >
                  <p className="font-mono text-[11px] text-white break-all">{c.name}</p>
                  <p>{c.purpose}</p>
                  <p className="text-[rgba(150,130,210,0.65)]">
                    {c.provider} · Durée : {c.duration}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
