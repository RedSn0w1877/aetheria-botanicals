// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Notes on privacy",
  description: "How the Aetheria Botanicals concept site by HVNF Studios handles information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Notes on privacy"
      revised="31 October 2026"
      clauses={[
        {
          heading: "Nothing is collected",
          body: (
            <p>
              The commission letter, monogram tag and scent composer run entirely in your browser. What you type is
              never sent to a server, stored in a database or shared with anyone. Reload the page and it is gone.
            </p>
          ),
        },
        {
          heading: "No tracking",
          body: <p>This site sets no cookies and keeps nothing in your browser’s storage.</p>,
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
          heading: "Fonts and images",
          body: (
            <p>
              Typefaces and images are bundled with the site, so no request is made to any other service while you
              browse.
            </p>
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
