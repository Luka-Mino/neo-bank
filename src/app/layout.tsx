import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face — warm grotesque that rhymes with the logo's rounded forms.
// Marketing headlines and hero numbers only; UI stays on Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#122e2e",
};

export const metadata: Metadata = {
  // Absolute URLs for Open Graph / Twitter images and canonical links.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Moneta | Everyday money",
  description:
    "Checking, savings and a debit card in one place, built on regulated infrastructure.",
  applicationName: "Moneta",
  openGraph: {
    type: "website",
    siteName: "Moneta",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  // favicon.ico, icon.svg and apple-icon.png in src/app are picked up by
  // Next's file conventions.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
