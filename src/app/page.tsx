// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { SiteNav } from "@/components/SiteNav";
import { ApothecaryHero } from "@/components/ApothecaryHero";
import { CompoundBlender } from "@/components/CompoundBlender";
import { TerroirInspector } from "@/components/TerroirInspector";
import { ExtractionRitual } from "@/components/ExtractionRitual";
import { AllocationDrawer } from "@/components/AllocationDrawer";
import { MonographFooter } from "@/components/MonographFooter";

export default function AtelierPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-rosemary focus:px-5 focus:py-3 focus:font-sans focus:text-[11px] focus:uppercase focus:tracking-[0.3em] focus:text-linen"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <ApothecaryHero />
        <CompoundBlender />
        <TerroirInspector />
        <ExtractionRitual />
        <AllocationDrawer />
      </main>
      <MonographFooter />
    </>
  );
}
