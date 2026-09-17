// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata } from "next";
import { LegalFolio } from "@/components/legal/legal-folio";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the Aetheria Botanicals concept site by HVNF Studios handles information.",
};

export default function PrivacyPage() {
  return (
    <LegalFolio
      title="Privacy"
      updated="17 September 2026"
      clauses={[
        {
          heading: "Nothing is collected",
          body: (
            <p>
              The reservation drawer, monogram field and blend composer run entirely in your browser. What you type
              is never sent to a server, stored in a database or shared with anyone. Reload the page and it is gone.
            </p>
          ),
        },
        {
          heading: "No tracking",
          body: (
            <p>
              This site sets no analytics, advertising or tracking cookies. A single session marker may be kept in
              your browser so the opening sequence only plays once per visit.
            </p>
          ),
        },
        {
          heading: "Hosting",
          body: (
            <p>
              The site is served as static files. The host may keep standard technical logs, such as IP address and
              request time, to deliver and protect the pages. HVNF Studios does not use those logs to identify you.
            </p>
          ),
        },
        {
          heading: "Fonts",
          body: (
            <p>Typefaces are bundled with the site at build time, so no request is made to a font service while you browse.</p>
          ),
        },
        {
          heading: "Questions",
          body: <p>Privacy questions go to HVNF Studios through its official channels.</p>,
        },
      ]}
    />
  );
}
