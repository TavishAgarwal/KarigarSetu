import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ServiceWorkerRegistrar />
        <ErrorBoundary>
          <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
