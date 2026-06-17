"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitAvis(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const contenu = (formData.get("contenu") as string).trim();
  if (!contenu) return;
  const note = Math.min(5, Math.max(1, parseInt(formData.get("note") as string) || 5));

  await prisma.avis.create({
    data: { contenu, note, userId: session.user.id },
  });

  redirect("/avis");
}

export async function deleteAvis(avisId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  await prisma.avis.deleteMany({
    where: { id: avisId, userId: session.user.id },
  });
}
