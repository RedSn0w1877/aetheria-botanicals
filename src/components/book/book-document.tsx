// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { ReactNode } from "react";
import { FONT_CLASSES } from "@/app/book-fonts";
import { FleuronSprite } from "@/components/book/fleuron-sprite";
import { AttributionSentinel } from "@/components/brand/attribution-sentinel";
import { withBase } from "@/lib/base-path";
import { liteScript } from "@/lib/device";

/**
 * The document shell every page of the book is bound in: <html> with the fonts, the pre-paint script,
 * the licence link, the fleuron sprite and the attribution sentinel. Shared by the root layout and by
 * app/global-not-found.tsx, which renders its own <html> outside the layout.
 */
export function BookDocument({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the head script adds `js` (and `data-lite`) to <html> before React
    // hydrates, and the DOM's answer is the one we keep. Only <html> is ever touched before hydration.
    <html lang="en" className={FONT_CLASSES} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- an App Router document shell (root layout and global 404), where <head> is right; the rule is for Pages Router pages. */}
      <head>
        {/* Runs while the HTML parses, before first paint (see lib/device.ts). */}
        <script dangerouslySetInnerHTML={{ __html: liteScript() }} />
        {/* A raw <link>, so the basePath is added by hand. */}
        <link rel="license" href={withBase("/legal/terms/")} />
      </head>
      <body>
        <FleuronSprite />
        {children}
        <AttributionSentinel />
      </body>
    </html>
  );
}
