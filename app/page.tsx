import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('/3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="relative z-10">
          <h1 style={{ fontFamily: "Dear, cursive", fontSize: "clamp(4rem, 12vw, 10rem)", lineHeight: 1.1 }} className="text-white">
            Julien C
          </h1>
          <p className="text-white/80 text-xl md:text-2xl mt-4 tracking-widest uppercase">
            DJ • Événementiel
          </p>
          <Link href="/calendrier" className="btn-primary inline-block mt-8 text-lg px-8 py-4">
            Réserver
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <span className="text-white/40 text-2xl">↓</span>
        </div>
      </section>

      {/* Présentation */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold">À propos</h2>
            <p className="text-white/70 leading-relaxed">
              Passionné de musique depuis plus de 10 ans, DJ Julien C met son talent et son expérience au service de vos événements pour créer une ambiance inoubliable.
            </p>
            <p className="text-white/70 leading-relaxed">
              Que ce soit pour un mariage, un anniversaire ou une soirée privée, chaque prestation est unique et personnalisée selon vos goûts et vos envies.
            </p>
            <p className="text-white/70 leading-relaxed">
              Équipé d'un matériel professionnel de haute qualité, il saura animer votre soirée avec brio et faire danser vos convives jusqu'au bout de la nuit.
            </p>
            <p className="text-white/70 leading-relaxed">
              N'hésitez pas à le contacter pour plus d'informations ou pour réserver votre date.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold mb-2">Services</h3>
            {["Mariages", "Soirées privées", "Anniversaires", "Bals"].map((s) => (
              <span key={s} className="inline-block border border-[#3b2fb5] text-white/80 px-4 py-2 rounded-full text-sm hover:bg-[#3b2fb5]/20 transition">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: "radial-gradient(ellipse at center, #1a0e5e 0%, #000 70%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à faire danser vos invités ?</h2>
          <p className="text-white/60 mb-8">Réservez votre date dès maintenant via le calendrier.</p>
          <Link href="/calendrier" className="btn-primary text-lg px-10 py-4 inline-block">
            Voir le calendrier
          </Link>
        </div>
      </section>
    </>
  );
}
