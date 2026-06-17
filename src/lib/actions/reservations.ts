"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  sendResaConfirmationUser,
  sendResaNotificationDJ,
  sendResaStatusUser,
  sendResaUpdatedUser,
} from "@/lib/email";

type UserWithExtras = {
  id: string;
  email: string;
  name: string;
  prenom?: string | null;
  nom?: string | null;
  tel?: string | null;
};

export async function createReservation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const date = new Date(formData.get("date") as string);
  const infoComplementaires = formData.get("infoComplementaires") as string;
  const prestationId = parseInt(formData.get("prestationId") as string);

  const demande = await prisma.demandeResa.create({
    data: { date, infoComplementaires, prestationId },
    include: { prestation: true },
  });

  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      demandeResaId: demande.id,
      etatId: 3,
    },
  });

  // Emails non-bloquants — n'affectent pas la réservation si ils échouent
  const u = session.user as unknown as UserWithExtras;
  const dateStr = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  Promise.all([
    sendResaConfirmationUser({
      to: u.email,
      prenom: u.prenom ?? u.name,
      date: dateStr,
      prestation: demande.prestation.type,
      info: infoComplementaires || null,
    }),
    sendResaNotificationDJ({
      prenom: u.prenom ?? "",
      nom: u.nom ?? "",
      email: u.email,
      tel: u.tel ?? null,
      date: dateStr,
      prestation: demande.prestation.type,
      info: infoComplementaires || null,
    }),
  ]).catch((err) => console.error("[reservations] email error:", err));

  return { success: true };
}

export async function updateReservation(id: number, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId: id },
  });
  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  const before = await prisma.demandeResa.findUnique({
    where: { id },
    include: { prestation: true },
  });

  const newDate = new Date(formData.get("date") as string);
  const newInfo = (formData.get("infoComplementaires") as string) || null;
  const newPrestationId = parseInt(formData.get("prestationId") as string);

  const updated = await prisma.demandeResa.update({
    where: { id },
    data: { date: newDate, infoComplementaires: newInfo, prestationId: newPrestationId },
    include: { prestation: true },
  });

  if (before) {
    const u = session.user as unknown as UserWithExtras;
    const fmt = (d: Date) =>
      d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    sendResaUpdatedUser({
      to: u.email,
      prenom: u.prenom ?? u.name,
      before: {
        date: fmt(before.date),
        prestation: before.prestation.type,
        info: before.infoComplementaires,
      },
      after: {
        date: fmt(updated.date),
        prestation: updated.prestation.type,
        info: updated.infoComplementaires,
      },
    }).catch((err) => console.error("[reservations] email error:", err));
  }

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

export async function updateReservationEtat(demandeResaId: number, etatId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  await prisma.reservation.update({
    where: { demandeResaId },
    data: { etatId },
  });

  // Uniquement pour Validée (1) et Refusée (2), pas En attente (3)
  if (etatId !== 1 && etatId !== 2) return;

  const resa = await prisma.reservation.findUnique({
    where: { demandeResaId },
    include: {
      user: true,
      demande: { include: { prestation: true } },
      etat: true,
    },
  });

  if (resa) {
    sendResaStatusUser({
      to: resa.user.email,
      prenom: (resa.user as unknown as UserWithExtras).prenom ?? resa.user.name,
      statut: resa.etat.statut,
      date: resa.demande.date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      prestation: resa.demande.prestation.type,
    }).catch((err) => console.error("[reservations] email error:", err));
  }
}

export async function deleteReservationAdmin(demandeResaId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });
}
