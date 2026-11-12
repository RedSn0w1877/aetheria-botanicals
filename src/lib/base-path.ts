// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

/**
 * Prefixes a raw site URL with the deploy basePath ("/aetheria-botanicals" in production, "" in dev),
 * set from next.config.ts `env`. Use it for URLs Next doesn't rewrite: the generated plate files
 * (withBase("/plates/ritual/forage.svg")) and <link rel=license>. Static imports and next/link already
 * carry the basePath, so don't wrap those.
 */
export const withBase = (p: string): string => (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + p;
