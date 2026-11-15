"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Bandeau affiché quand on arrive sur l'accueil avec ?auth_error=1
 * (redirection depuis une page réservée aux membres).
 * Lu côté navigateur pour que la page d'accueil reste statique.
 */
export default function AuthErrorBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const show = searchParams.has("auth_error");

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => router.replace("/", { scroll: false }), 4000);
    return () => clearTimeout(timer);
  }, [router, show]);

  if (!show) return null;

  return (
    <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[100] bg-[rgba(10,8,40,0.95)] border border-[rgba(200,40,70,0.5)] rounded-[10px] text-[rgba(255,100,120,0.9)] text-[14px] font-semibold py-[14px] px-[24px] flex items-center gap-[12px] tracking-[0.04em] shadow-[0_0_30px_rgba(180,30,60,0.15)] max-w-[calc(100vw-32px)] animate-[fadeOut_4s_ease-in-out_forwards]">
      <span>🔒</span>
      Vous devez être connecté pour accéder à cette page.
      <Link
        href="/login"
        className="text-white no-underline font-bold py-[5px] px-[14px] bg-[#3b2fb5] rounded-[6px] text-[12px] tracking-[0.08em] uppercase transition-[background] duration-[150ms] hover:bg-[#4c3dd4] shrink-0"
      >
        Se connecter
      </Link>
    </div>
  );
}
