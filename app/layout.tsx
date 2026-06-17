import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import CookieBanner from "@/components/cookie-banner";
import VercelAnalytics from "@/components/vercel-analytics";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | Julien C — DJ",
    default: "Julien C — DJ Événementiel",
  },
  description:
    "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées. Réservez votre date en ligne.",
  keywords: ["DJ", "Julien C", "événementiel", "mariage", "soirée privée", "anniversaire", "DJ Corse", "DJ Julien"],
  authors: [{ name: "Julien C" }],
  creator: "Julien C",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "Julien C — DJ",
    title: "Julien C — DJ Événementiel",
    description:
      "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Julien C — DJ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Julien C — DJ Événementiel",
    description: "DJ Julien C, spécialiste des soirées événementielles.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={cn(poppins, "antialiased", "h-full")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CookieBanner />
          <VercelAnalytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
