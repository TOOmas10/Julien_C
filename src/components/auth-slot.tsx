"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";

/**
 * Bouton « Connexion » ou menu utilisateur, résolu côté navigateur.
 * Le header n'a ainsi plus besoin de lire la session côté serveur, ce qui
 * permet de servir les pages publiques en statique (depuis le CDN).
 */
export default function AuthSlot() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  if (user) {
    return (
      <UserMenu
        prenom={user.prenom ?? user.name.split(" ")[0]}
        isAdmin={user.roleId === 2}
      />
    );
  }

  return (
    <Link
      href="/login"
      aria-hidden={isPending || undefined}
      tabIndex={isPending ? -1 : undefined}
      className={`px-[14px] md:px-[22px] py-[8px] md:py-[10px] border border-purple-700/50 rounded-lg text-purple-200/90 text-[0.8rem] md:text-[0.85rem] font-bold tracking-[0.08em] uppercase no-underline transition-all duration-200 whitespace-nowrap hover:bg-[rgba(60,40,180,0.25)] hover:border-purple-500/70 hover:text-white ${
        isPending ? "invisible" : ""
      }`}
    >
      <span className="hidden sm:inline">Connexion / Inscription</span>
      <span className="sm:hidden">Connexion</span>
    </Link>
  );
}
