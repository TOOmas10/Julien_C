import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// /calendrier n'y figure pas : page réservée aux membres et non indexée.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/a-venir`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/avis`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/photos`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
