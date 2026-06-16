import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CalendarClient from "./calendar-client";

export default async function CalendrierPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const prestations = await prisma.prestation.findMany();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Réserver une date</h1>
      <CalendarClient prestations={prestations} />
    </div>
  );
}
