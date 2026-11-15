/**
 * Informations du site et informations légales, centralisées ici.
 *
 * ⚠️ Les champs marqués « À COMPLÉTER » doivent être remplis avant la mise
 * en production : ils apparaissent dans les mentions légales et la politique
 * de confidentialité (obligation légale pour un professionnel).
 */

export const SITE = {
  name: "Julien C — DJ",
  title: "Julien C — DJ Événementiel",
  description:
    "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées. Réservez votre date en ligne.",
  url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  email: "julien.dj2a@gmail.com",
  phoneDisplay: "06 03 55 32 28",
  phoneE164: "+33603553228",
  instagram: "https://www.instagram.com/dj_julien.c/",
  whatsapp: "https://wa.me/33603553228",
  /** Zone d'intervention, utilisée pour le référencement local (données structurées). */
  areaServed: "Corse",
} as const;

export const LEGAL = {
  /** Prénom et nom complets de l'éditeur du site (personne physique). */
  ownerName: "Julien Berthaud",
  /** Ex. « Entrepreneur individuel (micro-entreprise) ». */
  status: "Entrepreneur Individuel",
  siret: "538 252 222 000 20",
  address: "Chemin Du Loretto, Residence Cilof, 20090 Ajaccio",
  /** Mettre null si non assujetti à la TVA (franchise en base, art. 293 B du CGI). */
  vatNumber: null as string | null,
  /**
   * Médiateur de la consommation (obligatoire pour les prestations aux particuliers).
   * Tant que la valeur est null, la section « Médiation » est masquée dans les
   * mentions légales. Une fois l'adhésion faite, remplacer par :
   *   { name: "Nom du médiateur", url: "https://site-du-mediateur.fr" }
   */
  mediator: null as { name: string; url: string } | null,
  lastUpdated: "15 novembre 2026",
} as const;

export const HOSTING = {
  name: "Vercel Inc.",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  url: "https://vercel.com",
} as const;

/** Durée de conservation du choix cookies (recommandation CNIL : 6 mois). */
export const CONSENT_MAX_AGE_DAYS = 180;
