/**
 * Liste des cookies / traceurs utilisés par le site.
 * Affichée dans le panneau de préférences et sur la page /cookies :
 * à tenir à jour si un service est ajouté ou retiré.
 */

export type CookieInfo = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
};

export type CookieCategory = {
  id: "necessary" | "analytics";
  title: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
};

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necessary",
    title: "Cookies nécessaires",
    description:
      "Indispensables au fonctionnement du site (connexion à votre compte, mémorisation de vos choix). Ils sont exemptés de consentement et ne servent à aucun suivi publicitaire.",
    required: true,
    cookies: [
      {
        name: "better-auth.session_token",
        provider: "Ce site",
        purpose: "Maintient votre connexion à votre espace membre.",
        duration: "7 jours",
      },
      {
        name: "better-auth.session_data",
        provider: "Ce site",
        purpose: "Copie signée de votre session pour accélérer l'affichage des pages.",
        duration: "5 minutes",
      },
      {
        name: "jc_consent",
        provider: "Ce site",
        purpose: "Mémorise vos choix concernant les cookies.",
        duration: "6 mois",
      },
    ],
  },
  {
    id: "analytics",
    title: "Mesure d'audience",
    description:
      "Nous aident à savoir combien de personnes visitent le site, quelles pages les intéressent et comment elles nous ont trouvés (recherche Google, Instagram…). Désactivés tant que vous ne les acceptez pas.",
    required: false,
    cookies: [
      {
        name: "Vercel Web Analytics",
        provider: "Vercel Inc. (États-Unis)",
        purpose:
          "Statistiques de fréquentation anonymes (pages vues, pays, type d'appareil, site d'origine). Ne dépose aucun cookie.",
        duration: "Aucun cookie — données agrégées",
      },
      ...(GA_ID
        ? [
            {
              name: "_ga",
              provider: "Google Analytics (Google Ireland Ltd.)",
              purpose: "Distingue les visiteurs pour produire des statistiques de fréquentation.",
              duration: "13 mois",
            },
            {
              name: `_ga_${GA_ID.replace(/^G-/, "")}`,
              provider: "Google Analytics (Google Ireland Ltd.)",
              purpose: "Conserve l'état de la visite en cours (pages consultées, durée).",
              duration: "13 mois",
            },
          ]
        : []),
    ],
  },
];
