import Link from "next/link";
import CookieSettingsButton from "./cookie-settings-button";

const linkClass =
  "text-[var(--text-muted)] no-underline hover:text-white transition-colors duration-150";

export default function Footer() {
  return (
    <footer className="py-[30px] md:py-[40px] px-[6vw] md:px-[10vw] border-t border-white/[0.08] text-center text-[var(--text-muted)] text-[0.8rem] md:text-[0.85rem] tracking-[1px]">
      <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-[8px] mb-[18px] text-[0.7rem] md:text-[0.75rem]">
        <Link href="/mentions-legales" className={linkClass}>
          Mentions légales
        </Link>
        <Link href="/politique-de-confidentialite" className={linkClass}>
          Confidentialité
        </Link>
        <Link href="/cookies" className={linkClass}>
          Cookies
        </Link>
        <CookieSettingsButton
          className={`${linkClass} bg-transparent border-none p-0 cursor-pointer tracking-[1px] font-[inherit] text-[inherit]`}
        />
      </div>
      © {new Date().getFullYear()} Julien C — DJ{" "}
      <span className="text-[var(--primary-color)] text-[1.2rem]">•</span>{" "}
      Événementiel
    </footer>
  );
}
