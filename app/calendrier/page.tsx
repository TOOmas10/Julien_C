import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Calendrier",
  description: "Consultez les disponibilités de DJ Julien C et réservez votre date en ligne.",
  robots: { index: false, follow: false },
};
import { auth } from "@/lib/auth";
import Footer from "@/components/footer";
import CalendarClient from "./calendar-client";
import HeaderAvis from "@/components/header-avis";

export default async function CalendarPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/?auth_error=1");

  return (
    <>
      <HeaderAvis />
      <CalendarClient />
      <Footer />
    </>
  );
}
