/** Injecte des données structurées schema.org (JSON-LD) pour le référencement. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Échappe "<" pour empêcher toute injection de balise via les données.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
