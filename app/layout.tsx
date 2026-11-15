import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import CookieBanner from "@/components/cookie-banner";
import Analytics from "@/components/analytics";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    template: "%s | Julien C — DJ",
    default: SITE.title,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Julien C" }],
  creator: "Julien C",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description:
      "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Platine de DJ Julien C en soirée" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: "DJ Julien C, spécialiste des soirées événementielles.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

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
      <body className="antialiased h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CookieBanner />
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
