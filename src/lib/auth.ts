import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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
