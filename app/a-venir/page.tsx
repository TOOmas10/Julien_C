import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import SoireeList from "./soiree-list";
import HeaderAvis from "@/components/header-avis";
import JsonLd from "@/components/json-ld";
import { SITE } from "@/lib/site";
import type { Soiree } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Soirées à venir",
  description: "Découvrez les prochaines soirées et événements de DJ Julien C.",
  alternates: { canonical: "/a-venir" },
};

// Page statique, régénérée à chaque ajout/suppression de soirée
// (revalidatePath dans les actions) et au plus tard toutes les heures.
export const revalidate = 3600;

// Les dates sont saisies et stockées en « heure murale » UTC :
// on les formate en UTC pour un affichage identique quel que soit le serveur.
function formatDate(d: Date) {
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

// Données structurées « événement » : permettent à Google d'afficher
// les prochaines soirées directement dans les résultats de recherche.
function buildEventsJsonLd(soirees: Soiree[]) {
  const now = Date.now();
  return soirees
    .filter((s) => s.date.getTime() >= now)
    .map((s) => ({
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: s.titre,
      // Heure locale du lieu, sans fuseau (cf. formatDate)
      startDate: s.date.toISOString().slice(0, 16),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(s.description ? { description: s.description } : {}),
      location: {
        "@type": "Place",
        name: s.lieu,
        address: {
          "@type": "PostalAddress",
          addressLocality: s.ville,
          addressCountry: "FR",
        },
      },
      performer: { "@type": "Person", name: "DJ Julien C", url: SITE.url },
      organizer: { "@type": "Person", name: "DJ Julien C", url: SITE.url },
      url: `${SITE.url}/a-venir`,
    }));
}

export default async function AVenirPage() {
  const soireesRaw = await prisma.soiree.findMany({
    orderBy: { date: "desc" },
  });

  const soirees = soireesRaw.map((s) => ({
    id: s.id,
    titre: s.titre,
    date: formatDate(s.date),
    lieu: s.lieu,
    ville: s.ville,
    description: s.description,
  }));

  const eventsJsonLd = buildEventsJsonLd(soireesRaw);

  return (
    <>
      {eventsJsonLd.length > 0 && <JsonLd data={eventsJsonLd} />}
      <HeaderAvis />

      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[860px] mx-auto pt-[20px]">
          <SoireeList soirees={soirees} />
        </div>
      </main>

      <Footer />
    </>
  );
}
