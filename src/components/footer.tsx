import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-16 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span style={{ fontFamily: "Optima, serif" }} className="text-white/80">
            DJ Julien C
          </span>
        </div>
        <div className="flex gap-6 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition">Accueil</Link>
          <Link href="/avis" className="hover:text-white transition">Avis</Link>
          <Link href="/a-venir" className="hover:text-white transition">À Venir</Link>
          <Link href="/photos" className="hover:text-white transition">Photos</Link>
        </div>
        <div className="flex gap-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
          </a>
          <a href="mailto:julien@example.com">
            <Image src="/mail.png" alt="Email" width={24} height={24} />
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
            <Image src="/whatsapp.png" alt="WhatsApp" width={24} height={24} />
          </a>
        </div>
      </div>
      <p className="text-center text-white/30 text-xs mt-6">© {new Date().getFullYear()} DJ Julien C. Tous droits réservés.</p>
    </footer>
  );
}
