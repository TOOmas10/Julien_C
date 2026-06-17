"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

type UploadState = { error?: string; success?: string } | undefined;

export async function uploadPhoto(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) return { error: "Non autorisé" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    return { error: "Format non autorisé. Utilisez JPG, PNG, WEBP ou GIF." };
  if (file.size > 5 * 1024 * 1024)
    return { error: "Fichier trop lourd (5 Mo maximum)." };

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const pathname = `gallery/photo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  await put(pathname, file, { access: "public" });

  revalidatePath("/photos");
  return { success: "Photo ajoutée avec succès." };
}

export async function deletePhoto(blobUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) return;

  try {
    await del(blobUrl);
  } catch {}

  revalidatePath("/photos");
}
