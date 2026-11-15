import HeaderAvis from "./header-avis";
import Footer from "./footer";
import { LEGAL } from "@/lib/site";

/** Mise en page commune aux pages légales (mentions, confidentialité, cookies). */
export default function LegalPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderAvis />
      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[100px] px-[16px] md:px-[24px] pb-[60px]">
        <article className="legal max-w-[820px] mx-auto bg-[rgba(10,8,40,0.6)] border border-[rgba(80,60,200,0.25)] rounded-[16px] px-[20px] md:px-[40px] py-[28px] md:py-[36px]">
          <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
            — {eyebrow}
          </div>
          <h1 className="text-[22px] md:text-[26px] font-black text-white tracking-[0.06em] uppercase m-0 mb-[6px]">
            {title}
          </h1>
          <p className="text-[12px] text-[rgba(150,130,210,0.6)] m-0 mb-[28px]">
            Dernière mise à jour : {LEGAL.lastUpdated}
          </p>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
