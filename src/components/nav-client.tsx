"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  roleId?: number;
} | null;

export default function NavClient({ user }: { user: User }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <div className="relative hidden md:block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-white/80 hover:text-white text-sm transition"
          >
            Bienvenue, {user.name.split(" ")[0]} ▾
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-black/90 border border-white/10 rounded-lg w-48 py-2 z-50 backdrop-blur-md">
              <Link href="/profil" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>Mon profil</Link>
              <Link href="/reservations" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition">Déconnexion</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="btn-primary text-sm px-4 py-2 rounded-lg hidden md:inline-block">
          Connexion
        </Link>
      )}

      {/* Burger mobile */}
      <button
        className="md:hidden text-white ml-2 w-11 h-11 flex items-center justify-center"
        onClick={() => setBurgerOpen((o) => !o)}
        aria-label="Menu"
      >
        <span className="text-2xl">{burgerOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile menu overlay */}
      {burgerOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          <button className="absolute top-4 right-4 text-white text-2xl w-11 h-11 flex items-center justify-center" onClick={() => setBurgerOpen(false)}>✕</button>
          {[
            { href: "/", label: "Accueil" },
            { href: "/calendrier", label: "Calendrier" },
            { href: "/avis", label: "Avis" },
            { href: "/a-venir", label: "À Venir" },
            { href: "/photos", label: "Photos" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-white text-2xl hover:text-[#3b2fb5] transition" onClick={() => setBurgerOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profil" className="text-white text-xl" onClick={() => setBurgerOpen(false)}>Mon profil</Link>
              <Link href="/reservations" className="text-white text-xl" onClick={() => setBurgerOpen(false)}>Mes réservations</Link>
              <button onClick={() => { handleLogout(); setBurgerOpen(false); }} className="text-white/60 text-lg">Déconnexion</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-lg px-6 py-3" onClick={() => setBurgerOpen(false)}>Connexion</Link>
          )}
        </div>
      )}
    </div>
  );
}
