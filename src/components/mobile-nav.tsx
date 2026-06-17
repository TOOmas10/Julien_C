"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  hasReserveButton?: boolean;
}

export default function MobileNav({ links, hasReserveButton = false }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex md:hidden flex-col justify-center items-center w-[40px] h-[40px] gap-[5px] cursor-pointer bg-transparent border-none p-0"
      >
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${
            open ? "w-[22px] translate-y-[7px] rotate-45" : "w-[22px]"
          }`}
        />
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${
            open ? "w-[22px] opacity-0" : "w-[16px]"
          }`}
        />
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${
            open ? "w-[22px] -translate-y-[7px] -rotate-45" : "w-[22px]"
          }`}
        />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-[4px] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[95] w-[280px] bg-[rgba(8,6,30,0.98)] border-l border-[rgba(80,60,200,0.3)] flex flex-col transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-[16px]">
          <button
            onClick={close}
            className="text-[rgba(180,170,220,0.7)] hover:text-white text-[24px] leading-none bg-transparent border-none cursor-pointer p-[8px]"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-[24px] gap-[4px] flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="py-[14px] text-[14px] font-bold uppercase tracking-[0.12em] text-[rgba(200,190,255,0.85)] no-underline border-b border-[rgba(80,60,200,0.15)] transition-colors duration-150 hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {hasReserveButton && (
            <Link
              href="/calendrier"
              onClick={close}
              className="mt-[16px] py-[14px] px-[20px] bg-[#3b2fb5] hover:bg-[#4c3dd4] rounded-[8px] text-white text-[13px] font-bold uppercase tracking-[0.12em] no-underline text-center transition-colors duration-150"
            >
              Réserver
            </Link>
          )}
        </nav>

        {/* Socials */}
        <div className="px-[24px] py-[28px] flex gap-[16px] border-t border-[rgba(80,60,200,0.15)]">
          <Link href="https://www.instagram.com/dj_julien.c/" target="_blank" rel="noopener noreferrer" onClick={close}>
            <Image src="/instagram.png" alt="Instagram" width={34} height={34} className="opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="mailto:julien.dj2a@gmail.com" target="_blank" rel="noopener noreferrer" onClick={close}>
            <Image src="/mail.png" alt="Mail" width={34} height={34} className="opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="https://wa.me/0603553228" target="_blank" rel="noopener noreferrer" onClick={close}>
            <Image src="/whatsapp.png" alt="WhatsApp" width={34} height={34} className="opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>
    </>
  );
}
