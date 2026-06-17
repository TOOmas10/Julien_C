"use client";

import { useRouter } from "next/navigation";
import { deleteReservation } from "@/lib/actions/reservations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimateOnScroll from "@/components/animate-on-scroll";

type Resa = {
  demandeResaId: number;
  date: string;
  infoComplementaires: string | null;
  prestationType: string;
  statut: string;
};

const badgeClasses: Record<string, string> = {
  Validée: "bg-[rgba(30,180,80,0.15)] border border-[rgba(40,200,90,0.35)] text-[rgba(60,220,110,0.9)]",
  Refusée: "bg-[rgba(180,30,60,0.15)] border border-[rgba(200,40,70,0.35)] text-[rgba(255,100,120,0.9)]",
};
const badgeDefault =
  "bg-[rgba(180,140,30,0.15)] border border-[rgba(200,160,40,0.35)] text-[rgba(230,190,60,0.9)]";

export default function ResaList({ reservations }: { reservations: Resa[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Annuler cette réservation ?")) return;
    await deleteReservation(id);
    router.refresh();
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.25)] rounded-[14px] p-[20px_22px] text-center text-[rgba(160,140,255,0.6)] italic text-[14px]">
        Aucune réservation pour le moment.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[14px]">
      {reservations.map((r, i) => (
        <AnimateOnScroll key={r.demandeResaId} delay={i * 60}>
          <div className="bg-[rgba(10,8,40,0.85)] border border-[rgba(80,60,200,0.25)] rounded-[14px] p-[20px_22px] transition-[border-color] duration-200 hover:border-[rgba(100,80,255,0.45)]">
            <div className="flex justify-between items-center mb-[10px]">
              <span className="text-[14px] font-bold text-white">{r.date}</span>
              <span
                className={`text-[11px] font-bold tracking-[0.06em] uppercase rounded-[6px] px-[10px] py-[4px] ${badgeClasses[r.statut] ?? badgeDefault}`}
              >
                {r.statut}
              </span>
            </div>

            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[rgba(140,120,255,0.75)] mb-[6px]">
              {r.prestationType}
            </div>

            {r.infoComplementaires && (
              <div className="text-[13px] text-[rgba(190,185,235,0.75)] italic mb-[14px]">
                {r.infoComplementaires}
              </div>
            )}

            <div className="flex gap-[8px] mt-[14px] flex-wrap">
              <Link
                href={`/reservations/${r.demandeResaId}/modifier`}
                className="px-[16px] py-[7px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[7px] text-white text-[12px] font-bold tracking-[0.06em] uppercase no-underline transition-[background] duration-150"
              >
                Modifier
              </Link>
              <Button
                onClick={() => handleDelete(r.demandeResaId)}
                className="px-[16px] py-[7px] bg-transparent border border-[rgba(200,40,70,0.35)] rounded-[7px] text-[rgba(255,100,120,0.75)] text-[12px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-all duration-150 hover:bg-[rgba(180,30,60,0.2)] hover:border-[rgba(220,50,80,0.6)] hover:text-[#ff6478] h-auto"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  );
}
