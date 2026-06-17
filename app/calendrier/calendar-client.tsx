"use client";

import { useState, useEffect, useCallback } from "react";
import { createReservation } from "@/lib/actions/reservations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const STARTING_YEAR = 2025;
const TOTAL_CELLS = 42;

function getFebLength(year: number): number {
  return year % 4 === 0 ? 29 : 28;
}

function getMonthData(targetYear: number, targetMonth: number) {
  const monthnb = targetMonth + 12 * (targetYear - STARTING_YEAR);

  const cld: { dayStart: number; length: number; year: number; month: string }[] = [
    { dayStart: 2, length: 31, year: STARTING_YEAR, month: "janvier" },
  ];

  for (let i = 0; i < monthnb - 1; i++) {
    const yearSimule = STARTING_YEAR + Math.floor(i / 12);
    const monthsLen = [31, getFebLength(yearSimule), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthIdx = i + 1 - (yearSimule - STARTING_YEAR) * 12;

    cld[i + 1] = {
      dayStart: (cld[i].dayStart + monthsLen[monthIdx - 1]) % 7,
      length: monthsLen[monthIdx] ?? 31,
      year: STARTING_YEAR + Math.floor((i + 1) / 12),
      month: MONTH_NAMES[monthIdx] ?? "janvier",
    };
  }

  return cld[cld.length - 1];
}

interface Prestation {
  id: number;
  type: string;
}

const caseBase =
  "w-full py-[8px] md:py-[10px] px-[2px] text-center text-[12px] md:text-[14px] font-medium text-[rgba(220,215,255,0.85)] cursor-pointer rounded-[8px] transition-all duration-[150ms] ease select-none";
const caseHover =
  "hover:bg-[rgba(60,40,200,0.35)] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(100,80,255,0.4)]";
const caseReserved =
  "bg-[rgba(180,30,60,0.2)] text-[rgba(255,100,120,0.8)] shadow-[inset_0_0_0_1px_rgba(200,40,70,0.3)] cursor-default pointer-events-none";
const casePast =
  "opacity-25 cursor-not-allowed pointer-events-none";
const inputClass =
  "appearance-none w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(80,60,200,0.35)] rounded-[8px] text-[rgba(220,215,255,0.9)] text-[14px] py-[11px] px-[14px] outline-none transition-[border-color] duration-[150ms] placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]";
const selectClass =
  "calendar-select appearance-none w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(80,60,200,0.35)] rounded-[8px] text-[rgba(220,215,255,0.9)] text-[14px] py-[11px] pl-[14px] pr-[36px] outline-none transition-[border-color] duration-[150ms] cursor-pointer focus:border-[rgba(120,100,255,0.6)] [&_option]:bg-[#1a1440] [&_option]:text-[rgba(220,215,255,0.9)]";
const btnPrimary =
  "flex-1 py-[12px] bg-[#3b2fb5] border-none rounded-[8px] text-white text-[13px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-[background] duration-[150ms] hover:bg-[#4c3dd4]";
const btnSecondary =
  "flex-1 py-[12px] bg-transparent border border-[rgba(80,60,200,0.35)] rounded-[8px] text-[rgba(160,140,255,0.8)] text-[13px] font-semibold tracking-[0.08em] uppercase cursor-pointer transition-all duration-[150ms] hover:border-[rgba(120,100,255,0.6)] hover:text-white";

export default function CalendarClient() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; date: string }>({ open: false, date: "" });
  const [formInfo, setFormInfo] = useState("");
  const [formPrestation, setFormPrestation] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/dates");
      const data: string[] = await res.json();
      setReservedDates(data);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    fetch("/api/calendar/prestations")
      .then((r) => r.json())
      .then((data: Prestation[]) => setPrestations(data))
      .catch(() => {});
  }, [fetchReservations]);

  function prevMonth() {
    if (year <= STARTING_YEAR && month <= 1) return;
    if (month > 1) setMonth((m) => m - 1);
    else { setYear((y) => y - 1); setMonth(12); }
  }

  function nextMonth() {
    if (month < 12) setMonth((m) => m + 1);
    else { setYear((y) => y + 1); setMonth(1); }
  }

  const monthData = getMonthData(year, month);
  const cells = Array.from({ length: TOTAL_CELLS }, (_, i) => {
    const day = i - monthData.dayStart + 1;
    return day >= 1 && day <= monthData.length ? day : null;
  });

  function isPast(day: number): boolean {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return new Date(year, month - 1, day) < todayMidnight;
  }

  function isReserved(day: number) {
    const d = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservedDates.includes(d);
  }

  function handleCellClick(day: number | null) {
    if (!day || isPast(day) || isReserved(day)) return;
    const d = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDialog({ open: true, date: d });
  }

  async function handleSubmit() {
    const formData = new FormData();
    formData.append("date", dialog.date);
    formData.append("infoComplementaires", formInfo);
    formData.append("prestationId", formPrestation);
    const result = await createReservation(formData);
    if (result?.success) {
      setDialog({ open: false, date: "" });
      setFormInfo("");
      setFormPrestation("");
      await fetchReservations();
      setNotification("Réservation envoyée !");
      setTimeout(() => setNotification(null), 2500);
    }
  }

  function handleCancel() {
    setDialog({ open: false, date: "" });
    setFormInfo("");
    setFormPrestation("");
  }

  const titleText = `${monthData.month.toUpperCase()} ${monthData.year}`;

  return (
    <main className="flex justify-center items-center w-screen min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] px-4">
      <section className="w-full md:w-[60%] max-w-[680px] border border-[rgba(80,60,200,0.35)] rounded-[16px] overflow-hidden bg-[rgba(10,8,40,0.85)] shadow-[0_0_60px_rgba(40,20,180,0.15),0_0_0_1px_rgba(100,80,255,0.1)] animate-[scaleIn_0.5s_ease_both]">
        {/* En-tête mois */}
        <div className="flex justify-between items-center px-[16px] md:px-[24px] py-[14px] md:py-[18px] bg-[rgba(20,14,60,0.9)] border-b border-[rgba(80,60,200,0.25)]">
          <Button
            onClick={prevMonth}
            className="bg-[rgba(60,40,180,0.2)] border border-[rgba(80,60,200,0.4)] text-[#a0a0ff] w-[34px] h-[34px] rounded-[8px] cursor-pointer text-[13px] flex items-center justify-center transition-all duration-[150ms] ease hover:bg-[rgba(80,60,220,0.4)] hover:text-white hover:border-[rgba(120,100,255,0.7)]"
          >
            ◀
          </Button>
          <h1 className="m-0 text-white text-[13px] md:text-[15px] font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase">
            {titleText}
          </h1>
          <Button
            onClick={nextMonth}
            className="bg-[rgba(60,40,180,0.2)] border border-[rgba(80,60,200,0.4)] text-[#a0a0ff] w-[34px] h-[34px] rounded-[8px] cursor-pointer text-[13px] flex items-center justify-center transition-all duration-[150ms] ease hover:bg-[rgba(80,60,220,0.4)] hover:text-white hover:border-[rgba(120,100,255,0.7)]"
          >
            ▶
          </Button>
        </div>

        {/* Grille */}
        <div className="w-full flex flex-col px-[8px] md:px-[16px] pb-[16px] md:pb-[20px]">
          {/* Jours de la semaine */}
          <div className="flex justify-center pt-[10px] md:pt-[14px] pb-[6px] md:pb-[8px]">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div
                key={i}
                className="w-full text-center text-[10px] md:text-[11px] font-bold tracking-[0.1em] text-[rgba(140,120,255,0.7)] uppercase"
              >
                <span className="hidden md:inline">
                  {["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."][i]}
                </span>
                <span className="md:hidden">{d}</span>
              </div>
            ))}
          </div>

          {/* Semaines */}
          {Array.from({ length: 6 }, (_, week) => (
            <div key={week} className="w-full flex justify-center mb-[2px] md:mb-[4px]">
              {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
                const past = day !== null && isPast(day);
                const reserved = day !== null && !past && isReserved(day);
                return (
                  <div
                    key={i}
                    onClick={() => handleCellClick(day)}
                    className={`${caseBase} ${
                      past ? casePast :
                      reserved ? caseReserved :
                      day !== null ? caseHover :
                      ""
                    }`}
                  >
                    {day ?? ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Dialog réservation */}
      {dialog.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-[3px] px-4">
          <div className="w-full max-w-[320px] rounded-[14px] border border-[rgba(80,60,200,0.35)] bg-[rgba(12,8,40,0.97)] shadow-[0_0_60px_rgba(40,20,180,0.2)] p-[24px] md:p-[28px] flex flex-col gap-[12px]">
            <p className="m-0 text-center text-white text-[13px] font-bold tracking-[0.15em] uppercase">
              Réserver une date
            </p>
            <Input type="date" value={dialog.date} readOnly className={inputClass} />
            <Input
              type="text"
              placeholder="Informations complémentaires"
              value={formInfo}
              onChange={(e) => setFormInfo(e.target.value)}
              className={inputClass}
            />
            <select
              value={formPrestation}
              onChange={(e) => setFormPrestation(e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>-- Type de prestation --</option>
              {prestations.map((p) => (
                <option key={p.id} value={p.id.toString()}>{p.type}</option>
              ))}
            </select>
            <div className="flex gap-[10px] mt-[4px]">
              <Button onClick={handleSubmit} className={`${btnPrimary} h-auto`}>Valider</Button>
              <Button onClick={handleCancel} className={`${btnSecondary} h-auto`}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-[30px] right-[16px] md:right-[40px] bg-[rgba(20,180,100,0.15)] border border-[rgba(40,200,120,0.5)] text-[#4ade80] text-[13px] font-semibold px-[20px] py-[12px] rounded-[10px] tracking-[0.05em] animate-[fadeOut_2.5s_ease-in-out_forwards]">
          {notification}
        </div>
      )}
    </main>
  );
}
