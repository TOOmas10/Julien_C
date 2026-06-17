"use client";

import { useRouter } from "next/navigation";
import { deleteAvis } from "@/lib/actions/avis";
import { Button } from "@/components/ui/button";
import AnimateOnScroll from "@/components/animate-on-scroll";

type AvisItem = {
  id: number;
  contenu: string;
  note: number;
  date: string;
  prenom: string;
  nomInitial: string;
  userId: string;
};

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-[2px] mb-[10px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-[18px] leading-none ${
            star <= note
              ? "text-[#f5c542] drop-shadow-[0_0_4px_rgba(245,197,66,0.5)]"
              : "text-[rgba(255,255,255,0.12)]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function AvisList({
  avis,
  currentUserId,
}: {
  avis: AvisItem[];
  currentUserId: string | null;
}) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet avis ?")) return;
    await deleteAvis(id);
    router.refresh();
  }

  if (avis.length === 0) {
    return (
      <p className="text-center text-[rgba(140,120,200,0.5)] italic text-[14px]">
        Aucun avis pour le moment.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-[16px]">
      {avis.map((a, i) => (
        <AnimateOnScroll key={a.id} delay={i * 60}>
          <div className="bg-[rgba(10,8,40,0.8)] border border-[rgba(80,60,200,0.25)] rounded-[14px] px-[24px] py-[22px] transition-[border-color] duration-200 hover:border-[rgba(100,80,255,0.45)]">
            <div className="flex justify-between items-center mb-[12px]">
              <strong className="text-[14px] font-bold text-white tracking-[0.04em]">
                {a.prenom} {a.nomInitial}.
              </strong>
              <span className="text-[12px] text-[rgba(140,120,200,0.6)] tracking-[0.04em]">
                {a.date}
              </span>
            </div>

            <Stars note={a.note} />

            <p className="text-[14px] text-[rgba(200,195,240,0.85)] leading-[1.7] italic m-0">
              &ldquo; {a.contenu} &rdquo;
            </p>

            {currentUserId === a.userId && (
              <div className="flex justify-end mt-[14px]">
                <Button
                  onClick={() => handleDelete(a.id)}
                  className="px-[16px] py-[7px] bg-transparent border border-[rgba(200,40,70,0.35)] rounded-[7px] text-[rgba(255,100,120,0.75)] text-[12px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-all duration-150 hover:bg-[rgba(180,30,60,0.2)] hover:border-[rgba(220,50,80,0.6)] hover:text-[#ff6478] h-auto"
                >
                  Supprimer mon avis
                </Button>
              </div>
            )}
          </div>
        </AnimateOnScroll>
      ))}
    </section>
  );
}
