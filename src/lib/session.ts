import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Session de l'utilisateur courant, dédupliquée par requête :
 * plusieurs composants serveur peuvent l'appeler sans requête supplémentaire.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
