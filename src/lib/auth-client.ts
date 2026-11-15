import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// Pas de baseURL : le client appelle /api/auth sur le domaine courant,
// ce qui fonctionne aussi bien sur le nom de domaine que sur *.vercel.app.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
