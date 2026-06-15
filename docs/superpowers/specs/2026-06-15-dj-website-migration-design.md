# Design Spec — Migration PHP → Next.js : DJ Julien C

**Date :** 2026-06-15
**Projet source :** `/Desktop/Cours/A1/UE2/Projet_UE2` (PHP + MySQL)
**Projet cible :** `/Desktop/Cours/A1/dj-website` (Next.js 16 + Prisma + Better Auth)

---

## Objectif

Reproduire à l'identique le site de réservation pour DJ Julien C — mêmes fonctionnalités, même style visuel (converti en Tailwind CSS), mêmes images — en remplaçant PHP/MySQL par Next.js App Router, Prisma (PostgreSQL sur prisma.io), et Better Auth.

---

## 1. Architecture & Routing

**Approche :** Server Actions (App Router) pour toutes les mutations. API Route uniquement pour l'endpoint calendrier (dates réservées).

```
app/
├── page.tsx                         # Accueil
├── layout.tsx                       # Layout global (nav + footer)
├── login/page.tsx                   # Login / Signup (toggle)
├── profil/page.tsx                  # Profil utilisateur
├── calendrier/page.tsx              # Calendrier de réservation
├── reservations/page.tsx            # Mes réservations
├── reservations/[id]/edit/page.tsx  # Modifier une réservation
├── avis/page.tsx                    # Avis clients
├── a-venir/page.tsx                 # Soirées à venir
├── a-venir/ajouter/page.tsx         # Ajouter une soirée (admin)
├── photos/page.tsx                  # Galerie photos
├── admin/page.tsx                   # Panel admin
└── api/
    ├── auth/[...all]/route.ts       # Better Auth (existant)
    └── calendar/dates/route.ts      # Dates réservées (GET → JSON)
```

**Protection des pages :** Vérification de session côté serveur dans chaque `page.tsx` protégé via `auth.api.getSession()`. Redirect vers `/login` si non connecté. Redirect vers `/` si non admin sur `/admin` et `/a-venir/ajouter`.

---

## 2. Schéma Prisma

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Role {
  id    Int    @id @default(autoincrement())
  nom   String
  users User[]
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  nom           String?
  prenom        String?
  tel           String?
  roleId        Int      @default(1)
  role          Role     @relation(fields: [roleId], references: [id])
  sessions      Session[]
  accounts      Account[]
  avis          Avis[]
  reservations  Reservation[]
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model Prestation {
  id           Int           @id @default(autoincrement())
  type         String
  demandesResa DemandeResa[]
}

model Etat {
  id           Int           @id @default(autoincrement())
  statut       String
  reservations Reservation[]
}

model DemandeResa {
  id                  Int          @id @default(autoincrement())
  date                DateTime
  infoComplementaires String?
  prestationId        Int
  prestation          Prestation   @relation(fields: [prestationId], references: [id])
  reservation         Reservation?
}

model Reservation {
  userId        String
  demandeResaId Int         @unique
  etatId        Int
  date          DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  demande       DemandeResa @relation(fields: [demandeResaId], references: [id], onDelete: Cascade)
  etat          Etat        @relation(fields: [etatId], references: [id])

  @@id([userId, demandeResaId])
}

model Avis {
  id      Int      @id @default(autoincrement())
  date    DateTime @default(now())
  contenu String
  userId  String
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Soiree {
  id          Int      @id @default(autoincrement())
  titre       String
  date        DateTime
  lieu        String
  ville       String
  description String?
}
```

**Seeds :**
- `Role` : `{ id: 1, nom: "User" }`, `{ id: 2, nom: "Admin" }`
- `Prestation` : `{ id: 1, type: "Anniversaires" }`, `{ id: 2, type: "Mariages" }`, `{ id: 3, type: "Soirées Privées" }`
- `Etat` : `{ id: 1, statut: "Validée" }`, `{ id: 2, statut: "Refusée" }`, `{ id: 3, statut: "En attente" }`

---

## 3. Authentification (Better Auth)

- **Config :** `src/lib/auth.ts` — `emailAndPassword: { enabled: true }`, `prismaAdapter` avec PostgreSQL
- **Signup :** email, mot de passe, nom, prénom, téléphone. `roleId = 1` par défaut. Server Action sur `/login`
- **Login :** email + mot de passe. Redirect vers `/` après succès
- **Session :** cookies httpOnly gérés par Better Auth
- **Check admin :** `user.roleId === 2` — passage manuel en base de données par l'admin
- **Profil :** Server Action pour `nom`, `prenom`, `tel`, `email`. Better Auth `changePassword` pour le mot de passe
- **Déconnexion :** Server Action `signOut`

---

## 4. Pages & Fonctionnalités

### `/` — Accueil
- Hero plein écran avec `public/3.png` en background + gradient sombre
- Titre "Julien C" en police Dear script
- Tagline "DJ • Événementiel"
- Indicateur scroll animé (bounce)
- Section présentation (4 paragraphes + tags services)
- Section CTA avec lien vers `/calendrier`
- Footer avec liens Instagram, mail, WhatsApp

### `/login` — Login / Signup
- Toggle CSS entre les deux formulaires (même technique PHP)
- Signup : nom, prénom, email, téléphone, mot de passe
- Login : email, mot de passe
- Message d'erreur en cas d'échec
- Redirect vers `/` après succès

### `/profil` — Profil (connecté)
- Formulaire : nom, prénom, email, téléphone
- Champ mot de passe optionnel (ne change que si rempli)
- Server Action → redirect après mise à jour

### `/calendrier` — Réservation (connecté)
- Calendrier JS custom généré dynamiquement (à partir de 2025)
- Navigation mois précédent / suivant
- Fetch `/api/calendar/dates` → dates en rouge/désactivées
- Clic sur une date → dialog modal avec :
  - Date (pré-remplie, readonly)
  - Informations complémentaires (textarea)
  - Type de prestation (select : Anniversaires, Mariages, Soirées Privées)
- Server Action → crée `DemandeResa` + `Reservation` avec `etatId = 3` (En attente)
- Notification toast succès

### `/reservations` — Mes réservations (connecté)
- Liste des réservations de l'utilisateur connecté
- Colonnes : date, badge statut, type prestation, infos
- Badges : En attente (jaune), Validée (vert), Refusée (rouge)
- Bouton Modifier → `/reservations/[id]/edit`
- Bouton Supprimer → Server Action (supprime `Reservation` + `DemandeResa`)

### `/reservations/[id]/edit` — Modifier réservation (connecté, propriétaire)
- Formulaire : date, type prestation, infos complémentaires
- Vérification que l'utilisateur est bien le propriétaire
- Server Action → redirect vers `/reservations`

### `/avis` — Avis (public)
- Liste tous les avis (du plus récent au plus ancien) avec nom et date
- Formulaire ajout (si connecté) : textarea
- Bouton supprimer ses propres avis
- Message "Connectez-vous pour laisser un avis" si non connecté

### `/a-venir` — Soirées à venir (public)
- Liste des soirées : titre, date, lieu, ville, description
- Bouton "Ajouter une soirée" (admin uniquement) → `/a-venir/ajouter`
- Bouton "Supprimer" par soirée (admin uniquement) → Server Action

### `/a-venir/ajouter` — Ajouter soirée (admin)
- Formulaire : titre, date/heure, lieu, ville, description
- Server Action → crée `Soiree` → redirect vers `/a-venir`

### `/photos` — Galerie (public)
- Grid de photos depuis `public/photos/`
- Lightbox au clic (modal plein écran, fermeture ESC ou bouton)
- Upload admin : input file (JPEG, PNG, WEBP, GIF, max 5MB) → Server Action → `fs.writeFile` dans `public/photos/`
- Bouton supprimer par photo (admin) → Server Action → `fs.unlink`

### `/admin` — Panel admin (admin uniquement)
- Tableau de toutes les réservations avec : nom client, email + téléphone, date, prestation, infos, statut, actions
- Dropdown changement de statut (En attente / Validée / Refusée) + bouton OK → Server Action
- Bouton Supprimer → Server Action

### `/api/calendar/dates` — API Route (GET)
- Retourne toutes les dates de `DemandeResa` en JSON
- Utilisé par le calendrier côté client

---

## 5. Style

**Thème :** Dark, noir/violet. Pas de toggle dark/light (toujours dark).

**Variables CSS dans `globals.css` :**
```css
:root {
  --primary: #3b2fb5;
  --glow: rgb(0, 21, 255);
  --border-subtle: rgba(255, 255, 255, 0.08);
}
```

**Palettes Tailwind custom :**
- `bg-primary` → `#3b2fb5`
- Badges : `bg-[#FFC03C]` (attente), `bg-[#3CD280]` (validée), `bg-[#FF6478]` (refusée)

**Composants visuels :**
- Navbar : `fixed`, `backdrop-blur`, dropdown hover desktop / toggle touch mobile, burger mobile
- Hero : `bg-cover bg-center`, gradient `from-black/80`, titre Dear script
- Boutons : `bg-primary hover:scale-105 transition`, glow on focus
- Inputs : `bg-transparent border-primary text-white`
- Cards : `border border-white/[0.08] hover:border-primary/50`, animation `fadeUp`
- Modals : `backdrop-blur-sm bg-black/60`

**Polices :**
- `dearscript.otf` → copiée dans `public/fonts/`, chargée via `@font-face` dans `globals.css`
- Optima → `font-family` CSS pour la nav

**Images copiées dans `public/` :**
`3.png`, `logo.png`, `instagram.png`, `mail.png`, `whatsapp.png`, `4.png`

**Responsive :**
- Mobile ≤ 600px : burger menu full-screen, single column, tailles tactiles ≥ 44px
- Tablet ≤ 900px : grids adaptatifs

---

## 6. Structure des Server Actions

```
src/lib/actions/
├── auth.ts          # signup, login, logout, updateProfile
├── reservations.ts  # createReservation, updateReservation, deleteReservation
├── avis.ts          # createAvis, deleteAvis
├── soirees.ts       # createSoiree, deleteSoiree
├── photos.ts        # uploadPhoto, deletePhoto
└── admin.ts         # updateReservationStatus, deleteReservationAdmin
```

---

## 7. Contraintes & Notes

- Le champ `Tel` est stocké en `String` (le PHP utilisait `int` mais les numéros FR commencent par 0)
- Les photos sont stockées dans `public/photos/` (fichier système, pas en base)
- La liste des photos est lue via `fs.readdirSync` dans le Server Component `/photos`
- Better Auth gère le hachage des mots de passe (pas besoin de `password_hash` manuel)
- `prisma.config.ts` existant — vérifier qu'il charge bien le `.env`
- Seed à lancer après `prisma migrate dev`
