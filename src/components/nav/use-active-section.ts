// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useState } from "react";

/**
 * Which linked section currently sits under the reading line (a thin band just above
 * the middle of the viewport). Sections that aren't linked in the nav, like the hero
 * or the allocation folio, clear the indicator when they cross that line.
 *
 * State only changes inside the IntersectionObserver callback, never during render,
 * and it starts as `null` on both server and client, so hydration is identical.
 */
export function useActiveSection(linkedIds: readonly string[], otherIds: readonly string[] = []): string | null {
  const [active, setActive] = useState<string | null>(null);
  const linkedKey = linkedIds.join("|");
  const otherKey = otherIds.join("|");

  useEffect(() => {
    const linked = linkedKey ? linkedKey.split("|") : [];
    const others = otherKey ? otherKey.split("|") : [];
    const nodes = [...linked, ...others]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        const id = hit.target.id;
        setActive(linked.includes(id) ? id : null);
      },
      { rootMargin: "-42% 0px -56% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [linkedKey, otherKey]);

  return active;
}
