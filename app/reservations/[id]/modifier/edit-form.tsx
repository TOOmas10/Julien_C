"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReservation } from "@/lib/actions/reservations";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Prestation = { id: number; type: string };

const inputClass =
  "appearance-none w-[78%] bg-[rgba(255,255,255,0.05)] border border-[rgba(80,60,200,0.35)] rounded-lg text-[rgba(220,215,255,0.9)] text-[13px] py-[9px] px-[14px] outline-none flex mx-auto my-[6px] transition-[border-color] duration-[150ms] placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]";
const buttonClass =
  "w-[78%] py-[10px] border-none rounded-lg text-white text-[12px] font-bold tracking-[0.1em] uppercase cursor-pointer block mx-auto mt-[8px] transition-[background] duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed h-auto";
const labelClass =
  "text-white text-[1.1em] font-black tracking-[0.15em] uppercase flex justify-center pt-[22px] pb-[14px] m-0";

export default function EditForm({
  demandeResaId,
  initialDate,
  initialPrestationId,
  initialInfo,
  prestations,
}: {
  demandeResaId: number;
  initialDate: string;
  initialPrestationId: number;
  initialInfo: string;
  prestations: Prestation[];
}) {
  const router = useRouter();
  const [prestationId, setPrestationId] = useState(initialPrestationId);
  const boundAction = updateReservation.bind(null, demandeResaId);

  return (
    <main className="flex justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)]">
      <div className="w-[340px] rounded-[18px] overflow-hidden relative border border-[rgba(80,60,200,0.4)] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] bg-[rgba(10,8,40,0.95)] pb-[24px]">
        <Form action={boundAction} className="flex flex-col">
          <p className={labelClass}>Modifier réservation</p>

          <Input
            className={inputClass}
            type="date"
            name="date"
            required
            defaultValue={initialDate}
          />

          <select
            name="prestationId"
            value={prestationId}
            onChange={(e) => setPrestationId(parseInt(e.target.value))}
            className={`calendar-select ${inputClass} pr-[36px]`}
          >
            {prestations.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0d0a2e]">
                {p.type}
              </option>
            ))}
          </select>

          <Input
            className={inputClass}
            type="text"
            name="infoComplementaires"
            placeholder="Informations complémentaires"
            defaultValue={initialInfo}
          />

          <Button
            className={`${buttonClass} bg-[#3b2fb5] hover:bg-[#4c3dd4] mt-[14px]`}
            type="submit"
          >
            Enregistrer
          </Button>
          <Button
            className={`${buttonClass} bg-[rgba(80,80,100,0.5)] hover:bg-[rgba(100,100,120,0.6)]`}
            type="button"
            onClick={() => router.push("/reservations")}
          >
            Annuler
          </Button>
        </Form>
      </div>
    </main>
  );
}
