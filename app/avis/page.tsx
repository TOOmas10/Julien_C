import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Form from "next/form";
import HeaderAvis from "@/components/header-avis";
import Footer from "@/components/footer";
import AvisList from "./avis-list";
import { submitAvis } from "@/lib/actions/avis";
import Link from "next/link";
import StarRatingInput from "./star-rating-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AnimateOnScroll from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "Avis",
  description: "Lisez les avis des clients de DJ Julien C et partagez votre expérience.",
};

export default async function AvisPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const avisRaw = await prisma.avis.findMany({
    include: { user: { select: { prenom: true, nom: true, id: true } } },
    orderBy: { date: "desc" },
  });

  const avis = avisRaw.map((a) => ({
    id: a.id,
    contenu: a.contenu,
    note: a.note,
    date: a.date.toLocaleDateString("fr-FR"),
    prenom: a.user.prenom ?? a.user.id,
    nomInitial: (a.user.nom ?? "?")[0].toUpperCase(),
    userId: a.userId,
  }));

  return (
    <>
      <HeaderAvis />

      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[760px] mx-auto flex flex-col gap-[36px] pt-[20px]">

          {/* Titre */}
          <AnimateOnScroll>
            <div>
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
                — Communauté
              </div>
              <h1 className="text-[22px] font-black text-white tracking-[0.06em] uppercase m-0">
                Avis clients
              </h1>
            </div>
          </AnimateOnScroll>

          {/* Formulaire */}
          <AnimateOnScroll delay={100}>
            <section className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.35)] rounded-[16px] p-[28px] shadow-[0_0_40px_rgba(40,20,180,0.1)] transition-[border-color] duration-300 hover:border-[rgba(120,100,255,0.5)]">
              {session ? (
                <>
                  <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[rgba(120,100,255,0.75)] mb-[18px] m-0">
                    Laissez un avis
                  </h3>
                  <Form action={submitAvis} className="flex flex-col">
                    <StarRatingInput />
                    <Textarea
                      name="contenu"
                      placeholder="Votre expérience..."
                      required
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(80,60,200,0.35)] rounded-[10px] text-[rgba(220,215,255,0.9)] text-[14px] p-[14px] resize-y min-h-[110px] outline-none font-[inherit] transition-[border-color] duration-150 mb-[14px] block placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]"
                    />
                    <Button
                      type="submit"
                      className="self-start px-[28px] py-[11px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[8px] text-white text-[13px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-[background] duration-150 h-auto"
                    >
                      Poster
                    </Button>
                  </Form>
                </>
              ) : (
                <p className="text-white text-[14px] m-0">
                  <Link href="/login" className="text-[rgba(140,120,255,0.9)] underline hover:text-white transition-colors duration-150">
                    Connectez-vous
                  </Link>{" "}
                  pour laisser un avis.
                </p>
              )}
            </section>
          </AnimateOnScroll>

          {/* Liste */}
          <AvisList avis={avis} currentUserId={session?.user.id ?? null} />
        </div>
      </main>

      <Footer />
    </>
  );
}
