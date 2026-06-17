"use client";

import { useRouter } from "next/navigation";
import { deleteSoiree } from "@/lib/actions/soirees";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimateOnScroll from "@/components/animate-on-scroll";

type Soiree = {
  id: number;
  titre: string;
  date: string;
  lieu: string;
  ville: string;
  description: string | null;
};

export default function SoireeList({
  soirees,
  isAdmin,
}: {
  soirees: Soiree[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Supprimer définitivement cette soirée ?")) return;
    await deleteSoiree(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      {/* En-tête */}
      <AnimateOnScroll>
        <div className="flex justify-between items-center mb-[24px]">
          <div>
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[rgba(120,100,255,0.7)] mb-[8px]">
              — Agenda
            </div>
            <h2 className="text-[22px] font-black text-white tracking-[0.06em] uppercase m-0">
              Soirées à venir
            </h2>
          </div>
          {isAdmin && (
            <Link
              href="/a-venir/ajouter"
              className="px-[22px] py-[10px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[8px] text-white text-[12px] font-bold tracking-[0.08em] uppercase no-underline transition-[background] duration-150"
            >
              Ajouter
            </Link>
          )}
        </div>
      </AnimateOnScroll>

      {soirees.length === 0 ? (
        <p className="text-[rgba(160,140,255,0.6)] italic text-[14px]">
          Aucune soirée à venir pour le moment.
        </p>
      ) : (
        soirees.map((s, i) => (
          <AnimateOnScroll key={s.id} delay={i * 70}>
            <div className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.25)] border-l-[3px] border-l-[rgba(100,80,255,0.55)] rounded-[14px] px-[24px] py-[22px] mb-[14px] transition-[border-color] duration-200 hover:border-[rgba(100,80,255,0.45)]">
              <div className="flex justify-between items-center mb-[10px] pb-[10px] border-b border-[rgba(80,60,200,0.15)]">
                <strong className="text-[14px] font-bold text-white">{s.titre}</strong>
                <span className="text-[12px] text-[rgba(140,120,200,0.65)] tracking-[0.04em]">
                  {s.date}
                </span>
              </div>

              <p className="text-[13px] text-[rgba(190,185,235,0.8)] mb-[4px] leading-[1.6]">
                <span className="text-[rgba(140,120,255,0.7)] font-semibold">Lieu : </span>
                {s.lieu}{s.ville ? `, ${s.ville}` : ""}
              </p>

              {s.description && (
                <p className="text-[13px] text-[rgba(190,185,235,0.8)] mb-[4px] leading-[1.6]">
                  <span className="text-[rgba(140,120,255,0.7)] font-semibold">Description : </span>
                  {s.description}
                </p>
              )}

              {isAdmin && (
                <div className="flex justify-end mt-[10px] pt-[10px] border-t border-[rgba(255,255,255,0.06)]">
                  <Button
                    onClick={() => handleDelete(s.id)}
                    className="px-[16px] py-[7px] bg-transparent border border-[rgba(200,40,70,0.35)] rounded-[7px] text-[rgba(255,100,120,0.75)] text-[12px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-all duration-150 hover:bg-[rgba(180,30,60,0.2)] hover:border-[rgba(220,50,80,0.6)] hover:text-[#ff6478] h-auto"
                  >
                    Supprimer la soirée
                  </Button>
                </div>
              )}
            </div>
          </AnimateOnScroll>
        ))
      )}
    </div>
  );
}
