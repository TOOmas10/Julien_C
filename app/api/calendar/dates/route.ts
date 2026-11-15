import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReservedDates } from "@/lib/calendar-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.json(await getReservedDates());
}
