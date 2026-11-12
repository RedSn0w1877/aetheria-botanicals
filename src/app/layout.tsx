// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BookDocument } from "@/components/book/book-document";
import { COPYRIGHT_LINE, STUDIO } from "@/lib/copyright";

export const metadata: Metadata = {
  title: {
    default: "Aetheria Botanicals — perfume from wild plants, steeped cold for 180 days",
    template: "%s — Aetheria Botanicals",
  },
  description:
    "Small-batch perfume made from wild plants, steeped in the cold for 180 days in Grasse. A portfolio concept by HVNF Studios.",
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
  themeColor: "#c7a982",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <BookDocument>{children}</BookDocument>;
}
