# DJ Julien C — Migration PHP → Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduire à l'identique le site PHP DJ Julien C en Next.js 16 avec Prisma (PostgreSQL sur prisma.io), Better Auth, et Tailwind CSS.

**Architecture:** Server Actions pour toutes les mutations, React Server Components pour la lecture des données, API Route GET uniquement pour les dates du calendrier. Pas de client-side data fetching sauf le calendrier.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, Prisma 7 (prisma-client generator), Better Auth 1.6.18, Tailwind CSS v4, shadcn/ui (base-nova), react-hook-form, sonner (toasts)

> ⚠️ **IMPORTANT — Lis d'abord :** Ce projet utilise Next.js 16 qui peut avoir des breaking changes. Avant d'écrire du code, consulte `node_modules/next/dist/docs/01-app/` pour les conventions actuelles, notamment `03-api-reference/` pour les Server Actions, `headers()`, `cookies()`, et la protection des routes.

---

## Fichiers à créer / modifier

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `prisma/schema.prisma` | Modifier | Tous les modèles Prisma |
| `prisma/seed.ts` | Créer | Seeds Role, Prestation, Etat |
| `package.json` | Modifier | Script `prisma.seed` |
| `src/lib/prisma.ts` | Modifier | Import depuis le bon chemin généré |
| `src/lib/auth.ts` | Modifier | Better Auth + additionalFields |
| `src/lib/auth-client.ts` | Modifier | inferAdditionalFields |
| `app/globals.css` | Modifier | Thème noir/violet DJ |
| `app/layout.tsx` | Modifier | Supprimer ThemeProvider, toujours dark |
| `src/components/navbar.tsx` | Créer | Nav fixe avec menu user + burger mobile |
| `src/components/footer.tsx` | Modifier | Footer DJ |
| `app/page.tsx` | Modifier | Page d'accueil |
| `app/login/page.tsx` | Créer | Login / Signup toggle |
| `app/profil/page.tsx` | Créer | Profil utilisateur |
| `app/calendrier/page.tsx` | Créer | Calendrier de réservation |
| `app/reservations/page.tsx` | Créer | Mes réservations |
| `app/reservations/[id]/edit/page.tsx` | Créer | Modifier réservation |
| `app/avis/page.tsx` | Créer | Avis clients |
| `app/a-venir/page.tsx` | Créer | Soirées à venir |
| `app/a-venir/ajouter/page.tsx` | Créer | Ajouter soirée (admin) |
| `app/photos/page.tsx` | Créer | Galerie photos |
| `app/admin/page.tsx` | Créer | Panel admin |
| `app/api/calendar/dates/route.ts` | Créer | Dates réservées (GET JSON) |
| `src/lib/actions/auth.ts` | Créer | signup, updateProfile, changePassword |
| `src/lib/actions/reservations.ts` | Créer | createReservation, updateReservation, deleteReservation |
| `src/lib/actions/avis.ts` | Créer | createAvis, deleteAvis |
| `src/lib/actions/soirees.ts` | Créer | createSoiree, deleteSoiree |
| `src/lib/actions/photos.ts` | Créer | uploadPhoto, deletePhoto |
| `src/lib/actions/admin.ts` | Créer | updateReservationStatus, deleteReservationAdmin |

---

## Phase 1 — Foundation (DB + Auth + Layout)

### Task 1 : Prisma Schema + Migration + Seed

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma.ts`
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Étape 1 : Écrire le schéma complet**

Remplace le contenu de `prisma/schema.prisma` par :

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
  id          Int           @id @default(autoincrement())
  type        String
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

- [ ] **Étape 2 : Mettre à jour `src/lib/prisma.ts`**

Le générateur `prisma-client` génère dans `src/generated/prisma`. Mettre à jour l'import :

```typescript
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Étape 3 : Lancer la migration**

```bash
npx prisma migrate dev --name init
```

Résultat attendu : `Your database is now in sync with your schema.` et dossier `prisma/migrations/` créé.

- [ ] **Étape 4 : Créer le seed `prisma/seed.ts`**

```typescript
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { id: 1, nom: "User" },
      { id: 2, nom: "Admin" },
    ],
    skipDuplicates: true,
  });

  await prisma.prestation.createMany({
    data: [
      { id: 1, type: "Anniversaires" },
      { id: 2, type: "Mariages" },
      { id: 3, type: "Soirées Privées" },
    ],
    skipDuplicates: true,
  });

  await prisma.etat.createMany({
    data: [
      { id: 1, statut: "Validée" },
      { id: 2, statut: "Refusée" },
      { id: 3, statut: "En attente" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Étape 5 : Ajouter le script seed dans `package.json`**

Ajouter dans `package.json` au niveau racine (pas dans scripts) :

```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Si `ts-node` n'est pas installé : `npm install -D ts-node`

- [ ] **Étape 6 : Lancer le seed**

```bash
npx prisma db seed
```

Résultat attendu : `Seed done.`

- [ ] **Étape 7 : Vérifier dans Prisma Studio**

```bash
npx prisma studio
```

Ouvre `http://localhost:5555`. Vérifie que les tables `Role`, `Prestation`, `Etat`, `User`, `Session`, `Account`, `Verification`, `DemandeResa`, `Reservation`, `Avis`, `Soiree` existent et que les seeds sont présents.

- [ ] **Étape 8 : Commit**

```bash
git add prisma/ src/lib/prisma.ts package.json
git commit -m "feat: prisma schema, migration, and seed"
```

---

### Task 2 : Better Auth — additionalFields

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/lib/auth-client.ts`

- [ ] **Étape 1 : Mettre à jour `src/lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      nom: {
        type: "string",
        required: false,
        input: true,
      },
      prenom: {
        type: "string",
        required: false,
        input: true,
      },
      tel: {
        type: "string",
        required: false,
        input: true,
      },
      roleId: {
        type: "number",
        required: false,
        input: false,
        defaultValue: 1,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

- [ ] **Étape 2 : Mettre à jour `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
```

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts
git commit -m "feat: better-auth additional fields (nom, prenom, tel, roleId)"
```

---

### Task 3 : Assets + Styles globaux

**Files:**
- Copy assets to `public/`
- Modify: `app/globals.css`

- [ ] **Étape 1 : Copier les images et la police**

```bash
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/3.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/4.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/logo.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/instagram.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/mail.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/whatsapp.png public/
cp /Users/thomasberthaud/Desktop/Cours/A1/UE2/Projet_UE2/images/dearscript.otf public/fonts/dearscript.otf
mkdir -p public/photos
```

- [ ] **Étape 2 : Réécrire `app/globals.css`**

```css
@import "tailwindcss";

@font-face {
  font-family: "Dear";
  src: url("/fonts/dearscript.otf") format("opentype");
  font-weight: normal;
  font-style: normal;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --font-sans: var(--font-poppins);
  --font-dear: "Dear", cursive;
}

:root {
  --background: #000000;
  --foreground: #ffffff;
  --primary: #3b2fb5;
  --primary-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.08);
  --card: rgba(255, 255, 255, 0.04);
  --muted: rgba(255, 255, 255, 0.6);
  --muted-foreground: rgba(255, 255, 255, 0.6);
  --glow: rgb(0, 21, 255);
  --radius: 0.625rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #000;
  color: #fff;
  font-family: var(--font-sans), sans-serif;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-fade-up {
  animation: fadeUp 0.5s ease forwards;
}

.animate-bounce-slow {
  animation: bounce 1.5s ease-in-out infinite;
}

.btn-primary {
  background-color: var(--primary);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(59, 47, 181, 0.6);
}

.input-dj {
  background: transparent;
  border: 1px solid var(--primary);
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  width: 100%;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-dj:focus {
  border-color: var(--glow);
  box-shadow: 0 0 8px rgba(0, 21, 255, 0.3);
}

.input-dj::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.badge-attente {
  background-color: #FFC03C;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-validee {
  background-color: #3CD280;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-refusee {
  background-color: #FF6478;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-dj {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--card);
  transition: border-color 0.2s;
}

.card-dj:hover {
  border-color: rgba(59, 47, 181, 0.5);
}
```

- [ ] **Étape 3 : Commit**

```bash
git add public/ app/globals.css
git commit -m "feat: assets and global dark purple theme"
```

---

### Task 4 : Navbar + Footer + Layout

**Files:**
- Create: `src/components/navbar.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Étape 1 : Créer `src/components/navbar.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import NavClient from "./nav-client";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;
  const isAdmin = user && (user as any).roleId === 2;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={36} height={36} />
          <span style={{ fontFamily: "Optima, serif", color: "#fff", fontSize: "1.1rem" }}>
            Julien C
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-white transition">Accueil</Link>
          <Link href="/calendrier" className="hover:text-white transition">Calendrier</Link>
          <Link href="/avis" className="hover:text-white transition">Avis</Link>
          <Link href="/a-venir" className="hover:text-white transition">À Venir</Link>
          <Link href="/photos" className="hover:text-white transition">Photos</Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-white transition text-[#3b2fb5]">Admin</Link>
          )}
        </div>

        <NavClient user={user} />
      </div>
    </nav>
  );
}
```

- [ ] **Étape 2 : Créer `src/components/nav-client.tsx`**

Ce composant gère le menu user (dropdown) et le burger mobile côté client.

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  roleId?: number;
} | null;

export default function NavClient({ user }: { user: User }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-white/80 hover:text-white text-sm transition"
          >
            Bienvenue, {user.name.split(" ")[0]} ▾
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-black/90 border border-white/10 rounded-lg w-44 py-2 z-50 backdrop-blur-md">
              <Link href="/profil" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>Mon profil</Link>
              <Link href="/reservations" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition">Déconnexion</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="btn-primary text-sm px-4 py-2 rounded-lg">
          Connexion
        </Link>
      )}

      {/* Burger mobile */}
      <button
        className="md:hidden text-white ml-2"
        onClick={() => setBurgerOpen((o) => !o)}
        aria-label="Menu"
      >
        <span className="text-2xl">{burgerOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile menu overlay */}
      {burgerOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setBurgerOpen(false)}>✕</button>
          {[
            { href: "/", label: "Accueil" },
            { href: "/calendrier", label: "Calendrier" },
            { href: "/avis", label: "Avis" },
            { href: "/a-venir", label: "À Venir" },
            { href: "/photos", label: "Photos" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-white text-2xl hover:text-[#3b2fb5] transition" onClick={() => setBurgerOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profil" className="text-white text-xl" onClick={() => setBurgerOpen(false)}>Mon profil</Link>
              <Link href="/reservations" className="text-white text-xl" onClick={() => setBurgerOpen(false)}>Mes réservations</Link>
              <button onClick={() => { handleLogout(); setBurgerOpen(false); }} className="text-white/60 text-lg">Déconnexion</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-lg px-6 py-3" onClick={() => setBurgerOpen(false)}>Connexion</Link>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 3 : Réécrire `src/components/footer.tsx`**

```tsx
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
```

- [ ] **Étape 4 : Mettre à jour `app/layout.tsx`**

```tsx
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head />
      <body className={cn(poppins.variable, "font-sans antialiased bg-black text-white min-h-screen")}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Étape 5 : Lancer le dev server pour vérifier la navbar**

```bash
npm run dev
```

Ouvre `http://localhost:3000`. La navbar doit apparaître fixe en haut, fond noir avec blur. Aucune erreur dans la console.

- [ ] **Étape 6 : Commit**

```bash
git add src/components/ app/layout.tsx
git commit -m "feat: navbar, footer, and root layout"
```

---

## Phase 2 — Pages Auth

### Task 5 : Login / Signup

**Files:**
- Create: `app/login/page.tsx`
- Create: `src/lib/actions/auth.ts`

- [ ] **Étape 1 : Créer `src/lib/actions/auth.ts`**

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const tel = formData.get("tel") as string;
  const name = `${prenom} ${nom}`.trim();

  const result = await auth.api.signUpEmail({
    body: { email, password, name, nom, prenom, tel },
    headers: await headers(),
    asResponse: true,
  });

  if (!result.ok) {
    return { error: "Erreur lors de l'inscription. Cet email est peut-être déjà utilisé." };
  }

  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/login");

  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const tel = formData.get("tel") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nom, prenom, tel, email, name: `${prenom} ${nom}`.trim() },
  });

  if (password) {
    await auth.api.changePassword({
      body: { newPassword: password, currentPassword: formData.get("currentPassword") as string, revokeOtherSessions: false },
      headers: h,
    });
  }

  redirect("/profil");
}
```

- [ ] **Étape 2 : Créer `app/login/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { signup } from "@/lib/actions/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <LoginForm signupAction={signup} />
    </div>
  );
}
```

- [ ] **Étape 3 : Créer `app/login/login-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginForm({ signupAction }: { signupAction: (fd: FormData) => Promise<{ error: string } | void> }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await authClient.signIn.email({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    if (result.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signupAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex mb-8 border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-3 text-sm font-medium transition ${mode === "login" ? "bg-[#3b2fb5] text-white" : "text-white/60 hover:text-white"}`}
        >
          Connexion
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-3 text-sm font-medium transition ${mode === "signup" ? "bg-[#3b2fb5] text-white" : "text-white/60 hover:text-white"}`}
        >
          Inscription
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Connexion</h2>
          <input name="email" type="email" placeholder="Email" required className="input-dj" />
          <input name="password" type="password" placeholder="Mot de passe" required className="input-dj" />
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Inscription</h2>
          <input name="prenom" type="text" placeholder="Prénom" required className="input-dj" />
          <input name="nom" type="text" placeholder="Nom" required className="input-dj" />
          <input name="email" type="email" placeholder="Email" required className="input-dj" />
          <input name="tel" type="tel" placeholder="Téléphone" className="input-dj" />
          <input name="password" type="password" placeholder="Mot de passe" required minLength={8} className="input-dj" />
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Étape 4 : Tester le flux**

Ouvre `http://localhost:3000/login`. Teste inscription puis login. Vérifie que la navbar montre "Bienvenue, [Prénom]" après connexion.

- [ ] **Étape 5 : Commit**

```bash
git add app/login/ src/lib/actions/auth.ts
git commit -m "feat: login/signup page with better-auth"
```

---

### Task 6 : Page Profil

**Files:**
- Create: `app/profil/page.tsx`

- [ ] **Étape 1 : Créer `app/profil/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>
      <form action={updateProfile} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input name="prenom" defaultValue={user.prenom ?? ""} placeholder="Prénom" className="input-dj flex-1" />
          <input name="nom" defaultValue={user.nom ?? ""} placeholder="Nom" className="input-dj flex-1" />
        </div>
        <input name="email" type="email" defaultValue={user.email} placeholder="Email" className="input-dj" />
        <input name="tel" type="tel" defaultValue={user.tel ?? ""} placeholder="Téléphone" className="input-dj" />
        <hr className="border-white/10 my-2" />
        <p className="text-white/60 text-sm">Laisser vide pour ne pas changer le mot de passe</p>
        <input name="currentPassword" type="password" placeholder="Mot de passe actuel" className="input-dj" />
        <input name="password" type="password" placeholder="Nouveau mot de passe" className="input-dj" />
        <button type="submit" className="btn-primary mt-2">Enregistrer</button>
      </form>
    </div>
  );
}
```

- [ ] **Étape 2 : Tester**

Connecté, va sur `http://localhost:3000/profil`. Modifie un champ. Vérifie la mise à jour.

- [ ] **Étape 3 : Commit**

```bash
git add app/profil/
git commit -m "feat: profile page"
```

---

## Phase 3 — Pages principales

### Task 7 : Page d'accueil

**Files:**
- Modify: `app/page.tsx`

- [ ] **Étape 1 : Écrire `app/page.tsx`**

```tsx
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
```

- [ ] **Étape 2 : Tester visuellement**

`http://localhost:3000` — hero plein écran avec `3.png`, titre Dear script, section présentation, CTA.

- [ ] **Étape 3 : Commit**

```bash
git add app/page.tsx
git commit -m "feat: home page"
```

---

### Task 8 : Calendrier + API Route dates

**Files:**
- Create: `app/calendrier/page.tsx`
- Create: `app/calendrier/calendar-client.tsx`
- Create: `app/api/calendar/dates/route.ts`
- Create: `src/lib/actions/reservations.ts`

- [ ] **Étape 1 : Créer l'API Route `app/api/calendar/dates/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reservations = await prisma.demandeResa.findMany({
    select: { date: true },
  });
  const dates = reservations.map((r) => r.date.toISOString().split("T")[0]);
  return NextResponse.json(dates);
}
```

- [ ] **Étape 2 : Créer `src/lib/actions/reservations.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createReservation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const date = new Date(formData.get("date") as string);
  const infoComplementaires = formData.get("infoComplementaires") as string;
  const prestationId = parseInt(formData.get("prestationId") as string);

  const demande = await prisma.demandeResa.create({
    data: { date, infoComplementaires, prestationId },
  });

  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      demandeResaId: demande.id,
      etatId: 3,
    },
  });

  return { success: true };
}

export async function updateReservation(id: number, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId: id },
  });
  if (!reservation || reservation.userId !== session.user.id) redirect("/reservations");

  await prisma.demandeResa.update({
    where: { id },
    data: {
      date: new Date(formData.get("date") as string),
      infoComplementaires: formData.get("infoComplementaires") as string,
      prestationId: parseInt(formData.get("prestationId") as string),
    },
  });

  redirect("/reservations");
}

export async function deleteReservation(demandeResaId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { demandeResaId },
  });
  if (!reservation || reservation.userId !== session.user.id) return;

  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });
}
```

- [ ] **Étape 3 : Créer `app/calendrier/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CalendarClient from "./calendar-client";

export default async function CalendrierPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const prestations = await prisma.prestation.findMany();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Réserver une date</h1>
      <CalendarClient prestations={prestations} />
    </div>
  );
}
```

- [ ] **Étape 4 : Créer `app/calendrier/calendar-client.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { createReservation } from "@/lib/actions/reservations";
import { toast } from "sonner";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

type Prestation = { id: number; type: string };

export default function CalendarClient({ prestations }: { prestations: Prestation[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/calendar/dates")
      .then((r) => r.json())
      .then(setReservedDates);
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createReservation(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.success) {
      toast.success("Réservation envoyée ! Elle est en attente de validation.");
      setSelectedDate(null);
      fetch("/api/calendar/dates").then((r) => r.json()).then(setReservedDates);
    }
  }

  return (
    <div className="card-dj" style={{ background: "linear-gradient(135deg, #0a0a14, #0d0a2e)", boxShadow: "0 0 40px rgba(59,47,181,0.2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-white/60 hover:text-white text-xl px-3 py-1 transition">‹</button>
        <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="text-white/60 hover:text-white text-xl px-3 py-1 transition">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-white/40 text-xs py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isReserved = reservedDates.includes(dateStr);
          const isPast = new Date(dateStr) < new Date(new Date().toDateString());
          const disabled = isReserved || isPast;

          return (
            <button
              key={day}
              onClick={() => !disabled && setSelectedDate(dateStr)}
              disabled={disabled}
              className={`
                h-10 w-full rounded-lg text-sm font-medium transition
                ${isReserved ? "bg-red-500/30 text-red-400 cursor-not-allowed" : ""}
                ${isPast && !isReserved ? "text-white/20 cursor-not-allowed" : ""}
                ${!disabled ? "hover:bg-[#3b2fb5]/40 text-white hover:text-white cursor-pointer" : ""}
                ${selectedDate === dateStr ? "bg-[#3b2fb5] text-white" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Dialog */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0a2e] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6">Réserver le {new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="date" value={selectedDate} />
              <textarea
                name="infoComplementaires"
                placeholder="Informations complémentaires..."
                rows={3}
                className="input-dj resize-none"
              />
              <select name="prestationId" required className="input-dj bg-transparent">
                <option value="" disabled selected>Type de prestation</option>
                {prestations.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0d0a2e]">{p.type}</option>
                ))}
              </select>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setSelectedDate(null)} className="flex-1 py-3 border border-white/20 rounded-lg text-white/60 hover:text-white transition">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary">
                  {loading ? "Envoi..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 5 : Tester**

Connecté, `http://localhost:3000/calendrier`. Clique une date disponible, remplis le formulaire, valide. La date doit apparaître en rouge au prochain chargement.

- [ ] **Étape 6 : Commit**

```bash
git add app/calendrier/ app/api/ src/lib/actions/reservations.ts
git commit -m "feat: calendar page and reservations actions"
```

---

### Task 9 : Mes Réservations + Modification

**Files:**
- Create: `app/reservations/page.tsx`
- Create: `app/reservations/[id]/edit/page.tsx`

- [ ] **Étape 1 : Créer `app/reservations/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteReservation } from "@/lib/actions/reservations";

export default async function ReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: {
      demande: { include: { prestation: true } },
      etat: true,
    },
    orderBy: { demande: { date: "desc" } },
  });

  function badgeClass(statut: string) {
    if (statut === "Validée") return "badge-validee";
    if (statut === "Refusée") return "badge-refusee";
    return "badge-attente";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Mes réservations</h1>
      {reservations.length === 0 ? (
        <p className="text-white/60">Aucune réservation. <Link href="/calendrier" className="text-[#3b2fb5] hover:underline">Réserver une date</Link></p>
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((r) => (
            <div key={r.demandeResaId} className="card-dj flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{new Date(r.demande.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="text-white/60 text-sm">{r.demande.prestation.type}</p>
                {r.demande.infoComplementaires && (
                  <p className="text-white/50 text-sm italic">{r.demande.infoComplementaires}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={badgeClass(r.etat.statut)}>{r.etat.statut}</span>
                <Link href={`/reservations/${r.demandeResaId}/edit`} className="text-sm text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition">
                  Modifier
                </Link>
                <form action={async () => {
                  "use server";
                  const { deleteReservation: del } = await import("@/lib/actions/reservations");
                  await del(r.demandeResaId);
                }}>
                  <button type="submit" className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

> Note : Si l'inline `"use server"` dans JSX ne fonctionne pas avec cette version de Next.js, extraire la suppression dans un composant séparé `DeleteReservationButton` avec `"use client"` qui appelle la Server Action importée.

- [ ] **Étape 2 : Créer `app/reservations/[id]/edit/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateReservation } from "@/lib/actions/reservations";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const demande = await prisma.demandeResa.findUnique({
    where: { id: parseInt(id) },
    include: { reservation: true, prestation: true },
  });

  if (!demande || demande.reservation?.userId !== session.user.id) redirect("/reservations");

  const prestations = await prisma.prestation.findMany();

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Modifier la réservation</h1>
      <form action={updateReservation.bind(null, parseInt(id))} className="flex flex-col gap-4">
        <input
          name="date"
          type="date"
          defaultValue={demande.date.toISOString().split("T")[0]}
          required
          className="input-dj"
        />
        <textarea
          name="infoComplementaires"
          defaultValue={demande.infoComplementaires ?? ""}
          placeholder="Informations complémentaires"
          rows={3}
          className="input-dj resize-none"
        />
        <select name="prestationId" defaultValue={demande.prestationId} className="input-dj bg-transparent">
          {prestations.map((p) => (
            <option key={p.id} value={p.id} className="bg-black">{p.type}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary mt-2">Enregistrer</button>
      </form>
    </div>
  );
}
```

- [ ] **Étape 3 : Tester**

`http://localhost:3000/reservations` — liste des réservations. Tester modifier et supprimer.

- [ ] **Étape 4 : Commit**

```bash
git add app/reservations/
git commit -m "feat: reservations list and edit pages"
```

---

## Phase 4 — Pages Contenu

### Task 10 : Avis

**Files:**
- Create: `app/avis/page.tsx`
- Create: `src/lib/actions/avis.ts`

- [ ] **Étape 1 : Créer `src/lib/actions/avis.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createAvis(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const contenu = (formData.get("contenu") as string).trim();
  if (!contenu) return;

  await prisma.avis.create({
    data: { contenu, userId: session.user.id },
  });

  revalidatePath("/avis");
}

export async function deleteAvis(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const avis = await prisma.avis.findUnique({ where: { id } });
  if (!avis || avis.userId !== session.user.id) return;

  await prisma.avis.delete({ where: { id } });
  revalidatePath("/avis");
}
```

- [ ] **Étape 2 : Créer `app/avis/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createAvis, deleteAvis } from "@/lib/actions/avis";

export default async function AvisPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;

  const avis = await prisma.avis.findMany({
    include: { user: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Avis clients</h1>

      {userId ? (
        <form action={createAvis} className="flex flex-col gap-4 mb-12 card-dj">
          <h2 className="text-lg font-semibold">Laisser un avis</h2>
          <textarea name="contenu" placeholder="Votre avis..." rows={4} required className="input-dj resize-none" />
          <button type="submit" className="btn-primary self-end px-6">Publier</button>
        </form>
      ) : (
        <div className="mb-12 p-4 border border-white/10 rounded-lg text-white/60 text-sm">
          <a href="/login" className="text-[#3b2fb5] hover:underline">Connectez-vous</a> pour laisser un avis.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {avis.map((a) => (
          <div key={a.id} className="card-dj animate-fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">{a.user.name}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-white/80 mt-3 italic">« {a.contenu} »</p>
              </div>
              {userId === a.userId && (
                <form action={deleteAvis.bind(null, a.id)}>
                  <button type="submit" className="text-red-400/60 hover:text-red-400 text-xs transition shrink-0">
                    Supprimer
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Étape 3 : Tester**

`http://localhost:3000/avis` — ajouter et supprimer un avis.

- [ ] **Étape 4 : Commit**

```bash
git add app/avis/ src/lib/actions/avis.ts
git commit -m "feat: avis page"
```

---

### Task 11 : À Venir + Ajouter Soirée

**Files:**
- Create: `app/a-venir/page.tsx`
- Create: `app/a-venir/ajouter/page.tsx`
- Create: `src/lib/actions/soirees.ts`

- [ ] **Étape 1 : Créer `src/lib/actions/soirees.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.roleId !== 2) redirect("/");
  return session;
}

export async function createSoiree(formData: FormData) {
  await requireAdmin();

  await prisma.soiree.create({
    data: {
      titre: formData.get("titre") as string,
      date: new Date(formData.get("date") as string),
      lieu: formData.get("lieu") as string,
      ville: formData.get("ville") as string,
      description: formData.get("description") as string,
    },
  });

  redirect("/a-venir");
}

export async function deleteSoiree(id: number) {
  await requireAdmin();
  await prisma.soiree.delete({ where: { id } });
  revalidatePath("/a-venir");
}
```

- [ ] **Étape 2 : Créer `app/a-venir/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteSoiree } from "@/lib/actions/soirees";

export default async function AVenirPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;
  const isAdmin = user?.roleId === 2;

  const soirees = await prisma.soiree.findMany({ orderBy: { date: "asc" } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Soirées à venir</h1>
        {isAdmin && (
          <Link href="/a-venir/ajouter" className="btn-primary text-sm px-4 py-2">+ Ajouter</Link>
        )}
      </div>

      {soirees.length === 0 ? (
        <p className="text-white/60">Aucune soirée prévue pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {soirees.map((s) => (
            <div key={s.id} className="card-dj animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{s.titre}</h2>
                  <p className="text-[#3b2fb5] font-medium text-sm mb-1">
                    {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {" à "}
                    {new Date(s.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-white/60 text-sm">{s.lieu} — {s.ville}</p>
                  {s.description && <p className="text-white/70 mt-3 text-sm">{s.description}</p>}
                </div>
                {isAdmin && (
                  <form action={deleteSoiree.bind(null, s.id)}>
                    <button type="submit" className="text-red-400/60 hover:text-red-400 text-sm transition shrink-0">
                      Supprimer
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 3 : Créer `app/a-venir/ajouter/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSoiree } from "@/lib/actions/soirees";

export default async function AjouterSoireePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.roleId !== 2) redirect("/");

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Ajouter une soirée</h1>
      <form action={createSoiree} className="flex flex-col gap-4">
        <input name="titre" type="text" placeholder="Titre" required className="input-dj" />
        <input name="date" type="datetime-local" required className="input-dj" />
        <input name="lieu" type="text" placeholder="Lieu" required className="input-dj" />
        <input name="ville" type="text" placeholder="Ville" required className="input-dj" />
        <textarea name="description" placeholder="Description" rows={4} className="input-dj resize-none" />
        <button type="submit" className="btn-primary mt-2">Ajouter</button>
      </form>
    </div>
  );
}
```

- [ ] **Étape 4 : Tester**

Admin : `http://localhost:3000/a-venir` → bouton Ajouter, formulaire, retour liste avec la soirée.

- [ ] **Étape 5 : Commit**

```bash
git add app/a-venir/ src/lib/actions/soirees.ts
git commit -m "feat: soirees a-venir page and admin add/delete"
```

---

### Task 12 : Galerie Photos

**Files:**
- Create: `app/photos/page.tsx`
- Create: `app/photos/photos-client.tsx`
- Create: `src/lib/actions/photos.ts`

- [ ] **Étape 1 : Créer `src/lib/actions/photos.ts`**

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.roleId !== 2) redirect("/");
}

export async function uploadPhoto(formData: FormData) {
  await requireAdmin();

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné" };
  if (file.size > 5 * 1024 * 1024) return { error: "Fichier trop lourd (max 5MB)" };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Format non supporté" };

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(process.cwd(), "public", "photos", filename), Buffer.from(bytes));

  revalidatePath("/photos");
}

export async function deletePhoto(filename: string) {
  await requireAdmin();
  const filepath = path.join(process.cwd(), "public", "photos", filename);
  await unlink(filepath);
  revalidatePath("/photos");
}
```

- [ ] **Étape 2 : Créer `app/photos/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readdirSync } from "fs";
import path from "path";
import PhotosClient from "./photos-client";
import { uploadPhoto, deletePhoto } from "@/lib/actions/photos";

export default async function PhotosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;
  const isAdmin = user?.roleId === 2;

  let photos: string[] = [];
  try {
    photos = readdirSync(path.join(process.cwd(), "public", "photos"))
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Galerie photos</h1>

      {isAdmin && (
        <form action={uploadPhoto} encType="multipart/form-data" className="mb-10 flex items-center gap-4 card-dj">
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-white/60 text-sm" />
          <button type="submit" className="btn-primary text-sm px-4 py-2 shrink-0">Téléverser</button>
        </form>
      )}

      <PhotosClient photos={photos} isAdmin={isAdmin} deletePhoto={deletePhoto} />
    </div>
  );
}
```

- [ ] **Étape 3 : Créer `app/photos/photos-client.tsx`**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function PhotosClient({
  photos,
  isAdmin,
  deletePhoto,
}: {
  photos: string[];
  isAdmin: boolean;
  deletePhoto: (filename: string) => Promise<void>;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (photos.length === 0) return <p className="text-white/60">Aucune photo pour le moment.</p>;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo} className="relative group aspect-square overflow-hidden rounded-xl border border-white/[0.08] cursor-pointer" onClick={() => setLightbox(photo)}>
            <Image src={`/photos/${photo}`} alt={photo} fill className="object-cover group-hover:scale-105 transition duration-300" />
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto(photo); }}
                className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full w-7 h-7 text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl">✕</button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image src={`/photos/${lightbox}`} alt={lightbox} fill className="object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Étape 4 : Tester**

`http://localhost:3000/photos` — Admin : uploader une photo, vérifier qu'elle apparaît, cliquer pour lightbox, supprimer.

- [ ] **Étape 5 : Commit**

```bash
git add app/photos/ src/lib/actions/photos.ts
git commit -m "feat: photos gallery with upload and lightbox"
```

---

## Phase 5 — Admin Panel

### Task 13 : Panel Admin

**Files:**
- Create: `app/admin/page.tsx`
- Create: `src/lib/actions/admin.ts`

- [ ] **Étape 1 : Créer `src/lib/actions/admin.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.roleId !== 2) redirect("/");
  return session;
}

export async function updateReservationStatus(demandeResaId: number, etatId: number) {
  await requireAdmin();
  await prisma.reservation.update({
    where: { demandeResaId },
    data: { etatId },
  });
  revalidatePath("/admin");
}

export async function deleteReservationAdmin(demandeResaId: number) {
  await requireAdmin();
  await prisma.reservation.delete({ where: { demandeResaId } });
  await prisma.demandeResa.delete({ where: { id: demandeResaId } });
  revalidatePath("/admin");
}
```

- [ ] **Étape 2 : Créer `app/admin/page.tsx`**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminTable from "./admin-table";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser || currentUser.roleId !== 2) redirect("/");

  const reservations = await prisma.reservation.findMany({
    include: {
      user: true,
      demande: { include: { prestation: true } },
      etat: true,
    },
    orderBy: { demande: { date: "desc" } },
  });

  const etats = await prisma.etat.findMany();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Panel Admin</h1>
      <AdminTable reservations={reservations} etats={etats} />
    </div>
  );
}
```

- [ ] **Étape 3 : Créer `app/admin/admin-table.tsx`**

```tsx
"use client";

import { useState } from "react";
import { updateReservationStatus, deleteReservationAdmin } from "@/lib/actions/admin";

type Etat = { id: number; statut: string };
type Reservation = {
  userId: string;
  demandeResaId: number;
  etatId: number;
  user: { name: string; email: string; tel: string | null };
  demande: { date: Date; infoComplementaires: string | null; prestation: { type: string } };
  etat: { statut: string };
};

export default function AdminTable({ reservations, etats }: { reservations: Reservation[]; etats: Etat[] }) {
  const [statusMap, setStatusMap] = useState<Record<number, number>>(
    Object.fromEntries(reservations.map((r) => [r.demandeResaId, r.etatId]))
  );

  function badgeClass(statut: string) {
    if (statut === "Validée") return "badge-validee";
    if (statut === "Refusée") return "badge-refusee";
    return "badge-attente";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-white/60 text-left">
            <th className="pb-3 pr-4">Client</th>
            <th className="pb-3 pr-4">Contact</th>
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 pr-4">Prestation</th>
            <th className="pb-3 pr-4">Infos</th>
            <th className="pb-3 pr-4">Statut</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.demandeResaId} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition">
              <td className="py-3 pr-4 font-medium">{r.user.name}</td>
              <td className="py-3 pr-4 text-white/60">
                <div>{r.user.email}</div>
                {r.user.tel && <div>{r.user.tel}</div>}
              </td>
              <td className="py-3 pr-4">
                {new Date(r.demande.date).toLocaleDateString("fr-FR")}
              </td>
              <td className="py-3 pr-4 text-white/70">{r.demande.prestation.type}</td>
              <td className="py-3 pr-4 text-white/50 max-w-[200px] truncate">{r.demande.infoComplementaires ?? "—"}</td>
              <td className="py-3 pr-4">
                <span className={badgeClass(r.etat.statut)}>{r.etat.statut}</span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <select
                    value={statusMap[r.demandeResaId]}
                    onChange={(e) => setStatusMap((m) => ({ ...m, [r.demandeResaId]: parseInt(e.target.value) }))}
                    className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white"
                  >
                    {etats.map((e) => (
                      <option key={e.id} value={e.id} className="bg-black">{e.statut}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateReservationStatus(r.demandeResaId, statusMap[r.demandeResaId])}
                    className="text-xs bg-[#3b2fb5] text-white px-2 py-1 rounded hover:bg-[#2d24a0] transition"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => deleteReservationAdmin(r.demandeResaId)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition"
                  >
                    Suppr.
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Étape 4 : Tester**

Connecté en admin (`roleId = 2` en base), `http://localhost:3000/admin`. Vérifier tableau des réservations, changement de statut, suppression.

- [ ] **Étape 5 : Commit final**

```bash
git add app/admin/ src/lib/actions/admin.ts
git commit -m "feat: admin panel - reservation management"
```

---

## Checklist finale

- [ ] `npx prisma studio` → toutes les tables visibles avec les seeds
- [ ] Signup → login → profil → déconnexion fonctionne
- [ ] Calendrier : dates réservées en rouge, réservation crée une entrée
- [ ] `/reservations` : liste avec badges, modifier, supprimer
- [ ] `/avis` : créer et supprimer son propre avis
- [ ] `/a-venir` : liste des soirées ; admin peut ajouter/supprimer
- [ ] `/photos` : galerie, lightbox ; admin peut uploader/supprimer
- [ ] `/admin` : tableau complet, changement de statut
- [ ] Responsive mobile OK (burger menu, grids)
- [ ] Non-admin redirigé depuis `/admin`, `/a-venir/ajouter`
- [ ] Non-connecté redirigé depuis `/calendrier`, `/reservations`, `/profil`
