import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AnimateOnScroll from "@/components/animate-on-scroll";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import HeaderAvis from "@/components/header-avis";
import AdminTable from "./admin-table";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  const reservations = await prisma.reservation.findMany({
    include: {
      user: true,
      demande: { include: { prestation: true } },
      etat: true,
    },
    orderBy: { demande: { date: "desc" } },
  });

  const serialized = reservations.map((r) => ({
    demandeResaId: r.demandeResaId,
    prenom: r.user.prenom ?? r.user.name.split(" ")[0],
    nom: r.user.nom ?? r.user.name.split(" ").slice(1).join(" "),
    email: r.user.email,
    tel: r.user.tel,
    date: r.demande.date.toLocaleDateString("fr-FR"),
    prestationType: r.demande.prestation.type,
    infoComplementaires: r.demande.infoComplementaires,
    statut: r.etat.statut,
    etatId: r.etatId,
  }));

  return (
    <>
      <HeaderAvis />

      <main className="min-h-screen w-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[24px] pb-[60px]">
        <div className="max-w-[1200px] mx-auto">
          <AnimateOnScroll>
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
              — Espace Admin
            </div>
            <div className="text-[22px] font-black text-white tracking-[0.06em] uppercase mb-[24px]">
              Réservations
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <AdminTable reservations={serialized} />
          </AnimateOnScroll>
        </div>
      </main>

      <Footer />
    </>
  );
}
