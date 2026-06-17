import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendWelcome } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          sendWelcome({
            to: user.email,
            prenom: (user as { prenom?: string }).prenom ?? user.name.split(" ")[0],
          }).catch((err) => console.error("[auth] welcome email error:", err));
        },
      },
    },
  },
  user: {
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
});

export type Session = typeof auth.$Infer.Session;
