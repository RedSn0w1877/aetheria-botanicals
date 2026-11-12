// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { withBase } from "@/lib/base-path";

/**
 * The root layout's not-found fallback, kept deliberately tiny: it is serialized into every page's RSC
 * payload, and a static export never calls notFound(), so readers do not normally see it. A stray URL
 * gets the full leaf in app/global-not-found.tsx instead. A plain <a>, so it carries no client JS.
 */
export default function NotFound() {
  return (
    <main id="main" className="bk-measure">
      <p>
        This page was never bound into the book. <a href={withBase("/")}>Return to the book</a>
      </p>
    </main>
  );
}
