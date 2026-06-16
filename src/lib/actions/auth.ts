"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const tel = (formData.get("tel") as string) || undefined;
  const name = `${prenom} ${nom}`.trim();

  const result = await auth.api.signUpEmail({
    body: { email, password, name, nom, prenom, tel },
    headers: await headers(),
    asResponse: true,
  });

  if (!result.ok) {
    return { error: "Erreur lors de l'inscription. Cet email est peut-être déjà utilisé." };
  }

  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/login");

  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const tel = formData.get("tel") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nom, prenom, tel, email, name: `${prenom} ${nom}`.trim() },
  });

  if (password) {
    await auth.api.changePassword({
      body: { newPassword: password, currentPassword: formData.get("currentPassword") as string, revokeOtherSessions: false },
      headers: h,
    });
  }

  redirect("/profil");
}
