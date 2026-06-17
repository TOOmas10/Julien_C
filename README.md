# Julien C — Site DJ Événementiel

Site web professionnel pour DJ Julien C, permettant aux clients de consulter le calendrier des disponibilités, soumettre des demandes de réservation, laisser des avis, et accéder à la galerie photos.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Pages du site](#pages-du-site)
- [Espace admin](#espace-admin)
- [Système de réservation](#système-de-réservation)
- [Emails automatiques](#emails-automatiques)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement Vercel](#déploiement-vercel)
- [Stack technique](#stack-technique)

---

## Fonctionnalités

- Présentation du DJ et de ses prestations
- Calendrier des disponibilités en temps réel
- Demande de réservation en ligne (compte requis)
- Gestion des réservations depuis un espace admin
- Notifications par email automatiques (client + DJ)
- Galerie photos uploadable depuis l'admin
- Page avis clients avec note étoiles
- Page soirées à venir
- SEO complet (sitemap, robots, Open Graph, Twitter Cards)
- Bannière de consentement cookies avec Vercel Analytics conditionnel
- Design responsive (mobile, tablette, desktop)

---

## Pages du site

| URL | Accès | Description |
|---|---|---|
| `/` | Public | Page d'accueil avec présentation et CTA |
| `/calendrier` | Public | Calendrier des disponibilités |
| `/avis` | Public / Connecté | Consulter et laisser un avis |
| `/a-venir` | Public | Soirées à venir |
| `/photos` | Public / Admin | Galerie photos |
| `/reservations` | Connecté | Mes demandes de réservation |
| `/profil` | Connecté | Modifier ses informations |
| `/login` | Public | Connexion / Inscription |
| `/admin` | Admin uniquement | Tableau de bord réservations |

---

## Espace admin

L'espace admin est accessible uniquement aux utilisateurs ayant le rôle **Admin** (`roleId = 2` en base de données).

Pour attribuer le rôle admin à un utilisateur, modifier manuellement le champ `roleId` dans la table `User` en base de données :

```sql
UPDATE "User" SET "roleId" = 2 WHERE email = 'votre@email.com';
```

Depuis l'espace admin vous pouvez :

- Voir toutes les demandes de réservation (nom, email, téléphone, date, type de prestation, infos complémentaires)
- Modifier le statut d'une réservation : **En attente** → **Confirmée** → **Annulée**
- Chaque changement de statut envoie automatiquement un email au client et au DJ
- Uploader et supprimer des photos de la galerie

---

## Système de réservation

### Côté client

1. Le client crée un compte ou se connecte sur `/login`
2. Il accède au calendrier `/calendrier` et sélectionne une date disponible
3. Il choisit le type de prestation (Mariage, Anniversaire, Soirée privée…)
4. Il soumet sa demande avec des informations complémentaires optionnelles
5. Un email de confirmation est envoyé automatiquement au client et au DJ
6. Le client peut suivre l'état de sa réservation sur `/reservations`

### Statuts de réservation

| Statut | Description |
|---|---|
| En attente | Demande reçue, en cours d'examen |
| Confirmée | Prestation confirmée par le DJ |
| Annulée | Demande refusée ou annulée |

Chaque changement de statut déclenche un email de notification au client.

---

## Emails automatiques

Le site utilise **Resend** pour envoyer des emails.

### Emails envoyés automatiquement

| Déclencheur | Destinataire |
|---|---|
| Nouvelle demande de réservation | Client + DJ |
| Client modifie sa réservation | Client uniquement |
| Statut passé à "Confirmée" | Client uniquement |
| Statut passé à "Annulée" | Client uniquement |

### Limitation importante — Nom de domaine requis

> **Pour le moment, tous les emails sont envoyés depuis `onboarding@resend.dev` (domaine de test Resend).**
>
> Cela signifie que les emails envoyés aux clients proviennent d'une adresse Resend générique, et non d'une adresse personnalisée du type `contact@julien-dj.fr`.
>
> **Pour utiliser une adresse email personnalisée (ex : `contact@votre-domaine.fr`), il est nécessaire de :**
> 1. Posséder un nom de domaine
> 2. Ajouter ce domaine dans l'interface Resend (Settings → Domains) et vérifier les enregistrements DNS
> 3. Mettre à jour la variable `RESEND_FROM` avec l'adresse souhaitée (ex : `contact@votre-domaine.fr`)
>
> Sans domaine vérifié, Resend ne peut envoyer des emails qu'à votre propre adresse email enregistrée dans Resend. Les emails aux clients d'autres domaines seront bloqués ou iront en spam.

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet (ne jamais commiter ce fichier) :

```env
# Base de données (Prisma Postgres / Prisma Accelerate)
DATABASE_URL="prisma+postgres://..."
DIRECT_URL="postgresql://..."

# Authentification (Better Auth)
BETTER_AUTH_SECRET="une-clé-secrète-longue-et-aléatoire"
NEXT_PUBLIC_APP_URL="https://votre-domaine.vercel.app"

# Emails (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM="onboarding@resend.dev"   # remplacer par contact@votre-domaine.fr si domaine vérifié
DJ_EMAIL="votre@email.com"            # email où le DJ reçoit les notifications
```

---

## Déploiement Vercel

1. Pusher le code sur GitHub
2. Importer le repo sur [vercel.com](https://vercel.com) → **Add New Project**
3. Dans **Environment Variables**, ajouter toutes les variables ci-dessus
4. `NEXT_PUBLIC_APP_URL` doit être l'URL exacte du projet Vercel, ex : `https://julien-c.vercel.app`
5. `BETTER_AUTH_URL` doit également être défini avec la même URL
6. Cliquer **Deploy**

Vercel redéploie automatiquement à chaque push sur la branche `main`.

---

## Stack technique

| Technologie | Usage |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React (App Router) |
| [TypeScript](https://typescriptlang.org) | Typage statique |
| [Tailwind CSS](https://tailwindcss.com) | Styles utilitaires |
| [Prisma](https://prisma.io) | ORM base de données |
| [PostgreSQL](https://postgresql.org) | Base de données (via Prisma Postgres) |
| [Better Auth](https://better-auth.com) | Authentification (sessions, inscription, connexion) |
| [Resend](https://resend.com) | Envoi d'emails transactionnels |
| [Vercel Analytics](https://vercel.com/analytics) | Analytics (conditionnel au consentement cookies) |
| [Lucide React](https://lucide.dev) | Icônes |
