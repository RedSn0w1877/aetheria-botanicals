// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once, client-side only. ScrollTrigger touches `window` on import of its internals.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Phone address bars collapse mid-scroll; recalculating every pin for that causes jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP };
