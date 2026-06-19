import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "404 — Page introuvable",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black flex flex-col justify-center items-center text-center px-[6vw] relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(8,0,115,0.6)_0%,transparent_65%)] pointer-events-none" />

        {/* 404 */}
        <p className="relative text-[11px] font-bold tracking-[0.3em] uppercase text-[rgba(120,100,255,0.7)] mb-[24px] z-[1]">
          — Erreur
        </p>
        <h1
          className="relative font-['Dear'] italic text-[clamp(7rem,25vw,16rem)] font-black text-white m-0 leading-none z-[1]"
          style={{ textShadow: "0 0 60px rgba(43,0,142,0.9)" }}
        >
          404
        </h1>
        <h2 className="relative text-[clamp(1.2rem,3vw,2rem)] uppercase font-black tracking-[3px] text-white mt-[16px] mb-[16px] z-[1]">
          Page introuvable
        </h2>
        <p className="relative text-[1rem] text-[rgba(200,200,220,0.6)] max-w-[420px] leading-[1.7] mb-[48px] z-[1]">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="relative z-[1] py-[16px] px-[40px] rounded-lg uppercase tracking-[2px] font-bold text-[0.9rem] no-underline bg-[var(--primary-color)] text-white transition-transform duration-300 hover:-translate-y-[4px] animate-[glowPulse_3s_ease-in-out_infinite]"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
      <Footer />
    </>
  );
}
