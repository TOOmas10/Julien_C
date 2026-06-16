import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reservations = await prisma.demandeResa.findMany({
    select: { date: true },
  });
  const dates = reservations.map((r) => r.date.toISOString().split("T")[0]);
  return NextResponse.json(dates);
}
