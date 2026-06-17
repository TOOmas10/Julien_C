# Performance Optimization — DJ Julien C

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial page weight by ~85%, fix the 1.5s blank-screen animation, and migrate photo uploads from ephemeral filesystem to Vercel Blob for persistence in production.

**Architecture:** Pure performance improvements — no behaviour changes. Hero image moves from an unoptimised CSS background to a Next.js `<Image priority>` for LCP optimisation. Social PNG icons are replaced with inline SVGs. The custom font is converted from OTF to WOFF2. Photo storage migrates from `fs.writeFile` (broken on Vercel serverless) to `@vercel/blob`.

**Tech Stack:** Next.js 16.2.9 (App Router), Tailwind CSS v4, `@vercel/blob`, `wawoff2` (WASM font converter), `sharp` (PNG compression). Push target: `https://github.com/TOOmas10/Julien_C`.

## Global Constraints

- All changes are performance-only — zero visual regressions
- Do NOT alter any text copy, colours, or layout
- Working directory: `/Users/thomasberthaud/Desktop/Projet_Perso/Julien C`
- Push to remote `https://github.com/TOOmas10/Julien_C` on branch `main` at the very end (Task 7)
- Keep `devDependencies` for build-time-only packages (`wawoff2`, `sharp`)
- Remove `wawoff2` and `sharp` from `devDependencies` after conversion scripts run (they are one-shot tools)

---

## File Map

| File | Action |
|---|---|
| `app/page.tsx` | Modify: replace CSS hero bg with `<Image fill priority>` |
| `src/components/header.tsx` | Modify: replace PNG `<Image>` icons with inline SVGs |
| `src/components/mobile-nav.tsx` | Modify: replace PNG `<Image>` icons with inline SVGs |
| `app/globals.css` | Modify: `pageFade 1.5s → 0.3s`, OTF → WOFF2 font path, add `font-display: swap` |
| `public/fonts/dearscript.woff2` | Create via conversion script |
| `public/fonts/dearscript.otf` | Delete after WOFF2 exists |
| `public/instagram.png` | Delete |
| `public/whatsapp.png` | Delete |
| `public/mail.png` | Delete |
| `public/icon.png` | Overwrite with compressed version |
| `public/apple-icon.png` | Overwrite with compressed version |
| `app/icon.png` | Overwrite with compressed version |
| `app/apple-icon.png` | Overwrite with compressed version |
| `next.config.ts` | Add `images.remotePatterns` for Vercel Blob; update CSP `img-src` |
| `src/lib/actions/photos.ts` | Migrate `uploadPhoto` / `deletePhoto` to Vercel Blob |
| `app/photos/page.tsx` | Replace `readdir` with Vercel Blob `list()` |
| `app/photos/photos-client.tsx` | Accept full URLs instead of filenames |
| `public/gallery/3.png` | Delete (duplicate of `public/3.png`, clean slate for Blob gallery) |
| `public/gallery/4.png` | Delete (same reason) |

---

## Task 1: Body animation speed

**Files:**
- Modify: `app/globals.css` (line 201 area)

**Interfaces:**
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Edit `globals.css`**

Find:
```css
body {
  @apply bg-background text-foreground;
  opacity: 0;
  animation: pageFade 1.5s ease forwards;
}
```

Replace with:
```css
body {
  @apply bg-background text-foreground;
  opacity: 0;
  animation: pageFade 0.3s ease forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "perf: reduce body fade-in from 1.5s to 0.3s"
```

---

## Task 2: Social icons — PNG → inline SVG

**Files:**
- Modify: `src/components/header.tsx`
- Modify: `src/components/mobile-nav.tsx`
- Delete: `public/instagram.png`, `public/whatsapp.png`, `public/mail.png`

**Interfaces:**
- Produces: nothing consumed by other tasks

The three PNG files total ~516KB for icons displayed at 34–40px. Replace with inline SVGs — zero network requests, identical appearance.

- [ ] **Step 1: Update `src/components/header.tsx`**

Remove the `import Image from "next/image"` line if it is only used for social icons (keep it if used elsewhere — it is not used elsewhere in header.tsx).

Replace the three social icon `<Link>` blocks (lines 59–68 in header.tsx) with:

```tsx
{/* Right: socials (desktop) + hamburger (mobile) */}
<div className="flex items-center gap-3">
  <div className="hidden md:flex gap-4 items-center">
    <Link href="https://www.instagram.com/dj_julien.c/" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="Instagram">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </Link>
    <Link href="mailto:julien.dj2a@gmail.com" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Mail">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    </Link>
    <Link href="https://wa.me/0603553228" target="_blank" rel="noopener noreferrer" className="transition-all duration-500 ease-out hover:scale-[1.2]">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </Link>
  </div>
  <MobileNav links={homeLinks} hasReserveButton />
</div>
```

- [ ] **Step 2: Update `src/components/mobile-nav.tsx`**

Remove `import Image from "next/image"` (line 3).

Replace the socials section at the bottom of the drawer (lines 107–117) with:

```tsx
{/* Socials */}
<div className="px-[24px] py-[28px] flex gap-[16px] border-t border-[rgba(80,60,200,0.15)]">
  <Link href="https://www.instagram.com/dj_julien.c/" target="_blank" rel="noopener noreferrer" onClick={close} className="opacity-80 hover:opacity-100 transition-opacity">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  </Link>
  <Link href="mailto:julien.dj2a@gmail.com" target="_blank" rel="noopener noreferrer" onClick={close} className="opacity-80 hover:opacity-100 transition-opacity">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Mail">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  </Link>
  <Link href="https://wa.me/0603553228" target="_blank" rel="noopener noreferrer" onClick={close} className="opacity-80 hover:opacity-100 transition-opacity">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  </Link>
</div>
```

- [ ] **Step 3: Delete PNG files**

```bash
rm "public/instagram.png" "public/whatsapp.png" "public/mail.png"
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript or import errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/header.tsx src/components/mobile-nav.tsx
git add -u public/instagram.png public/whatsapp.png public/mail.png
git commit -m "perf: replace social PNG icons with inline SVGs (~516KB removed)"
```

---

## Task 3: Hero image — CSS background → Next.js `<Image priority>`

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `next/image` (already in project)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Edit `app/page.tsx`**

Add `Image` to the existing imports at the top:

```tsx
import Image from "next/image";
```

Replace the entire `<section id="hero" ...>` opening tag and its `before:` pseudo-element classes. The original section class string is very long. Replace:

```tsx
      <section
        id="hero"
        className="relative bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_50%,#000_100%),url('/3.png')] bg-cover bg-center h-screen flex justify-center items-center flex-col overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_60%,var(--primary-glow)_0%,transparent_55%)] before:opacity-40 before:pointer-events-none"
      >
```

with:

```tsx
      <section
        id="hero"
        className="relative h-screen flex justify-center items-center flex-col overflow-hidden"
      >
        <Image
          src="/3.png"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_50%,#000_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,var(--primary-glow)_0%,transparent_55%)] opacity-40 pointer-events-none" />
```

The existing child elements (`<p>`, `<h1>`, scroll indicator `<div>`) already have `z-[1]` in their classNames — they will render above the overlays which have no explicit z-index. No other changes needed inside the section.

- [ ] **Step 2: Verify build and visual**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "perf: convert hero from CSS background to Next.js Image with priority (LCP)"
```

---

## Task 4: Font — OTF → WOFF2 + font-display swap

**Files:**
- Create: `public/fonts/dearscript.woff2`
- Delete: `public/fonts/dearscript.otf`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Install `wawoff2` devDependency**

```bash
npm install --save-dev wawoff2
```

- [ ] **Step 2: Convert OTF to WOFF2**

```bash
node -e "
const wawoff2 = require('wawoff2');
const fs = require('fs');
const input = fs.readFileSync('public/fonts/dearscript.otf');
wawoff2.compress(input).then(result => {
  fs.writeFileSync('public/fonts/dearscript.woff2', Buffer.from(result));
  const pct = Math.round((1 - result.byteLength / input.length) * 100);
  console.log('Written dearscript.woff2 —', result.byteLength, 'bytes (', pct + '% smaller)');
});
"
```

Expected output: `Written dearscript.woff2 — XXXXX bytes ( XX% smaller)`

Verify the file exists:
```bash
ls -lah public/fonts/
```

Expected: both `.otf` and `.woff2` present.

- [ ] **Step 3: Update `app/globals.css`**

Replace:
```css
@font-face {
  font-family: "Dear";
  src: url("/fonts/dearscript.otf") format("opentype");
  font-weight: normal;
  font-style: normal;
}
```

with:
```css
@font-face {
  font-family: "Dear";
  src: url("/fonts/dearscript.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 4: Delete the OTF file**

```bash
rm public/fonts/dearscript.otf
```

- [ ] **Step 5: Remove `wawoff2` devDependency (one-shot tool)**

```bash
npm uninstall wawoff2
```

- [ ] **Step 6: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean build.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css public/fonts/dearscript.woff2
git add -u public/fonts/dearscript.otf
git commit -m "perf: convert custom font from OTF to WOFF2, add font-display swap"
```

---

## Task 5: Favicon compression

**Files:**
- Overwrite: `public/icon.png` (277KB → target ~30–50KB)
- Overwrite: `public/apple-icon.png` (277KB → same)
- Overwrite: `app/icon.png` (same image)
- Overwrite: `app/apple-icon.png` (same image)

**Interfaces:**
- Produces: nothing consumed by other tasks

Note: all four files are the same 512×512 image. Compress once, copy to all paths.

- [ ] **Step 1: Install `sharp` devDependency**

```bash
npm install --save-dev sharp
```

- [ ] **Step 2: Compress icons**

```bash
node -e "
const sharp = require('sharp');
const paths = [
  'public/icon.png',
  'public/apple-icon.png',
  'app/icon.png',
  'app/apple-icon.png',
];
(async () => {
  for (const p of paths) {
    const buf = await sharp(p)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
    require('fs').writeFileSync(p, buf);
    console.log(p, '->', buf.length, 'bytes');
  }
})();
"
```

Expected output: each file path followed by a size smaller than the original 277KB.

- [ ] **Step 3: Remove `sharp` devDependency (one-shot tool)**

```bash
npm uninstall sharp
```

- [ ] **Step 4: Commit**

```bash
git add public/icon.png public/apple-icon.png app/icon.png app/apple-icon.png
git commit -m "perf: compress 512x512 favicons (~277KB → ~40KB each)"
```

---

## Task 6: Photo storage — Vercel Blob

**Files:**
- Modify: `next.config.ts`
- Modify: `src/lib/actions/photos.ts`
- Modify: `app/photos/page.tsx`
- Modify: `app/photos/photos-client.tsx`
- Delete: `public/gallery/3.png`, `public/gallery/4.png`

**Interfaces:**
- Consumes: `@vercel/blob` — `put`, `del`, `list`
- Produces:
  - `uploadPhoto(prev, formData): Promise<UploadState>` — unchanged signature
  - `deletePhoto(blobUrl: string): Promise<void>` — parameter changes from filename to full blob URL
  - `PhotosPage` passes `photos: string[]` of full URLs to `PhotosClient`
  - `PhotosClient` prop `photos: string[]` — now full URLs (was filenames)

- [ ] **Step 1: Install `@vercel/blob`**

```bash
npm install @vercel/blob
```

- [ ] **Step 2: Update `next.config.ts`**

Add `images.remotePatterns` and update the CSP `img-src` to allow Vercel Blob URLs:

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
      "connect-src 'self' https://accelerate.prisma-data.net https://*.public.blob.vercel-storage.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Rewrite `src/lib/actions/photos.ts`**

Replace the entire file:

```ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

type UploadState = { error?: string; success?: string } | undefined;

export async function uploadPhoto(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) return { error: "Non autorisé" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    return { error: "Format non autorisé. Utilisez JPG, PNG, WEBP ou GIF." };
  if (file.size > 5 * 1024 * 1024)
    return { error: "Fichier trop lourd (5 Mo maximum)." };

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const pathname = `gallery/photo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  await put(pathname, file, { access: "public" });

  revalidatePath("/photos");
  return { success: "Photo ajoutée avec succès." };
}

export async function deletePhoto(blobUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) return;

  try {
    await del(blobUrl);
  } catch {}

  revalidatePath("/photos");
}
```

- [ ] **Step 4: Rewrite `app/photos/page.tsx`**

Replace the entire file:

```ts
import type { Metadata } from "next";
import { list } from "@vercel/blob";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Footer from "@/components/footer";
import PhotosClient from "./photos-client";
import HeaderAvis from "@/components/header-avis";

export const metadata: Metadata = {
  title: "Photos",
  description: "Galerie photos des soirées et événements de DJ Julien C.",
};

export default async function PhotosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.roleId === 2;

  let photos: string[] = [];
  try {
    const { blobs } = await list({ prefix: "gallery/" });
    photos = blobs.map((b) => b.url);
  } catch {}

  return (
    <>
      <HeaderAvis />
      <main className="min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] pt-[80px] px-[16px] md:px-[24px] pb-[60px]">
        <div className="max-w-[1100px] mx-auto pt-[20px]">
          <PhotosClient photos={photos} isAdmin={isAdmin} />
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Update `app/photos/photos-client.tsx`**

Change how photos are rendered. The component receives full blob URLs instead of filenames.

First, update the `handleDelete` function (around line 37):

```tsx
async function handleDelete(url: string) {
  if (!confirm("Supprimer cette photo ?")) return;
  await deletePhoto(url);
  router.refresh();
}
```

Then replace the `<Image>` inside the grid (lines 107–114):

```tsx
              <Image
                src={filename}
                alt="photo"
                fill
                className="object-cover cursor-pointer transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                onClick={() => setLightboxSrc(filename)}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 220px"
              />
```

(Note: the `map` callback variable was `filename` — rename it to `url` and update accordingly. The full grid section becomes:)

```tsx
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px]">
        {photos.map((url, i) => (
          <div
            key={url}
            className="group relative rounded-[12px] overflow-hidden border border-[rgba(80,60,200,0.25)] bg-[rgba(10,8,40,0.7)] aspect-[4/3] transition-all duration-300 hover:border-[rgba(100,80,255,0.55)] hover:shadow-[0_0_24px_rgba(60,40,200,0.3)] animate-[fadeUp_0.55s_ease_both]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Image
              src={url}
              alt="photo"
              fill
              className="object-cover cursor-pointer transition-transform duration-500 ease-out group-hover:scale-[1.07]"
              onClick={() => setLightboxSrc(url)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 220px"
            />
            {isAdmin && (
              <Button
                onClick={() => handleDelete(url)}
                className="absolute top-[8px] right-[8px] bg-[rgba(180,30,60,0.75)] border-none rounded-[6px] text-white text-[11px] font-bold tracking-[0.06em] uppercase px-[10px] py-[5px] cursor-pointer opacity-0 group-hover:opacity-100 transition-[opacity,background] duration-150 hover:bg-[rgba(220,40,70,0.9)] h-auto z-10"
              >
                Suppr.
              </Button>
            )}
          </div>
        ))}
      </div>
```

- [ ] **Step 6: Delete static gallery duplicates**

```bash
rm "public/gallery/3.png" "public/gallery/4.png"
```

- [ ] **Step 7: Verify build**

```bash
npm run build 2>&1 | tail -30
```

Expected: clean build. If you see `BLOB_READ_WRITE_TOKEN` errors at build time, that is expected — the token is only needed at runtime. The build should not call Vercel Blob APIs.

- [ ] **Step 8: Commit**

```bash
git add next.config.ts src/lib/actions/photos.ts app/photos/page.tsx app/photos/photos-client.tsx
git add -u public/gallery/3.png public/gallery/4.png
git commit -m "feat: migrate photo storage from filesystem to Vercel Blob"
```

---

## Task 7: Final build check + push to GitHub

**Files:** none (verification + git push only)

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1
```

Expected: `✓ Compiled successfully` with no errors or warnings.

- [ ] **Step 2: Verify deleted files are gone**

```bash
ls public/*.png 2>/dev/null && echo "unexpected PNGs remain" || echo "OK"
ls public/fonts/
```

Expected: `public/` has no `instagram.png`, `whatsapp.png`, `mail.png`. `public/fonts/` contains only `dearscript.woff2`.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

Expected: `Branch 'main' set up to track remote branch 'main' of 'origin'` or simply `Everything up-to-date`.

---

## What to do on Vercel after the deploy

Once the push triggers a Vercel deploy, do the following **before testing photo uploads**:

1. **Create a Blob store:**
   - Vercel dashboard → your project → **Storage** tab
   - Click **Create Database** → choose **Blob**
   - Name it anything (e.g. `dj-gallery`) and click **Create**

2. **Link to the project:**
   - Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment variables (Production + Preview)

3. **Redeploy** (required for the env var to be available):
   - Vercel dashboard → **Deployments** → **Redeploy** on the latest deployment
   - Or simply push a new empty commit: `git commit --allow-empty -m "chore: trigger redeploy for blob token" && git push`

4. **Test the upload** on the live site — photos should now persist permanently.
