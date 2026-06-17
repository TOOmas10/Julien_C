import type { Metadata } from "next";
import { readdir, mkdir } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Footer from "@/components/footer";
import PhotosClient from "./photos-client";
import HeaderAvis from "@/components/header-avis";

export const metadata: Metadata = {
  title: "Photos",
  description: "Galerie photos des soirées et événements de DJ Julien C.",
};

export default async function PhotosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.roleId === 2;

  const galleryDir = join(process.cwd(), "public", "gallery");
  let photos: string[] = [];
  try {
    const files = await readdir(galleryDir);
    photos = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  } catch {
    await mkdir(galleryDir, { recursive: true }).catch(() => {});
  }

  return (
    <>
      <HeaderAvis />
      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[1100px] mx-auto pt-[20px]">
          <PhotosClient photos={photos} isAdmin={isAdmin} />
        </div>
      </main>
      <Footer />
    </>
  );
}
