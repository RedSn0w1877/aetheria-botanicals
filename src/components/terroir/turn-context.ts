// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { createContext, useContext } from "react";

/**
 * How many times the visitor has turned the page to another lot, and which way.
 * Entrance animations only play once `turns > 0`, so the first server render is
 * always the settled, fully readable page.
 */
export type TurnState = { turns: number; direction: 1 | -1 };

export const TurnContext = createContext<TurnState>({ turns: 0, direction: 1 });

export const useTurn = () => useContext(TurnContext);
