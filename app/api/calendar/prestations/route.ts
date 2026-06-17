import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prestations = await prisma.prestation.findMany({
    select: { id: true, type: true },
  });
  return NextResponse.json(prestations);
}
