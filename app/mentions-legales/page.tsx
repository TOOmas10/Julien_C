import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal-page";
import { HOSTING, LEGAL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site de DJ Julien C : éditeur, hébergeur, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage eyebrow="Informations légales" title="Mentions légales">
      <p>
        Conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
        l&apos;économie numérique (LCEN), voici les informations relatives à l&apos;éditeur et à
        l&apos;hébergeur du site <strong>{SITE.url.replace(/^https?:\/\//, "")}</strong>.
      </p>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Nom : {LEGAL.ownerName}, exerçant sous le nom commercial « Julien C — DJ »</li>
        <li>Statut : {LEGAL.status}</li>
        <li>SIRET : {LEGAL.siret}</li>
        <li>Adresse : {LEGAL.address}</li>
        <li>
          Email : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </li>
        <li>
          Téléphone : <a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a>
        </li>
        <li>
          {LEGAL.vatNumber
            ? `N° de TVA intracommunautaire : ${LEGAL.vatNumber}`
            : "TVA non applicable, article 293 B du Code général des impôts."}
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>{LEGAL.ownerName}</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>{HOSTING.name}</strong>, {HOSTING.address} —{" "}
        <a href={HOSTING.url} target="_blank" rel="noopener noreferrer">
          {HOSTING.url.replace("https://", "")}
        </a>
        .
      </p>
      <p>
        La base de données est hébergée par Prisma Data, Inc. sur des serveurs situés dans
        l&apos;Union européenne.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du site (textes, photographies, logo, éléments graphiques) est la
        propriété de {LEGAL.ownerName} ou fait l&apos;objet d&apos;une autorisation d&apos;utilisation.
        Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite
        préalable est interdite (articles L.335-2 et suivants du Code de la propriété intellectuelle).
      </p>
      <p>
        Les personnes apparaissant sur les photos de la galerie peuvent demander le retrait d&apos;une
        image les représentant en écrivant à <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Avis clients</h2>
      <p>
        Les avis publiés sur le site sont rédigés par des clients disposant d&apos;un compte. Ils ne
        font l&apos;objet d&apos;aucune contrepartie et sont affichés du plus récent au plus ancien.
        L&apos;éditeur se réserve le droit de supprimer tout avis injurieux, diffamatoire ou sans
        rapport avec la prestation.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Le traitement de vos données personnelles est détaillé dans la{" "}
        <Link href="/politique-de-confidentialite">politique de confidentialité</Link>, et
        l&apos;utilisation des cookies dans la <Link href="/cookies">politique cookies</Link>.
      </p>

      {LEGAL.mediator && (
        <>
          <h2>Médiation de la consommation</h2>
          <p>
            Conformément aux articles L.612-1 et suivants du Code de la consommation, en cas de litige
            non résolu à l&apos;amiable, le client consommateur peut recourir gratuitement au
            médiateur de la consommation suivant : {LEGAL.mediator.name} —{" "}
            <a href={LEGAL.mediator.url} target="_blank" rel="noopener noreferrer">
              {LEGAL.mediator.url.replace(/^https?:\/\//, "")}
            </a>
            .
          </p>
        </>
      )}

      <h2>Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas de litige, et après
        tentative de résolution amiable, les tribunaux français sont seuls compétents.
      </p>
    </LegalPage>
  );
}
