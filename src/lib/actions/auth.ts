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

export async function updateProfile(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/login");

  const nom = (formData.get("nom") as string).trim().slice(0, 60);
  const prenom = (formData.get("prenom") as string).trim().slice(0, 60);
  const tel = (formData.get("tel") as string).trim().slice(0, 20);
  const email = (formData.get("email") as string).trim().toLowerCase().slice(0, 255);
  const newPassword = formData.get("newPassword") as string;
  const currentPassword = formData.get("currentPassword") as string;

  if (!nom || !prenom) return { error: "Nom et prénom sont requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse email invalide." };
  if (newPassword && newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { nom, prenom, tel: tel || null, email, name: `${prenom} ${nom}`.trim() },
    });
  } catch {
    return { error: "Cet email est déjà utilisé par un autre compte." };
  }

  if (newPassword) {
    if (!currentPassword) {
      return { error: "Veuillez entrer votre mot de passe actuel." };
    }
    const res = await auth.api.changePassword({
      body: { newPassword, currentPassword, revokeOtherSessions: false },
      headers: h,
      asResponse: true,
    });
    if (!res.ok) {
      return { error: "Mot de passe actuel incorrect." };
    }
  }

  redirect("/");
}
