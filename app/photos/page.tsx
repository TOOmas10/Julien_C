import type { Metadata } from "next";
import { list } from "@vercel/blob";
import Footer from "@/components/footer";
import PhotosClient from "./photos-client";
import HeaderAvis from "@/components/header-avis";

export const metadata: Metadata = {
  title: "Photos",
  description: "Galerie photos des soirées et événements de DJ Julien C.",
  alternates: { canonical: "/photos" },
};

// Page statique : la liste des photos n'est plus demandée à Vercel Blob à
// chaque visite. Régénérée à chaque ajout/suppression (revalidatePath dans
// les actions) et au plus tard toutes les heures.
export const revalidate = 3600;

export default async function PhotosPage() {
  let photos: string[] = [];
  try {
    const { blobs } = await list({ prefix: "gallery/" });
    photos = blobs.map((b) => b.url);
  } catch {}

  return (
    <>
      <HeaderAvis />
      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[1100px] mx-auto pt-[20px]">
          <PhotosClient photos={photos} />
        </div>
      </main>
      <Footer />
    </>
  );
}
