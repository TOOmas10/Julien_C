import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import UserMenu from "./user-menu";
import MobileNav from "./mobile-nav";

const navLinkClass =
  "no-underline cursor-pointer text-white font-bold relative inline-block py-[6px] transition-colors duration-[250ms] ease hover:text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[var(--primary-color)] after:transition-[width] after:duration-300 hover:after:w-full";

const homeLinks = [
  { href: "/#presentation", label: "Présentation" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/avis", label: "Avis" },
  { href: "/a-venir", label: "À Venir" },
  { href: "/photos", label: "Photos" },
];

export default async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <nav className="fixed top-0 left-0 z-[100] w-screen flex font-[Optima] justify-between items-center px-[16px] md:px-[50px] py-[6px] animate-[fadeDown_0.7s_ease_both]">
      {/* Left: user / login */}
      {user ? (
        <UserMenu
          prenom={user.prenom ?? user.name.split(" ")[0]}
          isAdmin={user.roleId === 2}
        />
      ) : (
        <Link
          href="/login"
          className="px-[14px] md:px-[22px] py-[8px] md:py-[10px] border border-purple-700/50 rounded-lg text-purple-200/90 text-[0.8rem] md:text-[0.85rem] font-bold tracking-[0.08em] uppercase no-underline transition-all duration-200 whitespace-nowrap hover:bg-[rgba(60,40,180,0.25)] hover:border-purple-500/70 hover:text-white"
        >
          <span className="hidden sm:inline">Connexion / Inscription</span>
          <span className="sm:hidden">Connexion</span>
        </Link>
      )}

      {/* Center: nav links (desktop only) */}
      <div className="hidden md:flex gap-9 items-center text-[0.95rem] uppercase tracking-[1px]">
        <Link href="/#presentation" className={navLinkClass}>Présentation</Link>
        <Link href="/calendrier" className={navLinkClass}>Calendrier</Link>
        <Link href="/avis" className={navLinkClass}>Avis</Link>
        <Link href="/a-venir" className={navLinkClass}>A Venir</Link>
        <Link href="/photos" className={navLinkClass}>Photos</Link>
        <Link
          href="/#contact"
          className="no-underline cursor-pointer bg-[var(--primary-color)] px-6 py-2 text-white font-bold rounded-lg uppercase tracking-[1px] transition-[transform,box-shadow] duration-[250ms] ease hover:-translate-y-[2px] hover:shadow-[0_0_25px_var(--primary-glow)]"
        >
          Réserver
        </Link>
      </div>

      {/* Right: socials (desktop) + hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex gap-4 items-center">
          <Link href="https://www.instagram.com/dj_julien.c/" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
            <Image src="/instagram.png" alt="Instagram" width={40} height={40} />
          </Link>
          <Link href="mailto:julien.dj2a@gmail.com" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
            <Image src="/mail.png" alt="Mail" width={40} height={40} />
          </Link>
          <Link href="https://wa.me/0603553228" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
            <Image src="/whatsapp.png" alt="WhatsApp" width={40} height={40} />
          </Link>
        </div>
        <MobileNav links={homeLinks} hasReserveButton />
      </div>
    </nav>
  );
}
