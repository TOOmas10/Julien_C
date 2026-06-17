import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Soirées à venir",
  description: "Découvrez les prochaines soirées et événements de DJ Julien C.",
};
import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import SoireeList from "./soiree-list";
import HeaderAvis from "@/components/header-avis";

export default async function AVenirPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const soireesRaw = await prisma.soiree.findMany({
    orderBy: { date: "desc" },
  });

  const soirees = soireesRaw.map((s) => ({
    id: s.id,
    titre: s.titre,
    date: s.date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    lieu: s.lieu,
    ville: s.ville,
    description: s.description,
  }));

  return (
    <>
      <HeaderAvis />

      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[860px] mx-auto pt-[20px]">
          <SoireeList soirees={soirees} isAdmin={session?.user.roleId === 2} />
        </div>
      </main>

      <Footer />
    </>
  );
}
