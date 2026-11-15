import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * Droit d'accès / portabilité (RGPD, art. 15 et 20) :
 * télécharge toutes les données liées au compte connecté, au format JSON.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      nom: true,
      prenom: true,
      name: true,
      email: true,
      tel: true,
      createdAt: true,
      updatedAt: true,
      reservations: {
        select: {
          date: true,
          etat: { select: { statut: true } },
          demande: {
            select: {
              date: true,
              infoComplementaires: true,
              prestation: { select: { type: true } },
            },
          },
        },
      },
      avis: { select: { date: true, note: true, contenu: true } },
      sessions: {
        select: { createdAt: true, expiresAt: true, ipAddress: true, userAgent: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const payload = {
    exportéLe: new Date().toISOString(),
    compte: {
      nom: user.nom,
      prenom: user.prenom,
      nomAffiché: user.name,
      email: user.email,
      telephone: user.tel,
      créeLe: user.createdAt,
      modifiéLe: user.updatedAt,
    },
    reservations: user.reservations.map((r) => ({
      demandéeLe: r.date,
      dateEvenement: r.demande.date,
      prestation: r.demande.prestation.type,
      informationsComplementaires: r.demande.infoComplementaires,
      statut: r.etat.statut,
    })),
    avis: user.avis,
    sessionsDeConnexion: user.sessions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mes-donnees-julien-c-dj.json"',
      "Cache-Control": "no-store",
    },
  });
}
