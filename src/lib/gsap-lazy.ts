// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef, type DependencyList } from "react";

type GSAPModule = typeof import("@/lib/gsap");

let gsapPromise: Promise<GSAPModule> | null = null;

/**
 * Lazy-load GSAP + ScrollTrigger only when a component that uses scroll animations
 * mounts. This keeps ~80KB of GSAP out of the initial bundle for components that
 * don't actually need scroll effects.
 */
function loadGSAP(): Promise<GSAPModule> {
  if (!gsapPromise) {
    gsapPromise = import("@/lib/gsap");
  }
  return gsapPromise;
}

type GSAPContext = ReturnType<GSAPModule["gsap"]["context"]>;
type SetupFunction = (gsap: GSAPModule["gsap"], ScrollTrigger: GSAPModule["ScrollTrigger"]) => void | (() => void);

interface UseScrollAnimationOptions {
  scope?: React.RefObject<HTMLElement>;
  dependencies?: DependencyList;
}

/**
 * Hook that lazy-loads GSAP and runs scroll-based animations. Use this in place
 * of `useGSAP` for components that only need GSAP for scroll effects.
 *
 * @example
 * useScrollAnimation((gsap, ScrollTrigger) => {
 *   gsap.to(element, { scrollTrigger: { ... } });
 * }, { scope: sectionRef });
 */
export function useScrollAnimation(
  setup: SetupFunction,
  options: UseScrollAnimationOptions = {}
) {
  const { scope, dependencies = [] } = options;
  const contextRef = useRef<GSAPContext | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    loadGSAP().then((module) => {
      if (!mounted) return;

      const { gsap, ScrollTrigger } = module;

      if (scope?.current) {
        contextRef.current = gsap.context(() => {
          cleanupRef.current = setup(gsap, ScrollTrigger) ?? null;
        }, scope.current);
      } else {
        cleanupRef.current = setup(gsap, ScrollTrigger) ?? null;
      }
    });

    return () => {
      mounted = false;
      contextRef.current?.revert();
      contextRef.current = null;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
