"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect } from "react";
import { COPYRIGHT_LINE } from "@/lib/copyright";

const MIN_QUOTED_CHARS = 140;

/**
 * Leaves a signature in the console and appends the copyright line when someone
 * copies a long passage. Short copies (an address, a name) are left alone. Renders nothing.
 */
export function AttributionSentinel() {
  useEffect(() => {
    console.info(`%c${COPYRIGHT_LINE}`, "font: italic 13px Georgia, serif; color: #7b5a26;");

    const handleCopy = (event: ClipboardEvent) => {
      const focused = document.activeElement;
      if (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement) return;
      const selected = window.getSelection()?.toString() ?? "";
      if (selected.trim().length < MIN_QUOTED_CHARS || !event.clipboardData) return;
      event.clipboardData.setData("text/plain", `${selected}\n\n— ${COPYRIGHT_LINE}`);
      event.preventDefault();
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  return null;
}
