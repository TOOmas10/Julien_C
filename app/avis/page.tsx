import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HeaderAvis from "@/components/header-avis";
import Footer from "@/components/footer";
import AvisList from "./avis-list";
import AvisForm from "./avis-form";
import AnimateOnScroll from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "Avis",
  description: "Lisez les avis des clients de DJ Julien C et partagez votre expérience.",
  alternates: { canonical: "/avis" },
};

// Page statique, régénérée à chaque nouvel avis / suppression
// (revalidatePath dans les actions) et au plus tard toutes les heures.
export const revalidate = 3600;

export default async function AvisPage() {
  const avisRaw = await prisma.avis.findMany({
    include: { user: { select: { prenom: true, nom: true } } },
    orderBy: { date: "desc" },
  });

  const avis = avisRaw.map((a) => ({
    id: a.id,
    contenu: a.contenu,
    note: a.note,
    date: a.date.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }),
    prenom: a.user.prenom ?? "Client",
    nomInitial: (a.user.nom ?? "?")[0].toUpperCase(),
    userId: a.userId,
  }));

  return (
    <>
      <HeaderAvis />

      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[760px] mx-auto flex flex-col gap-[36px] pt-[20px]">

          {/* Titre */}
          <AnimateOnScroll>
            <div>
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
                — Communauté
              </div>
              <h1 className="text-[22px] font-black text-white tracking-[0.06em] uppercase m-0">
                Avis clients
              </h1>
            </div>
          </AnimateOnScroll>

          {/* Formulaire */}
          <AnimateOnScroll delay={100}>
            <section className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.35)] rounded-[16px] p-[28px] shadow-[0_0_40px_rgba(40,20,180,0.1)] transition-[border-color] duration-300 hover:border-[rgba(120,100,255,0.5)]">
              <AvisForm />
            </section>
          </AnimateOnScroll>

          {/* Liste */}
          <AvisList avis={avis} />
        </div>
      </main>

      <Footer />
    </>
  );
}
