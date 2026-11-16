import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import {
  formatResaDate,
  sendAccountDeleted,
  sendAccountDeletedDJ,
  sendLater,
  sendWelcome,
} from "./email";

/**
 * Réservations d'un compte en cours de suppression, lues dans beforeDelete
 * (avant leur effacement) et envoyées à Julien dans afterDelete, c'est-à-dire
 * seulement si la suppression a réellement abouti.
 */
const deletionReports = new Map<string, Parameters<typeof sendAccountDeletedDJ>[0]>();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // La session est mise en cache dans un cookie signé pendant 5 min :
    // évite une requête en base de données à chaque page vue.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          sendLater(() =>
            sendWelcome({
              to: user.email,
              prenom: (user as { prenom?: string }).prenom ?? user.name.split(" ")[0],
            })
          );
        },
      },
    },
  },
  user: {
    // Droit à l'effacement (RGPD) : l'utilisateur peut supprimer son compte
    // depuis « Mon profil » (mot de passe demandé).
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { roleId: true, prenom: true, nom: true, name: true, email: true, tel: true },
        });
        if (dbUser?.roleId === 2) {
          throw new APIError("BAD_REQUEST", {
            message: "Le compte administrateur ne peut pas être supprimé depuis le site.",
          });
        }
        // Les demandes de réservation ne sont pas liées directement à
        // l'utilisateur : on les supprime explicitement (la réservation suit
        // en cascade) pour ne garder aucune donnée et libérer les dates.
        const resas = await prisma.reservation.findMany({
          where: { userId: user.id },
          select: {
            demandeResaId: true,
            etat: { select: { statut: true } },
            demande: {
              select: { date: true, infoComplementaires: true, prestation: { select: { type: true } } },
            },
          },
          orderBy: { demande: { date: "asc" } },
        });

        if (dbUser && resas.length > 0) {
          deletionReports.set(user.id, {
            client: {
              prenom: dbUser.prenom ?? dbUser.name.split(" ")[0] ?? "",
              nom: dbUser.nom ?? dbUser.name.split(" ").slice(1).join(" "),
              email: dbUser.email,
              tel: dbUser.tel,
            },
            reservations: resas.map((r) => ({
              date: formatResaDate(r.demande.date),
              prestation: r.demande.prestation.type,
              statut: r.etat.statut,
              info: r.demande.infoComplementaires,
            })),
          });
        }

        await prisma.demandeResa.deleteMany({
          where: {
            id: { in: resas.map((r) => r.demandeResaId) },
            soiree: { is: null },
          },
        });
      },
      afterDelete: async (user) => {
        // Les avis de l'utilisateur disparaissent : on régénère la page publique.
        revalidatePath("/avis");
        // Confirmation de suppression envoyée à l'ancien titulaire du compte
        sendLater(() =>
          sendAccountDeleted({
            to: user.email,
            prenom: (user as { prenom?: string | null }).prenom ?? user.name.split(" ")[0],
          })
        );
        // Julien est prévenu si des réservations ont disparu avec le compte
        const report = deletionReports.get(user.id);
        deletionReports.delete(user.id);
        if (report) sendLater(() => sendAccountDeletedDJ(report));
      },
    },
    additionalFields: {
      nom: {
        type: "string",
        required: false,
        input: true,
      },
      prenom: {
        type: "string",
        required: false,
        input: true,
      },
      tel: {
        type: "string",
        required: false,
        input: true,
      },
      roleId: {
        type: "number",
        required: false,
        input: false,
        defaultValue: 1,
      },
    },
  },
  // Doit rester le dernier plugin : permet aux Server Actions d'écrire les
  // cookies de session (ex. rafraîchir le cache après modification du profil).
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
