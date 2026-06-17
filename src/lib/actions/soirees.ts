"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function addSoiree(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  const titre = formData.get("titre") as string;
  const dateTime = new Date(formData.get("date") as string);
  const lieu = formData.get("lieu") as string;
  const ville = formData.get("ville") as string;
  const description = (formData.get("description") as string) || null;

  // Date sans heure pour bloquer la case calendrier
  const dateSeule = new Date(dateTime);
  dateSeule.setHours(0, 0, 0, 0);

  // Crée la DemandeResa pour bloquer la date
  const demande = await prisma.demandeResa.create({
    data: {
      date: dateSeule,
      infoComplementaires: `Soirée : ${titre}`,
      prestationId: 3,
    },
  });

  // Réservation auto-validée (etatId: 1)
  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      demandeResaId: demande.id,
      etatId: 1,
    },
  });

  // Soirée liée à la DemandeResa
  await prisma.soiree.create({
    data: { titre, date: dateTime, lieu, ville, description, demandeResaId: demande.id },
  });

  redirect("/a-venir");
}

export async function deleteSoiree(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) return;

  const soiree = await prisma.soiree.findUnique({ where: { id } });

  // Supprime la soirée d'abord (libère la FK)
  await prisma.soiree.delete({ where: { id } });

  // Supprime la DemandeResa (cascade → Reservation)
  if (soiree?.demandeResaId) {
    await prisma.demandeResa.delete({ where: { id: soiree.demandeResaId } });
  }
}
