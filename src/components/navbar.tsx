import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import NavClient from "./nav-client";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;
  const isAdmin = user && (user as any).roleId === 2;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={36} height={36} />
          <span style={{ fontFamily: "Optima, serif", color: "#fff", fontSize: "1.1rem" }}>
            Julien C
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-white transition">Accueil</Link>
          <Link href="/calendrier" className="hover:text-white transition">Calendrier</Link>
          <Link href="/avis" className="hover:text-white transition">Avis</Link>
          <Link href="/a-venir" className="hover:text-white transition">À Venir</Link>
          <Link href="/photos" className="hover:text-white transition">Photos</Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-white transition text-[#3b2fb5]">Admin</Link>
          )}
        </div>

        <NavClient user={user} />
      </div>
    </nav>
  );
}
