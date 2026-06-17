"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  prenom: string;
  isAdmin: boolean;
}

const itemClass =
  "block px-[18px] py-[10px] text-[0.83rem] text-[rgba(200,190,255,0.85)] no-underline tracking-[0.05em] uppercase font-semibold transition-all duration-150 hover:bg-[rgba(60,40,180,0.25)] hover:text-white cursor-pointer w-full text-left border-none bg-transparent";

export default function UserMenu({ prenom, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <Button
        onClick={() => setOpen((o) => !o)}
        className="px-[14px] md:px-[22px] py-[8px] md:py-[10px] border border-purple-700/50 rounded-lg text-purple-200/90 text-[0.8rem] md:text-[0.85rem] font-bold tracking-[0.08em] uppercase transition-all duration-200 whitespace-nowrap bg-transparent cursor-pointer hover:bg-[rgba(60,40,180,0.25)] hover:border-purple-500/70 hover:text-white h-auto"
      >
        {prenom} ▼
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-[3px] min-w-[200px] rounded-[10px] border border-[rgba(80,60,200,0.35)] bg-[rgba(12,8,40,0.97)] backdrop-blur-[12px] shadow-[0_8px_32px_rgba(40,20,180,0.25)] overflow-hidden py-[6px] z-[200]">
          <Link href="/profil" className={itemClass} onClick={() => setOpen(false)}>
            Mon profil
          </Link>
          <Link href="/reservations" className={itemClass} onClick={() => setOpen(false)}>
            Mes réservations
          </Link>
          {isAdmin && (
            <Link href="/admin" className={itemClass} onClick={() => setOpen(false)}>
              Interface Admin
            </Link>
          )}
          <div className="mx-[10px] my-[4px] h-[1px] bg-[rgba(80,60,200,0.2)]" />
          <Button
            onClick={handleLogout}
            className={`${itemClass} text-[rgba(255,100,120,0.8)] hover:text-[rgba(255,130,140,1)] hover:bg-[rgba(180,30,60,0.15)] h-auto rounded-none`}
          >
            Déconnexion
          </Button>
        </div>
      )}
    </div>
  );
}
