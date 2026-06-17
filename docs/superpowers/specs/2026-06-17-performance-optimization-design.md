---
name: performance-optimization
description: Performance optimization for DJ Julien C site — images, fonts, animations, and photo storage migration to Vercel Blob
metadata:
  type: project
---

# Performance Optimization — DJ Julien C

## Context

The site runs slowly in production on Vercel. Analysis identified 6 concrete causes: an unoptimized hero image served as a raw CSS background, large PNG social icons, a heavy custom font in OTF format, a 1.5s body fade animation blocking perceived load, an oversized favicon, and a broken photo upload system that writes to the ephemeral Vercel filesystem.

## Changes

### 1. Hero image — CSS background → `<Image>` with `priority`

**File:** `app/page.tsx`

The hero `<section>` currently uses `bg-[..., url('/3.png')]` as a Tailwind CSS background. CSS backgrounds bypass Next.js Image Optimization entirely — the browser downloads the raw 1.9MB PNG.

**Change:** Replace with a `<Image>` component (`next/image`) positioned `absolute inset-0 z-0 object-cover` with `fill` and `priority`. The gradient overlay becomes a separate `<div absolute inset-0>`. The section itself drops the background classes and becomes `relative overflow-hidden`. Visual output is identical.

**Expected gain:** 1.9MB PNG → ~200–350KB WebP/AVIF (browser-dependent), plus LCP preload hint.

---

### 2. Social icons — PNG → inline SVG

**File:** `src/components/header.tsx`

Three PNG files used as 40×40 icons in the desktop header:
- `instagram.png` — 388KB
- `whatsapp.png` — 102KB
- `mail.png` — 26KB

**Change:** Replace `<Image src="...png">` with inline SVG components. No file requests, no `<Image>` overhead for tiny icons. The PNG files are deleted from `public/`.

**Expected gain:** ~516KB removed from page weight.

---

### 3. Custom font — OTF → WOFF2 + `font-display: swap`

**File:** `app/globals.css`, `public/fonts/`

`dearscript.otf` (110KB) is served in OTF format, which is not compressed for web delivery. No `font-display` is set, which can cause invisible text during font load (FOIT).

**Change:**
- Convert `dearscript.otf` → `dearscript.woff2` using `wasm-pack` or a local converter tool
- Update `@font-face` in `globals.css` to reference `dearscript.woff2`
- Add `font-display: swap` to prevent rendering block

**Expected gain:** ~40–50% font size reduction (110KB → ~55–65KB) + no FOIT.

---

### 4. Body animation — 1.5s → 0.3s

**File:** `app/globals.css`

```css
/* Before */
body { opacity: 0; animation: pageFade 1.5s ease forwards; }

/* After */
body { opacity: 0; animation: pageFade 0.3s ease forwards; }
```

The page is invisible for 1.5 seconds even when content is fully loaded. Reducing to 0.3s retains the subtle fade-in while eliminating the perceived blank screen.

---

### 5. Favicon compression

**Files:** `public/icon.png` (277KB), `public/apple-icon.png` (277KB), `app/icon.png`, `app/apple-icon.png`

277KB favicons are unnecessary. The files are compressed/resized to ≤ 32KB without visual degradation (favicons display at 16–64px).

---

### 6. Photo storage — filesystem → Vercel Blob

**Files:** `src/lib/actions/photos.ts`, `app/photos/page.tsx`, `next.config.ts`

The current implementation uses `fs.writeFile` to write photos to `public/gallery/`. On Vercel, the serverless filesystem is ephemeral and read-only in production — uploaded photos do not persist across deployments or between function instances.

**Change:**

- Install `@vercel/blob`
- `uploadPhoto`: replace `writeFile` with `put(filename, file, { access: 'public' })` — returns a persistent `url`
- `deletePhoto`: replace `unlink` with `del(url)`
- Photo list: replace `fs.readdir('public/gallery')` with `list()` from Vercel Blob, return `url[]` instead of `filename[]`
- `photos-client.tsx`: update to use full URLs instead of `/gallery/${filename}` paths
- `next.config.ts`: add `remotePatterns` for `*.public.blob.vercel-storage.com` so `<Image>` can serve Blob URLs
- Static photos (`3.png`, `4.png`) currently in `public/gallery/` are kept as-is for backward compatibility

**Vercel setup required after deploy:**
1. Go to Vercel dashboard → project → Storage tab
2. Create a new Blob store and link it to the project
3. This automatically sets `BLOB_READ_WRITE_TOKEN` as an environment variable
4. Redeploy

## Visual impact

None. All changes are purely technical. The site looks and behaves identically.

## Files changed

| File | Change |
|---|---|
| `app/page.tsx` | Hero: CSS bg → `<Image priority>` |
| `src/components/header.tsx` | Socials: PNG `<Image>` → inline SVG |
| `app/globals.css` | Font path OTF→WOFF2, `font-display: swap`, pageFade 1.5s→0.3s |
| `public/fonts/dearscript.woff2` | New WOFF2 font file |
| `public/fonts/dearscript.otf` | Deleted |
| `public/instagram.png`, `whatsapp.png`, `mail.png` | Deleted |
| `public/icon.png`, `apple-icon.png` | Compressed |
| `next.config.ts` | Add `remotePatterns` for Vercel Blob |
| `src/lib/actions/photos.ts` | Migrate to Vercel Blob |
| `app/photos/page.tsx` | Read photos from Blob list |
| `app/photos/photos-client.tsx` | Use full Blob URLs |
