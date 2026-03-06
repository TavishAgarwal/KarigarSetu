import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { OrganizationJsonLd } from "@/components/JsonLd";

import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KarigarSetu — AI-Powered Marketplace for Indian Artisans",
  description:
    "KarigarSetu connects traditional Indian craftsmanship with the global digital market through intelligent AI-powered narrative generation and direct commerce.",
  openGraph: {
    title: "KarigarSetu — AI-Powered Marketplace for Indian Artisans",
    description: "Discover authentic handcrafted products from skilled Indian artisans. AI-powered stories, fair prices, direct commerce.",
    type: "website",
    locale: "en_IN",
    siteName: "KarigarSetu",
  },
  twitter: {
    card: "summary_large_image",
    title: "KarigarSetu — AI-Powered Marketplace for Indian Artisans",
    description: "Discover authentic handcrafted products from skilled Indian artisans.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KarigarSetu" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icons/icon-512.svg" />
        <OrganizationJsonLd />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip to main content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <ServiceWorkerRegistrar />
        <ErrorBoundary>
          <AuthProvider><CartProvider><div id="main-content">{children}</div></CartProvider></AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
