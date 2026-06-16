"use client";

import { useState, useEffect } from "react";
import { createReservation } from "@/lib/actions/reservations";
import { toast } from "sonner";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

type Prestation = { id: number; type: string };

export default function CalendarClient({ prestations }: { prestations: Prestation[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/calendar/dates")
      .then((r) => r.json())
      .then(setReservedDates);
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createReservation(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.success) {
      toast.success("Réservation envoyée ! Elle est en attente de validation.");
      setSelectedDate(null);
      fetch("/api/calendar/dates").then((r) => r.json()).then(setReservedDates);
    }
  }

  return (
    <div className="card-dj" style={{ background: "linear-gradient(135deg, #0a0a14, #0d0a2e)", boxShadow: "0 0 40px rgba(59,47,181,0.2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-white/60 hover:text-white text-xl px-3 py-1 transition">‹</button>
        <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="text-white/60 hover:text-white text-xl px-3 py-1 transition">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-white/40 text-xs py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isReserved = reservedDates.includes(dateStr);
          const isPast = new Date(dateStr) < new Date(new Date().toDateString());
          const disabled = isReserved || isPast;

          return (
            <button
              key={day}
              onClick={() => !disabled && setSelectedDate(dateStr)}
              disabled={disabled}
              className={[
                "h-10 w-full rounded-lg text-sm font-medium transition",
                isReserved ? "bg-red-500/30 text-red-400 cursor-not-allowed" : "",
                isPast && !isReserved ? "text-white/20 cursor-not-allowed" : "",
                !disabled ? "hover:bg-[#3b2fb5]/40 text-white hover:text-white cursor-pointer" : "",
                selectedDate === dateStr ? "bg-[#3b2fb5] text-white" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Dialog */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0a2e] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6">
              Réserver le {new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="date" value={selectedDate} />
              <textarea
                name="infoComplementaires"
                placeholder="Informations complémentaires..."
                rows={3}
                className="input-dj resize-none"
              />
              <select name="prestationId" required defaultValue="" className="input-dj bg-transparent">
                <option value="" disabled>Type de prestation</option>
                {prestations.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0d0a2e]">{p.type}</option>
                ))}
              </select>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setSelectedDate(null)} className="flex-1 py-3 border border-white/20 rounded-lg text-white/60 hover:text-white transition">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary">
                  {loading ? "Envoi..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
