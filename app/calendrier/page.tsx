import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPrestations, getReservedDates } from "@/lib/calendar-data";
import Footer from "@/components/footer";
import CalendarClient from "./calendar-client";
import HeaderAvis from "@/components/header-avis";

export const metadata: Metadata = {
  title: "Calendrier",
  description: "Consultez les disponibilités de DJ Julien C et réservez votre date en ligne.",
  robots: { index: false, follow: false },
};

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/?auth_error=1");

  // Les données sont chargées côté serveur, en parallèle, et envoyées avec la
  // page : plus d'aller-retour navigateur → API après l'affichage.
  const [reservedDates, prestations] = await Promise.all([
    getReservedDates(),
    getPrestations(),
  ]);

  return (
    <>
      <HeaderAvis />
      <CalendarClient initialReservedDates={reservedDates} prestations={prestations} />
      <Footer />
    </>
  );
}
