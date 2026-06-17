"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto, deletePhoto } from "@/lib/actions/photos";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import AnimateOnScroll from "@/components/animate-on-scroll";

export default function PhotosClient({
  photos,
  isAdmin,
}: {
  photos: string[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(uploadPhoto, undefined);

  useEffect(() => {
    if (state?.success) {
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxSrc(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleDelete(filename: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    await deletePhoto(filename);
    router.refresh();
  }

  return (
    <>
      {/* En-tête */}
      <AnimateOnScroll>
        <div className="mb-[28px]">
          <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
            — Galerie
          </div>
          <h2 className="text-[22px] font-black text-white tracking-[0.06em] uppercase m-0">
            Photos
          </h2>
        </div>
      </AnimateOnScroll>

      {/* Upload (admin) */}
      {isAdmin && (
        <AnimateOnScroll delay={80}>
          <div className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.35)] rounded-[16px] p-[24px] mb-[32px] shadow-[0_0_40px_rgba(40,20,180,0.1)]">
            <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[rgba(120,100,255,0.75)] mb-[16px] m-0">
              Ajouter une photo
            </h3>
            <form key={formKey} action={formAction}>
              <div className="flex gap-[12px] items-center flex-wrap">
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  required
                  className="flex-1 min-w-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(80,60,200,0.35)] rounded-[8px] text-[rgba(220,215,255,0.9)] text-[13px] p-[9px_14px] outline-none font-[inherit] cursor-pointer file:bg-[#3b2fb5] file:border-none file:rounded-[6px] file:text-white file:text-[12px] file:font-bold file:tracking-[0.06em] file:uppercase file:px-[14px] file:py-[6px] file:mr-[12px] file:cursor-pointer hover:file:bg-[#4c3dd4]"
                />
                <Button
                  type="submit"
                  disabled={pending}
                  className="px-[22px] py-[9px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[8px] text-white text-[12px] font-bold tracking-[0.08em] uppercase whitespace-nowrap transition-[background] duration-150 disabled:opacity-50 h-auto"
                >
                  {pending ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
              {state?.success && (
                <p className="mt-[12px] text-[13px] font-semibold text-[#4ade80] m-0">{state.success}</p>
              )}
              {state?.error && (
                <p className="mt-[12px] text-[13px] font-semibold text-[#ff6478] m-0">{state.error}</p>
              )}
            </form>
          </div>
        </AnimateOnScroll>
      )}

      {/* Grille */}
      {photos.length === 0 ? (
        <AnimateOnScroll delay={100}>
          <p className="text-center text-[rgba(140,120,200,0.5)] italic text-[14px] py-[48px]">
            Aucune photo pour le moment.
          </p>
        </AnimateOnScroll>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px]">
          {photos.map((filename, i) => (
            <div
              key={filename}
              className="group relative rounded-[12px] overflow-hidden border border-[rgba(80,60,200,0.25)] bg-[rgba(10,8,40,0.7)] aspect-[4/3] transition-all duration-300 hover:border-[rgba(100,80,255,0.55)] hover:shadow-[0_0_24px_rgba(60,40,200,0.3)] animate-[fadeUp_0.55s_ease_both]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Image
                src={`/gallery/${filename}`}
                alt="photo"
                fill
                className="object-cover cursor-pointer transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                onClick={() => setLightboxSrc(`/gallery/${filename}`)}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 220px"
              />
              {isAdmin && (
                <Button
                  onClick={() => handleDelete(filename)}
                  className="absolute top-[8px] right-[8px] bg-[rgba(180,30,60,0.75)] border-none rounded-[6px] text-white text-[11px] font-bold tracking-[0.06em] uppercase px-[10px] py-[5px] cursor-pointer opacity-0 group-hover:opacity-100 transition-[opacity,background] duration-150 hover:bg-[rgba(220,40,70,0.9)] h-auto z-10"
                >
                  Suppr.
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[500] flex justify-center items-center bg-black/88 backdrop-blur-[6px] cursor-pointer animate-[pageFade_0.2s_ease_both]"
          onClick={() => setLightboxSrc(null)}
        >
          <Button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-[20px] right-[28px] bg-transparent border-none text-[rgba(220,215,255,0.75)] text-[28px] leading-none cursor-pointer p-0 h-auto hover:bg-transparent hover:text-white transition-transform duration-200 hover:scale-110"
          >
            ✕
          </Button>
          <div
            className="relative max-w-[90vw] max-h-[88vh] animate-[scaleIn_0.25s_ease_both]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxSrc}
              alt="aperçu"
              className="max-w-[90vw] max-h-[88vh] rounded-[10px] shadow-[0_0_60px_rgba(40,20,180,0.3)] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
