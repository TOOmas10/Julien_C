import type { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import AuthErrorBanner from "@/components/auth-error-banner";
import AnimateOnScroll from "@/components/animate-on-scroll";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Julien C — DJ Événementiel" },
  description:
    "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées. Réservez votre date en ligne.",
};

const pClass = "text-[1.1rem] leading-[1.8] text-[#cfcfcf] m-0 mb-[20px]";
const tagClass =
  "border border-white/[0.08] px-[16px] py-[8px] rounded-full text-[0.8rem] uppercase tracking-[1px] text-[#ddd] transition-all duration-300 cursor-default hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]";

type SearchParams = Promise<{ auth_error?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { auth_error } = await searchParams;

  return (
    <>
      <Header />
      {auth_error && <AuthErrorBanner />}

      {/* Hero */}
      <section
        id="hero"
        className="relative bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_50%,#000_100%),url('/3.png')] bg-cover bg-center h-screen flex justify-center items-center flex-col overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_60%,var(--primary-glow)_0%,transparent_55%)] before:opacity-40 before:pointer-events-none"
      >
        <p className="relative top-5 flex gap-[18px] items-center text-[0.95rem] uppercase text-[var(--text-muted)] tracking-[3px] select-none m-0 z-[1] animate-[fadeUp_1s_ease_0.3s_both]">
          <span>DJ</span>
          <span className="text-[var(--primary-color)] text-[1.2rem] animate-[glowPulse_3s_ease-in-out_infinite]">
            •
          </span>
          <span>Événementiel</span>
        </p>

        <h1 className="text-white flex pt-5 justify-center items-center relative italic text-[clamp(3rem,9vw,7rem)] font-black m-0 tracking-[4px] [text-shadow:0_0_40px_rgb(43,0,142)] z-[1] animate-[fadeUp_1s_ease_0.1s_both] font-['Dear']">
          Julien C
        </h1>

        <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-[1]">
          <div className="flex flex-col items-center gap-[10px] text-[var(--text-muted)] text-[0.75rem] tracking-[3px] uppercase animate-[bounceScroll_2s_ease-in-out_1s_infinite] opacity-60 after:content-[''] after:w-[1px] after:h-[40px] after:bg-[linear-gradient(180deg,var(--primary-color),transparent)]">
            Scroll
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section
        id="presentation"
        className="py-[60px] md:py-[120px] px-[6vw] md:px-[10vw] relative bg-[#050505] border-t border-b border-white/[0.08]"
      >
        <AnimateOnScroll>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] uppercase font-black m-0 mb-[40px] md:mb-[60px] tracking-[2px] text-white">
            Présentation
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[80px] items-start">
          <AnimateOnScroll delay={100} from="left">
            <div>
              <p
                className={`${pClass} first-letter:text-[var(--primary-color)] first-letter:font-bold first-letter:text-[1.4em]`}
              >
                DJ Julien C est un DJ passionné et polyvalent qui met son
                expérience au service de tous vos événements. Qu&apos;il
                s&apos;agisse d&apos;anniversaires, de soirées privées, de
                mariages ou de prestations professionnelles, il sait
                s&apos;adapter à chaque ambiance et proposer une programmation
                musicale parfaitement en accord avec votre public.
              </p>
              <p className={pClass}>
                Grâce à une large culture musicale et une écoute attentive de
                vos envies, il construit des sets dynamiques mêlant classiques
                incontournables et titres actuels pour faire danser toutes les
                générations. Avant chaque prestation, DJ Julien C prend le temps
                d&apos;échanger avec vous afin de définir vos attentes, choisir
                les styles musicaux souhaités et préparer une ambiance sonore
                sur mesure.
              </p>
              <p className={pClass}>
                Pour les soirées privées, il crée une atmosphère conviviale et
                festive où chacun trouve sa place. Dans les mariages, il
                accompagne les moments forts avec précision : entrée des mariés,
                ouverture de bal, animations et soirée dansante sont orchestrées
                avec soin.
              </p>
              <p className={pClass}>
                Avec un matériel fiable, une organisation sérieuse et un sens du
                contact naturel, il assure une prestation fluide, agréable et
                sans stress. Son objectif est simple : créer une ambiance
                inoubliable, rassembler vos invités autour de la musique et
                offrir une soirée dont chacun se souviendra.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 gap-[20px] md:sticky md:top-[120px]">
            <div className="col-span-2 flex flex-wrap gap-[10px] mt-[10px]">
              {[
                { label: "Mariages", delay: 150 },
                { label: "Soirées privées", delay: 220 },
              ].map(({ label, delay }) => (
                <AnimateOnScroll key={label} delay={delay} from="bottom">
                  <span className={tagClass}>{label}</span>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <AnimateOnScroll from="fade">
        <section
          id="contact"
          className="relative py-[80px] md:py-[140px] px-[6vw] md:px-[10vw] text-center bg-black bg-[radial-gradient(circle_at_50%_50%,rgba(8,0,115,0.74)_0%,transparent_60%)] overflow-hidden before:content-[''] before:absolute before:w-[1px] before:h-[60px] before:bg-[var(--primary-color)] before:left-1/2 before:top-0 after:content-[''] after:absolute after:w-[1px] after:h-[60px] after:bg-[var(--primary-color)] after:left-1/2 after:bottom-0"
        >
          <h2 className="text-[clamp(2rem,6vw,4.5rem)] uppercase font-black m-0 mb-[20px] tracking-[2px] leading-[1.1] text-white">
            Prêt à faire vibrer
            <span className="text-[var(--primary-color)] block">
              votre événement ?
            </span>
          </h2>
          <p className="text-[1.1rem] text-[var(--text-muted)] max-w-[600px] mx-auto mb-[50px] leading-[1.7]">
            Contactez DJ Julien C dès maintenant pour réserver une date. Chaque
            événement mérite une ambiance unique.
          </p>
          <div className="flex gap-[20px] justify-center flex-wrap">
            <Link
              href="/calendrier"
              className="py-[16px] md:py-[18px] px-[32px] md:px-[40px] rounded-lg uppercase tracking-[2px] font-bold text-[0.95rem] no-underline inline-block bg-[var(--primary-color)] text-white animate-[glowPulse_3s_ease-in-out_infinite] transition-transform duration-300 hover:-translate-y-[4px]"
            >
              Réserver une date
            </Link>
          </div>
        </section>
      </AnimateOnScroll>

      <Footer />
    </>
  );
}
