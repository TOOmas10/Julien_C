import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

/** Dates déjà prises (format AAAA-MM-JJ). Toujours lues en direct : pas de cache. */
export async function getReservedDates(): Promise<string[]> {
  const rows = await prisma.demandeResa.findMany({ select: { date: true } });
  return rows.map((r) => r.date.toISOString().split("T")[0]);
}

/** Types de prestation : quasiment jamais modifiés, mis en cache 24 h. */
export const getPrestations = unstable_cache(
  async () => prisma.prestation.findMany({ select: { id: true, type: true } }),
  ["prestations"],
  { revalidate: 86400, tags: ["prestations"] }
);
