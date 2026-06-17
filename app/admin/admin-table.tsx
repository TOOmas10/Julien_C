"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReservationEtat, deleteReservationAdmin } from "@/lib/actions/reservations";
import { Button } from "@/components/ui/button";

type AdminResa = {
  demandeResaId: number;
  prenom: string;
  nom: string;
  email: string;
  tel: string | null;
  date: string;
  prestationType: string;
  infoComplementaires: string | null;
  statut: string;
  etatId: number;
};

const badgeClasses: Record<string, string> = {
  "Validée":
    "bg-[rgba(20,160,90,0.15)] border border-[rgba(40,180,100,0.35)] text-[rgba(60,210,130,0.9)]",
  "Refusée":
    "bg-[rgba(180,30,60,0.15)] border border-[rgba(200,40,70,0.35)] text-[rgba(255,100,120,0.9)]",
};
const badgeDefault =
  "bg-[rgba(180,130,20,0.2)] border border-[rgba(200,150,30,0.4)] text-[rgba(255,190,60,0.9)]";

function ResaRow({
  resa,
  onDelete,
}: {
  resa: AdminResa;
  onDelete: (id: number) => Promise<void>;
}) {
  const [etatId, setEtatId] = useState(resa.etatId);
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    setSaving(true);
    await updateReservationEtat(resa.demandeResaId, etatId);
    setSaving(false);
  }

  const badgeStatut = etatId === 1 ? "Validée" : etatId === 2 ? "Refusée" : "En attente";

  return (
    <tr className="hover:[&>td]:bg-[rgba(60,40,180,0.1)] transition-colors">
      <td className="px-[16px] py-[14px] text-[13px] border-b border-[rgba(80,60,200,0.12)] align-middle">
        <strong className="text-white font-bold">
          {resa.prenom} {resa.nom}
        </strong>
      </td>
      <td className="px-[16px] py-[14px] text-[13px] border-b border-[rgba(80,60,200,0.12)] align-middle">
        <div className="flex flex-col gap-[3px]">
          <span className="text-[rgba(140,120,255,0.8)] text-[12px]">{resa.email}</span>
          <span className="text-[rgba(170,160,220,0.6)] text-[12px]">{resa.tel ?? "—"}</span>
        </div>
      </td>
      <td className="px-[16px] py-[14px] text-[13px] text-[rgba(210,205,250,0.85)] border-b border-[rgba(80,60,200,0.12)] align-middle whitespace-nowrap">
        {resa.date}
      </td>
      <td className="px-[16px] py-[14px] text-[13px] text-[rgba(210,205,250,0.85)] border-b border-[rgba(80,60,200,0.12)] align-middle">
        {resa.prestationType}
      </td>
      <td className="px-[16px] py-[14px] text-[13px] border-b border-[rgba(80,60,200,0.12)] align-middle max-w-[180px]">
        <span className="text-[rgba(170,160,210,0.65)] italic">
          {resa.infoComplementaires || "—"}
        </span>
      </td>
      <td className="px-[16px] py-[14px] text-[13px] border-b border-[rgba(80,60,200,0.12)] align-middle">
        <span
          className={`inline-block px-[10px] py-[4px] rounded-[6px] text-[11px] font-bold tracking-[0.08em] uppercase ${badgeClasses[badgeStatut] ?? badgeDefault}`}
        >
          {badgeStatut}
        </span>
      </td>
      <td className="px-[16px] py-[14px] text-[13px] border-b border-[rgba(80,60,200,0.12)] align-middle">
        <div className="flex gap-[6px] items-center">
          <select
            value={etatId}
            onChange={(e) => setEtatId(parseInt(e.target.value))}
            className="admin-select appearance-none bg-[rgba(255,255,255,0.07)] border border-[rgba(140,120,255,0.35)] rounded-[10px] text-[#e8e4ff] text-[14px] font-medium py-[8px] pl-[14px] pr-[36px] outline-none cursor-pointer transition-[border-color,background] duration-200 hover:border-[rgba(160,140,255,0.6)] hover:bg-[rgba(255,255,255,0.1)] focus:border-[rgba(180,160,255,0.7)] focus:shadow-[0_0_0_3px_rgba(120,100,255,0.2)]"
          >
            <option value={3}>En attente</option>
            <option value={1}>Validée</option>
            <option value={2}>Refusée</option>
          </select>
          <Button
            onClick={handleUpdate}
            disabled={saving}
            className="px-[12px] py-[7px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[7px] text-white text-[12px] font-bold tracking-[0.06em] uppercase cursor-pointer whitespace-nowrap transition-[background] duration-150 disabled:opacity-50 h-auto"
          >
            {saving ? "…" : "OK"}
          </Button>
          <Button
            onClick={() => onDelete(resa.demandeResaId)}
            className="px-[12px] py-[7px] bg-transparent border border-[rgba(200,40,70,0.35)] rounded-[7px] text-[rgba(255,100,120,0.75)] text-[12px] font-semibold tracking-[0.06em] uppercase cursor-pointer whitespace-nowrap transition-all duration-150 hover:bg-[rgba(180,30,60,0.2)] hover:border-[rgba(220,50,80,0.6)] hover:text-[#ff6478] h-auto"
          >
            Suppr.
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminTable({ reservations }: { reservations: AdminResa[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette réservation ?")) return;
    await deleteReservationAdmin(id);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto border border-[rgba(80,60,200,0.35)] rounded-[16px] shadow-[0_0_60px_rgba(40,20,180,0.12)] bg-[rgba(10,8,40,0.85)]">
      <table className="border-collapse w-full text-[rgba(220,215,255,0.9)] bg-transparent">
        <thead>
          <tr className="bg-[rgba(20,14,60,0.95)] border-b border-[rgba(80,60,200,0.35)]">
            {["Client", "Contact", "Date", "Prestation", "Info", "État", "Action"].map((h) => (
              <th
                key={h}
                className="px-[16px] py-[14px] text-[11px] font-bold tracking-[0.15em] uppercase text-[rgba(140,120,255,0.75)] text-left whitespace-nowrap border-none"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center text-[rgba(140,120,200,0.5)] italic px-[16px] py-[32px] border-none"
              >
                Aucune réservation.
              </td>
            </tr>
          ) : (
            reservations.map((r) => (
              <ResaRow key={r.demandeResaId} resa={r} onDelete={handleDelete} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
