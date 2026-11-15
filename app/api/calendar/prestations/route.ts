import { NextResponse } from "next/server";
import { getPrestations } from "@/lib/calendar-data";

export async function GET() {
  return NextResponse.json(await getPrestations());
}
