import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import UserMenu from "./user-menu";
import MobileNav from "./mobile-nav";

const navLinkClass =
  "no-underline cursor-pointer text-white font-bold relative inline-block py-[6px] transition-colors duration-[250ms] ease hover:text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[var(--primary-color)] after:transition-[width] after:duration-300 hover:after:w-full";

const innerLinks = [
  { href: "/", label: "Accueil" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/avis", label: "Avis" },
  { href: "/a-venir", label: "À Venir" },
  { href: "/photos", label: "Photos" },
];

export default async function HeaderAvis() {
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
      <div className="hidden md:flex gap-10 items-center text-[0.95rem] uppercase tracking-[1px]">
        <Link href="/" className={navLinkClass}>
          Accueil
        </Link>
        <Link href="/calendrier" className={navLinkClass}>
          Calendrier
        </Link>
        <Link href="/avis" className={navLinkClass}>
          Avis
        </Link>
        <Link href="/a-venir" className={navLinkClass}>
          A Venir
        </Link>
        <Link href="/photos" className={navLinkClass}>
          Photos
        </Link>
      </div>

      {/* Right: socials (desktop) + hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex gap-4 items-center">
          <Link
            href="https://www.instagram.com/dj_julien.c/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-500 ease-out hover:scale-[1.2]"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Instagram"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>
          <Link
            href="mailto:julien.dj2a@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-500 ease-out hover:scale-[1.2]"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Mail"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </Link>
          <Link
            href="https://wa.me/0603553228"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-500 ease-out hover:scale-[1.2]"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="WhatsApp"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </Link>
        </div>
        <MobileNav links={innerLinks} hasReserveButton />
      </div>
    </nav>
  );
}
