// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { AttributionSentinel } from "@/components/brand/attribution-sentinel";
import { MarginWatermark } from "@/components/brand/margin-watermark";
import { COPYRIGHT_LINE, STUDIO } from "@/lib/copyright";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aetheria Botanicals — Slow-extracted botanical perfume",
    template: "%s — Aetheria Botanicals",
  },
  description:
    "Small-batch botanical perfume, cold-macerated for 180 days from wild-foraged plants. A portfolio concept by HVNF Studios.",
  applicationName: "Aetheria Botanicals",
  authors: [{ name: STUDIO }],
  creator: STUDIO,
  publisher: STUDIO,
  robots: { index: false, follow: false },
  other: {
    copyright: COPYRIGHT_LINE,
    "dcterms.rightsHolder": STUDIO,
    "dcterms.rights": COPYRIGHT_LINE,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2eb",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-linen font-sans text-rosemary">
        {/*
          React hoists this into <head>. It's a raw <link>, which Next's basePath doesn't
          rewrite, so the GitHub Pages project path is written out by hand.
        */}
        <link rel="license" href="/aetheria-botanicals/legal/terms" />
        <LenisProvider>{children}</LenisProvider>
        <MarginWatermark />
        <AttributionSentinel />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#f9f7f2",
              border: "1px solid #dcd6c8",
              color: "#18231c",
              borderRadius: 0,
              fontFamily: "var(--font-jost)",
            },
          }}
        />
      </body>
    </html>
  );
}
