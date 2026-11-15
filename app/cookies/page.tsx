import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal-page";
import CookieSettingsButton from "@/components/cookie-settings-button";
import { COOKIE_CATEGORIES } from "@/lib/cookies-catalog";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: "Liste des cookies utilisés sur le site de DJ Julien C et gestion de vos préférences.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="RGPD" title="Politique cookies">
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lorsque vous visitez un site. Il
        permet par exemple de rester connecté ou de mesurer la fréquentation. Conformément aux
        recommandations de la CNIL, les cookies non indispensables ne sont déposés{" "}
        <strong>qu&apos;après votre accord</strong>, et refuser est aussi simple qu&apos;accepter.
      </p>

      <p>
        <CookieSettingsButton className="cursor-pointer px-[18px] py-[10px] bg-[#3b2fb5] hover:bg-[#4c3dd4] border-none rounded-[8px] text-white text-[12px] font-bold tracking-[0.08em] uppercase transition-colors">
          Modifier mes préférences
        </CookieSettingsButton>
      </p>

      {COOKIE_CATEGORIES.map((cat) => (
        <section key={cat.id}>
          <h2>{cat.title}</h2>
          <p>
            {cat.description}{" "}
            {cat.required ? <em>(toujours actifs)</em> : <em>(soumis à votre accord)</em>}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Fournisseur</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                {cat.cookies.map((c) => (
                  <tr key={c.name}>
                    <td className="font-mono break-all">{c.name}</td>
                    <td>{c.provider}</td>
                    <td>{c.purpose}</td>
                    <td>{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <h2>Durée de votre choix</h2>
      <p>
        Votre choix (acceptation ou refus) est conservé <strong>6 mois</strong>. Passé ce délai, la
        bannière vous est de nouveau présentée. Vous pouvez modifier votre choix à tout moment via le
        lien « Gérer les cookies » en bas de chaque page ; si vous retirez votre accord, les cookies
        de mesure d&apos;audience déjà déposés sont supprimés.
      </p>

      <h2>Paramétrer votre navigateur</h2>
      <p>
        Vous pouvez aussi bloquer ou supprimer les cookies depuis les réglages de votre navigateur
        (Chrome, Firefox, Safari, Edge…). Bloquer les cookies nécessaires empêchera toutefois la
        connexion à votre espace membre.
      </p>

      <p>
        Pour en savoir plus sur vos données, consultez la{" "}
        <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
      </p>
    </LegalPage>
  );
}
