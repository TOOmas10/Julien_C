import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal-page";
import CookieSettingsButton from "@/components/cookie-settings-button";
import { LEGAL, SITE } from "@/lib/site";
import { GA_ID } from "@/lib/cookies-catalog";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment DJ Julien C collecte, utilise et protège vos données personnelles, et comment exercer vos droits (RGPD).",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage eyebrow="RGPD" title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données personnelles sont collectées sur ce site, pourquoi,
        combien de temps elles sont conservées et comment exercer vos droits, conformément au
        Règlement général sur la protection des données (RGPD) et à la loi « Informatique et
        Libertés ».
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        {LEGAL.ownerName} (« Julien C — DJ »), {LEGAL.address}.
        <br />
        Contact pour toute question sur vos données :{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>2. Données collectées</h2>
      <h3>Lorsque vous créez un compte</h3>
      <ul>
        <li>Nom, prénom, adresse email, numéro de téléphone (facultatif) ;</li>
        <li>Mot de passe, stocké uniquement sous forme chiffrée (hachage) : personne ne peut le lire.</li>
      </ul>
      <h3>Lorsque vous faites une demande de réservation</h3>
      <ul>
        <li>Date souhaitée, type de prestation et informations complémentaires que vous saisissez.</li>
      </ul>
      <h3>Lorsque vous publiez un avis</h3>
      <ul>
        <li>
          Note, texte de l&apos;avis et date. Votre <strong>prénom et l&apos;initiale de votre nom</strong>{" "}
          sont affichés publiquement avec l&apos;avis.
        </li>
      </ul>
      <h3>Automatiquement</h3>
      <ul>
        <li>
          Lors de la connexion : adresse IP et type de navigateur, enregistrés avec votre session pour
          sécuriser votre compte ;
        </li>
        <li>
          Avec votre accord uniquement : statistiques de fréquentation (voir la{" "}
          <Link href="/cookies">politique cookies</Link>).
        </li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pourquoi</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Créer et gérer votre compte</td>
              <td>Exécution de mesures précontractuelles / du contrat (art. 6.1.b RGPD)</td>
            </tr>
            <tr>
              <td>Traiter vos demandes de réservation et vous envoyer les emails de suivi (confirmation, changement de statut)</td>
              <td>Exécution de mesures précontractuelles / du contrat (art. 6.1.b)</td>
            </tr>
            <tr>
              <td>Publier vos avis</td>
              <td>Votre consentement, retirable en supprimant l&apos;avis (art. 6.1.a)</td>
            </tr>
            <tr>
              <td>Sécuriser le site et les comptes (sessions, prévention des abus)</td>
              <td>Intérêt légitime (art. 6.1.f)</td>
            </tr>
            <tr>
              <td>Mesurer l&apos;audience du site</td>
              <td>Votre consentement via la bannière cookies (art. 6.1.a et art. 82 loi Informatique et Libertés)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Vos données ne sont jamais vendues ni utilisées à des fins publicitaires.</p>

      <h2>4. Destinataires</h2>
      <p>
        Vos données sont destinées uniquement à {LEGAL.ownerName}. Elles sont hébergées et traitées
        par les prestataires techniques suivants, qui agissent sur instruction et sont tenus à la
        confidentialité :
      </p>
      <ul>
        <li><strong>Vercel Inc.</strong> (États-Unis) : hébergement du site, stockage des photos, mesure d&apos;audience anonyme ;</li>
        <li><strong>Prisma Data, Inc.</strong> (États-Unis) : base de données, hébergée sur des serveurs situés dans l&apos;Union européenne ;</li>
        <li><strong>Resend</strong> (Plus Five Five, Inc., États-Unis) : envoi des emails liés à votre compte et à vos réservations ;</li>
        {GA_ID && (
          <li><strong>Google Ireland Ltd.</strong> : mesure d&apos;audience Google Analytics, uniquement si vous l&apos;acceptez.</li>
        )}
      </ul>

      <h2>5. Transferts hors de l&apos;Union européenne</h2>
      <p>
        Certains prestataires sont établis aux États-Unis. Ces transferts sont encadrés par le cadre
        de protection des données UE–États-Unis (Data Privacy Framework) et/ou par les clauses
        contractuelles types adoptées par la Commission européenne.
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li><strong>Compte</strong> : jusqu&apos;à sa suppression par vous, ou au plus tard 3 ans après votre dernière activité ;</li>
        <li><strong>Demandes de réservation</strong> : durée de la relation, puis 3 ans ; les éléments nécessaires à la preuve d&apos;une prestation réalisée peuvent être archivés 5 ans (prescription civile) ;</li>
        <li><strong>Avis</strong> : jusqu&apos;à leur suppression par vous ou la suppression de votre compte ;</li>
        <li><strong>Sessions de connexion</strong> (adresse IP, navigateur) : 7 jours ;</li>
        <li><strong>Choix cookies</strong> : 6 mois ; cookies de mesure d&apos;audience : 13 mois maximum.</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>Vous disposez à tout moment des droits suivants sur vos données :</p>
      <ul>
        <li>droit d&apos;<strong>accès</strong> et de <strong>portabilité</strong> : bouton « Télécharger mes données » dans <Link href="/profil">Mon profil</Link> ;</li>
        <li>droit de <strong>rectification</strong> : modifiable directement dans <Link href="/profil">Mon profil</Link> ;</li>
        <li>droit à l&apos;<strong>effacement</strong> : bouton « Supprimer mon compte » dans <Link href="/profil">Mon profil</Link> (compte, réservations et avis sont supprimés) ;</li>
        <li>droits d&apos;<strong>opposition</strong> et de <strong>limitation</strong> du traitement ;</li>
        <li>droit de <strong>retirer votre consentement</strong> à tout moment (avis, cookies : <CookieSettingsButton className="underline cursor-pointer bg-transparent border-none p-0 text-[rgba(160,140,255,0.95)] hover:text-white">gérer les cookies</CookieSettingsButton>) ;</li>
        <li>droit de définir des directives sur le sort de vos données après votre décès.</li>
      </ul>
      <p>
        Pour toute demande, écrivez à <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Une réponse
        vous sera apportée dans un délai d&apos;un mois. Une pièce d&apos;identité pourra vous être
        demandée en cas de doute sur votre identité.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
        auprès de la <strong>CNIL</strong> (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 —{" "}
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
          cnil.fr/fr/plaintes
        </a>
        ).
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Le site est servi exclusivement en HTTPS, les mots de passe sont hachés et l&apos;accès aux
        données est limité à l&apos;administrateur du site. Les prestataires techniques appliquent
        leurs propres mesures de sécurité (chiffrement, contrôle d&apos;accès).
      </p>

      <h2>9. Mineurs</h2>
      <p>
        La création d&apos;un compte est réservée aux personnes âgées d&apos;au moins 15 ans. En
        dessous, l&apos;accord d&apos;un titulaire de l&apos;autorité parentale est nécessaire.
      </p>

      <h2>10. Modification de cette politique</h2>
      <p>
        Cette politique peut évoluer, notamment en cas d&apos;ajout d&apos;un nouveau service. La date
        de dernière mise à jour figure en haut de la page.
      </p>
    </LegalPage>
  );
}
