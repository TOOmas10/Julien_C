import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditForm from "./edit-form";

type Params = Promise<{ id: string }>;

export default async function ModifierReservationPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/?auth_error=1");

  const idNum = parseInt(id);
  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId: idNum },
    include: { demande: { include: { prestation: true } } },
  });

  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  const prestations = await prisma.prestation.findMany({
    select: { id: true, type: true },
  });

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
