import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AnimateOnScroll from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "Mes réservations",
  robots: { index: false, follow: false },
};
import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import ResaList from "./resa-list";
import HeaderAvis from "@/components/header-avis";

export default async function ReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/?auth_error=1");
  const user = session.user;

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: {
      demande: { include: { prestation: true } },
      etat: true,
    },
    orderBy: { demande: { date: "desc" } },
  });

  const serialized = reservations.map((r) => ({
    demandeResaId: r.demandeResaId,
    date: r.demande.date.toLocaleDateString("fr-FR"),
    infoComplementaires: r.demande.infoComplementaires,
    prestationType: r.demande.prestation.type,
    statut: r.etat.statut,
  }));

  return (
    <>
      <HeaderAvis />

      <main className="min-h-screen w-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[860px] mx-auto">
          <AnimateOnScroll>
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
              — Espace membre
            </div>
            <div className="text-[22px] font-black text-white tracking-[0.06em] uppercase mb-[24px]">
              Mes réservations
            </div>
          </AnimateOnScroll>

          <ResaList reservations={serialized} />
        </div>
      </main>

      <Footer />
    </>
  );
}
