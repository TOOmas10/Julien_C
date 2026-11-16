"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  formatResaDate,
  sendLater,
  sendResaCancelledDJ,
  sendResaConfirmationUser,
  sendResaDeletedUser,
  sendResaNotificationDJ,
  sendResaStatusUser,
  sendResaUpdatedDJ,
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

/** Coordonnées du client pour les emails envoyés à Julien. */
function clientOf(u: UserWithExtras) {
  return {
    prenom: u.prenom ?? u.name.split(" ")[0] ?? "",
    nom: u.nom ?? u.name.split(" ").slice(1).join(" "),
    email: u.email,
    tel: u.tel ?? null,
  };
}

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

  // Emails envoyés après la réponse — n'affectent pas la réservation s'ils échouent
  const u = session.user as unknown as UserWithExtras;
  const dateStr = formatResaDate(date);

  sendLater(() =>
    Promise.all([
      sendResaConfirmationUser({
        to: u.email,
        prenom: u.prenom ?? u.name,
        date: dateStr,
        prestation: demande.prestation.type,
        info: infoComplementaires || null,
      }),
      sendResaNotificationDJ({
        ...clientOf(u),
        date: dateStr,
        prestation: demande.prestation.type,
        info: infoComplementaires || null,
      }),
    ])
  );

  return { success: true };
}

export async function updateReservation(id: number, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId: id },
    include: { etat: true },
  });
  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  const before = await prisma.demandeResa.findUnique({
    where: { id },
    include: { prestation: true },
  });

  const newDate = new Date(formData.get("date") as string);
  const newInfo = (formData.get("infoComplementaires") as string) || null;
  const newPrestationId = parseInt(formData.get("prestationId") as string);

  // Rien n'a changé : on ne touche ni au statut ni aux emails
  const changed =
    !before ||
    before.date.getTime() !== newDate.getTime() ||
    before.prestationId !== newPrestationId ||
    (before.infoComplementaires ?? null) !== newInfo;
  if (!changed) redirect("/reservations");

  const updated = await prisma.demandeResa.update({
    where: { id },
    data: { date: newDate, infoComplementaires: newInfo, prestationId: newPrestationId },
    include: { prestation: true },
  });

  // Toute modification doit être reconfirmée par Julien → « En attente » (3)
  await prisma.reservation.update({
    where: { demandeResaId: id },
    data: { etatId: 3 },
  });

  if (before) {
    const u = session.user as unknown as UserWithExtras;
    const beforeSnap = {
      date: formatResaDate(before.date),
      prestation: before.prestation.type,
      info: before.infoComplementaires,
    };
    const afterSnap = {
      date: formatResaDate(updated.date),
      prestation: updated.prestation.type,
      info: updated.infoComplementaires,
    };

    sendLater(() =>
      Promise.all([
        sendResaUpdatedUser({
          to: u.email,
          prenom: u.prenom ?? u.name,
          before: beforeSnap,
          after: afterSnap,
        }),
        sendResaUpdatedDJ({
          client: clientOf(u),
          before: beforeSnap,
          after: afterSnap,
          previousStatut: reservation.etat.statut,
        }),
      ])
    );
  }

  redirect("/reservations");
}

export async function deleteReservation(demandeResaId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId },
    include: { demande: { include: { prestation: true } } },
  });
  if (!reservation || reservation.userId !== session.user.id) return;

  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });

  // Prévient Julien que la date est libérée
  const u = session.user as unknown as UserWithExtras;
  sendLater(() =>
    sendResaCancelledDJ({
      client: clientOf(u),
      resa: {
        date: formatResaDate(reservation.demande.date),
        prestation: reservation.demande.prestation.type,
        info: reservation.demande.infoComplementaires,
      },
    })
  );
}

export async function updateReservationEtat(demandeResaId: number, etatId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  await prisma.reservation.update({
    where: { demandeResaId },
    data: { etatId },
  });

  // Validée (1), Refusée (2) et retour En attente (3)
  if (![1, 2, 3].includes(etatId)) return;

  const resa = await prisma.reservation.findUnique({
    where: { demandeResaId },
    include: {
      user: true,
      demande: { include: { prestation: true, soiree: { select: { id: true } } } },
      etat: true,
    },
  });

  // Pas d'email pour les réservations techniques créées par une soirée
  if (resa && !resa.demande.soiree) {
    sendLater(() =>
      sendResaStatusUser({
        to: resa.user.email,
        prenom: resa.user.prenom ?? resa.user.name,
        statut: resa.etat.statut,
        date: formatResaDate(resa.demande.date),
        prestation: resa.demande.prestation.type,
      })
    );
  }
}

export async function deleteReservationAdmin(demandeResaId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  // Lu avant suppression pour pouvoir prévenir le client
  const resa = await prisma.reservation.findUnique({
    where: { demandeResaId },
    include: {
      user: true,
      demande: { include: { prestation: true, soiree: { select: { id: true } } } },
    },
  });

  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });

  // Pas d'email pour les réservations techniques créées par une soirée
  if (resa && !resa.demande.soiree) {
    sendLater(() =>
      sendResaDeletedUser({
        to: resa.user.email,
        prenom: resa.user.prenom ?? resa.user.name,
        resa: {
          date: formatResaDate(resa.demande.date),
          prestation: resa.demande.prestation.type,
        },
      })
    );
  }
}
