"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createReservation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const date = new Date(formData.get("date") as string);
  const infoComplementaires = formData.get("infoComplementaires") as string;
  const prestationId = parseInt(formData.get("prestationId") as string);

  const demande = await prisma.demandeResa.create({
    data: { date, infoComplementaires, prestationId },
  });

  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      demandeResaId: demande.id,
      etatId: 3,
    },
  });

  return { success: true };
}

export async function updateReservation(id: number, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId: id },
  });
  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  await prisma.demandeResa.update({
    where: { id },
    data: {
      date: new Date(formData.get("date") as string),
      infoComplementaires: formData.get("infoComplementaires") as string,
      prestationId: parseInt(formData.get("prestationId") as string),
    },
  });

  redirect("/reservations");
}

export async function deleteReservation(demandeResaId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId },
  });
  if (!reservation || reservation.userId !== session.user.id) return;

  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });
}
