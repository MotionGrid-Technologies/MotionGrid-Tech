import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavbarContainer } from "@/components/nav/NavbarContainer";
import { Footer } from "@/components/nav/Footer";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { CookieBanner } from "@/components/analytics/CookieBanner";
import { site } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Precision-built software`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "MotionGrid Technologies",
    "software development",
    "custom software",
    "field service software",
    "AI development",
    "Next.js development",
  ],
  openGraph: {
    title: `${site.name} — Precision-built software`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Precision-built software`,
    description: site.description,
  },
  icons: {
    icon: "/brand/logo-icon.svg",
    shortcut: "/brand/logo-icon.svg",
    apple: "/brand/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // TODO: paste the content value from Search Console's HTML-tag
    // verification method (Settings → Ownership verification).
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-mg)] focus:bg-signal focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-obsidian"
        >
          Skip to main content
        </a>
        <PostHogProvider />
        <CookieBanner />
        <NavbarContainer />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
