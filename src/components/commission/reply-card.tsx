"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useRef } from "react";
import Link from "next/link";
import s from "./commission.module.css";
import { FlaconSilhouette } from "./flacon-silhouette";
import { spacedMonogram } from "./monogram-tag";
import type { VesselId } from "./vessels";

/** Everything the reply needs, frozen at the moment the letter was sealed. */
export type Reply = {
  name: string;
  email: string;
  monogram: string;
  vessel: VesselId;
  /** "Composition 013 — yuzu, rose & moss", or the house scent. */
  composition: string;
  /** AE-013-K7QD */
  reference: string;
};

/**
 * The atelier's answer, laid on the linen where the letter was: a parchment card turned a degree off
 * square. Its heading takes focus as it appears, so a screen reader hears the reply at once, and the
 * vessel inks itself in on arrival ([data-ink-now]; complete under reduced motion and on lite).
 */
export function ReplyCard({ reply, onWriteAgain }: { reply: Reply; onWriteAgain: () => void }) {
  const headingId = "letter-reply-title";
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <article className={`bk-paper ${s.reply}`} aria-labelledby={headingId}>
      <div className={s.replyText}>
        <p className="bk-label">from the atelier, Grasse</p>
        <h3 id={headingId} ref={headingRef} tabIndex={-1} className={s.replyTitle}>
          Dear {reply.name},
        </h3>
        <p className={s.replyBody}>
          Thank you for your letter. We’ll pour three small vials of {reply.composition} and{" "}
          {reply.monogram ? `letter your tag ${spacedMonogram(reply.monogram)}` : "leave your tag plain"}. They take
          about two weeks; we’ll write to <span className={s.replyEmail}>{reply.email}</span> before anything is sent.
        </p>
        <p className={s.replyReference}>
          Your reference is{" "}
          <span data-reference="" className="bk-tabular">
            {reply.reference}
          </span>
          .
        </p>
        <p className={s.replySignoff}>— the atelier</p>
      </div>
      <div className={s.replyFlacon} data-ink-now="">
        <FlaconSilhouette vessel={reply.vessel} className={s.replyFlaconSvg} />
      </div>
      <div className={s.replyFoot}>
        <p className={s.replyHonest}>
          A portfolio demo: nothing you wrote left your browser.{" "}
          <Link href="/legal/privacy/" className="bk-link" prefetch={false}>
            Read the notes on privacy
          </Link>
        </p>
        <button type="button" className={s.again} onClick={onWriteAgain}>
          Write another letter
        </button>
      </div>
    </article>
  );
}
