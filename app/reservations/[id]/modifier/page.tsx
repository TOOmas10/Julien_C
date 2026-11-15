import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPrestations } from "@/lib/calendar-data";
import EditForm from "./edit-form";

export const metadata: Metadata = {
  title: "Modifier ma réservation",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function ModifierReservationPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/?auth_error=1");

  const idNum = parseInt(id);
  if (Number.isNaN(idNum)) redirect("/reservations");

  // Les deux lectures partent en parallèle
  const [reservation, prestations] = await Promise.all([
    prisma.reservation.findUnique({
      where: { demandeResaId: idNum },
      include: { demande: { include: { prestation: true } } },
    }),
    getPrestations(),
  ]);

  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  return (
    <EditForm
      demandeResaId={idNum}
      initialDate={reservation.demande.date.toISOString().split("T")[0]}
      initialPrestationId={reservation.demande.prestationId}
      initialInfo={reservation.demande.infoComplementaires ?? ""}
      prestations={prestations}
    />
  );
}
