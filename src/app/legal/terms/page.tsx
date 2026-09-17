// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata } from "next";
import { LegalFolio } from "@/components/legal/legal-folio";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Aetheria Botanicals concept site by HVNF Studios.",
};

export default function TermsPage() {
  return (
    <LegalFolio
      title="Terms of use"
      updated="17 September 2026"
      clauses={[
        {
          heading: "A study, not a shop",
          body: (
            <p>
              This site is a design and engineering demonstration by HVNF Studios. Aetheria Botanicals does not
              exist as a business. No perfume is made, sold or shipped, no allocation is held, and nothing you do
              here, including the reservation drawer, forms an agreement of any kind.
            </p>
          ),
        },
        {
          heading: "Ownership",
          body: (
            <p>
              The source code, visual design, 3D studies, illustrations, written copy and brand marks on this site
              are © 2026 HVNF Studios. All rights reserved.
            </p>
          ),
        },
        {
          heading: "What you may do",
          body: (
            <>
              <p>You may view this site in a browser to evaluate the work of HVNF Studios.</p>
              <p>
                You may not copy, republish, resell, frame, scrape or reuse any part of it, including as a template,
                in client work, or as training data for software, without written permission from HVNF Studios.
              </p>
            </>
          ),
        },
        {
          heading: "Illustrative figures",
          body: (
            <p>
              Harvest lots, distillation temperatures, soil readings, extraction ratios and cure times are written to
              feel plausible. They describe no real product, farm or laboratory, and the site is provided as-is,
              without warranties of any kind.
            </p>
          ),
        },
        {
          heading: "Enquiries",
          body: <p>Licensing and project enquiries go to HVNF Studios through its official channels.</p>,
        },
      ]}
    />
  );
}
