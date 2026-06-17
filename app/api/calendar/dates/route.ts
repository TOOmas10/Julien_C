import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const reservations = await prisma.demandeResa.findMany({
    select: { date: true },
  });
  const dates = reservations.map((r) => r.date.toISOString().split("T")[0]);
  return NextResponse.json(dates);
}
