"use client";

import Form from "next/form";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { submitAvis } from "@/lib/actions/avis";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRatingInput from "./star-rating-input";

/** Formulaire d'avis (membres connectés) ou invitation à se connecter. */
export default function AvisForm() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="min-h-[21px]" aria-hidden />;
  }

  if (!session) {
    return (
      <p className="text-white text-[14px] m-0">
        <Link href="/login" className="text-[rgba(140,120,255,0.9)] underline hover:text-white transition-colors duration-150">
          Connectez-vous
        </Link>{" "}
        pour laisser un avis.
      </p>
    );
  }

  return (
    <>
      <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[rgba(120,100,255,0.75)] mb-[18px] m-0">
        Laissez un avis
      </h2>
      <Form action={submitAvis} className="flex flex-col">
        <StarRatingInput />
        <Textarea
          name="contenu"
          placeholder="Votre expérience..."
          required
          maxLength={2000}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(80,60,200,0.35)] rounded-[10px] text-[rgba(220,215,255,0.9)] text-[14px] p-[14px] resize-y min-h-[110px] outline-none font-[inherit] transition-[border-color] duration-150 mb-[14px] block placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]"
        />
        <p className="text-[11px] text-[rgba(160,140,220,0.6)] leading-relaxed m-0 mb-[14px]">
          Votre prénom et l&apos;initiale de votre nom seront affichés publiquement avec votre avis.
          Vous pouvez le supprimer à tout moment.{" "}
          <Link href="/politique-de-confidentialite" className="underline hover:text-white">
            En savoir plus
          </Link>
        </p>
        <Button
          type="submit"
          className="self-start px-[28px] py-[11px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[8px] text-white text-[13px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-[background] duration-150 h-auto"
        >
          Poster
        </Button>
      </Form>
    </>
  );
}
