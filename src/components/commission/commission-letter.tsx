"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { MarginNote } from "@/components/book/margin-note";
import { letterComposition } from "@/components/blender/formula-text";
import { useComposition } from "@/lib/formula-store";
import { SAMPLE_SET } from "@/lib/offer";
import s from "./commission.module.css";
import { ledgerReference } from "./ledger-reference";
import { MonogramTag } from "./monogram-tag";
import { ReplyCard, type Reply } from "./reply-card";
import { DEFAULT_VESSEL, VESSELS, type VesselId } from "./vessels";
import { WaxSeal } from "./wax-seal";

export type LetterDraft = {
  name: string;
  email: string;
  vessel: VesselId;
  monogram: string;
};

type Field = "name" | "email";
type Phase = "writing" | "sealing" | "sent";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MONOGRAM_MAX = 3;
const EMPTY_DRAFT: LetterDraft = { name: "", email: "", vessel: DEFAULT_VESSEL, monogram: "" };
const UNTOUCHED: Record<Field, boolean> = { name: false, email: false };
/** Only a safety net: the press normally ends in animationend (also at 0.01ms under reduced motion). */
const PRESS_FALLBACK_MS = 900;

/** Letters only, uppercase, at most three. */
export function cleanMonogram(raw: string): string {
  return raw
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, MONOGRAM_MAX);
}

function errorFor(field: Field, draft: LetterDraft): string | null {
  if (field === "name") {
    return draft.name.trim().length === 0 ? "Please write the name we should use." : null;
  }
  const email = draft.email.trim();
  if (email.length === 0) return "Please add an email so we can write back.";
  if (!EMAIL_PATTERN.test(email)) return "That email looks unfinished. Try the form name@example.com.";
  return null;
}

/**
 * Chapter V's island: the commission letter. A fill-in-the-blanks letter on a parchment sheet, with the
 * margin note on its left and the brass tag on its right.
 *
 * The composition blank follows the composer through useComposition(), which only changes when the note
 * trio does, so slider drags never re-render the letter. Validation is the old allocation form's: errors
 * appear once a blank has been left or the letter sent, and sending focuses the first invalid blank.
 * A valid letter presses the wax seal (a 380ms CSS animation) and, when it ends, swaps the sheet for
 * the atelier's reply, whose heading takes focus. The form's method is "dialog", so before hydration or
 * without JavaScript sending does nothing at all: nothing typed can end up in a URL.
 */
export function CommissionLetter() {
  const composition = useComposition();
  // One letter per page, hydrated as its own root (book/islands.tsx): fixed ids, not useId.
  const uid = "letter";
  const [draft, setDraft] = useState<LetterDraft>(EMPTY_DRAFT);
  const [touched, setTouched] = useState<Record<Field, boolean>>(UNTOUCHED);
  const [phase, setPhase] = useState<Phase>("writing");
  const [reply, setReply] = useState<Reply | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const fallbackRef = useRef<number | null>(null);
  const focusNameOnMount = useRef(false);

  const ids = {
    nameError: `${uid}-name-error`,
    emailError: `${uid}-email-error`,
    sealLabel: `${uid}-seal`,
    sealNote: `${uid}-seal-note`,
  };

  const nameError = touched.name ? errorFor("name", draft) : null;
  const emailError = touched.email ? errorFor("email", draft) : null;
  const composed = letterComposition(composition);
  const writing = phase === "writing";

  // A pending fallback must not outlive the letter.
  useEffect(
    () => () => {
      if (fallbackRef.current !== null) window.clearTimeout(fallbackRef.current);
    },
    [],
  );

  // After "Write another letter", the fresh sheet's first blank takes focus.
  const nameInput = useCallback((node: HTMLInputElement | null) => {
    nameRef.current = node;
    if (node && focusNameOnMount.current) {
      focusNameOnMount.current = false;
      node.focus();
    }
  }, []);

  const patch = (next: Partial<LetterDraft>) => setDraft((current) => ({ ...current, ...next }));

  const deliver = () => {
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    setPhase((current) => (current === "sealing" ? "sent" : current));
  };

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!writing) return;
    setTouched({ name: true, email: true });
    const firstInvalid = (["name", "email"] as const).find((field) => errorFor(field, draft) !== null);
    if (firstInvalid) {
      (firstInvalid === "name" ? nameRef : emailRef).current?.focus();
      return;
    }
    const name = draft.name.trim();
    const email = draft.email.trim();
    setReply({
      name,
      email,
      monogram: draft.monogram,
      vessel: draft.vessel,
      composition: composed,
      reference: ledgerReference({
        name,
        email,
        vessel: draft.vessel,
        monogram: draft.monogram,
        number: composition.number,
      }),
    });
    setPhase("sealing");
    fallbackRef.current = window.setTimeout(deliver, PRESS_FALLBACK_MS);
  };

  const writeAgain = () => {
    focusNameOnMount.current = true;
    setDraft(EMPTY_DRAFT);
    setTouched(UNTOUCHED);
    setReply(null);
    setPhase("writing");
  };

  return (
    <div className={`bk-book ${s.desk}`}>
      <MarginNote figure="Two weeks" side="left" className={s.note}>
        to pour and letter your vials by hand. The set of three is {SAMPLE_SET.price}, paid only once we write back.
      </MarginNote>

      <div className={s.letterColumn}>
        {phase === "sent" && reply ? (
          <ReplyCard reply={reply} onWriteAgain={writeAgain} />
        ) : (
          <>
            <form
              className={`bk-paper ${s.sheet}`}
              method="dialog"
              noValidate
              onSubmit={send}
              aria-label="Your letter to the atelier"
            >
              <p>Dear Aetheria,</p>
              <p>
                Please pour three small vials of{" "}
                {/* aria-live off: the composer already announces each change; the letter just keeps up. */}
                <output className={s.composition} data-composition="" aria-live="off">
                  {composed}
                </output>{" "}
                <span className={s.change}>
                  (
                  <a className="bk-link" href="#compose">
                    change it
                  </a>
                  )
                </span>{" "}
                for me to wear for a week. If it suits me, I’ll ask for a{" "}
                <span role="radiogroup" aria-label="Flacon size" className={s.sizes}>
                  {VESSELS.map((vessel, i) => (
                    <Fragment key={vessel.id}>
                      {i > 0 ? (
                        <span className={s.sizeSep} aria-hidden="true">
                          {" · "}
                        </span>
                      ) : null}
                      <label className={s.size}>
                        <input
                          type="radio"
                          className="bk-sr"
                          name={`${uid}-size`}
                          value={vessel.id}
                          checked={draft.vessel === vessel.id}
                          onChange={() => patch({ vessel: vessel.id })}
                        />
                        {vessel.id}
                        <span className="bk-sr"> ml</span>
                      </label>
                    </Fragment>
                  ))}
                </span>{" "}
                <span aria-hidden="true">ml</span> flacon of my own.
              </p>
              <p>
                My name is{" "}
                <input
                  ref={nameInput}
                  className={s.blank}
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="your name"
                  aria-label="your name"
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? ids.nameError : undefined}
                  readOnly={!writing}
                  value={draft.name}
                  onChange={(event) => patch({ name: event.target.value })}
                  onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                />{" "}
                and you can write to me at{" "}
                <input
                  ref={emailRef}
                  className={`${s.blank} ${s.blankEmail}`}
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="your email"
                  aria-label="your email"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? ids.emailError : undefined}
                  readOnly={!writing}
                  value={draft.email}
                  onChange={(event) => patch({ email: event.target.value })}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                />
                .
              </p>
              <p>
                Please letter the tag with{" "}
                <input
                  className={`${s.blank} ${s.blankInitials}`}
                  type="text"
                  name="initials"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={MONOGRAM_MAX}
                  placeholder="initials"
                  aria-label="initials for the brass tag, up to three letters"
                  readOnly={!writing}
                  value={draft.monogram}
                  onChange={(event) => patch({ monogram: cleanMonogram(event.target.value) })}
                />
                .
              </p>
              <p className={s.thanks}>With thanks,</p>

              <div className={s.sealRow}>
                <button
                  type="submit"
                  className={s.seal}
                  aria-labelledby={ids.sealLabel}
                  aria-describedby={ids.sealNote}
                  onAnimationEnd={deliver}
                >
                  <WaxSeal
                    initial={draft.monogram}
                    className={phase === "sealing" ? `${s.wax} ${s.pressed}` : s.wax}
                  />
                  <span className={s.sealText}>
                    <span id={ids.sealLabel} className={s.sealLabel}>
                      Seal and send
                    </span>
                    <span id={ids.sealNote} className={s.sealNote}>
                      a portfolio demo: nothing you write leaves your browser
                    </span>
                  </span>
                </button>
              </div>
            </form>

            <noscript>
              <p className={s.noscript}>Sealing the letter needs JavaScript.</p>
            </noscript>

            <div className={s.errors} role="alert">
              {nameError ? <p id={ids.nameError}>{nameError}</p> : null}
              {emailError ? <p id={ids.emailError}>{emailError}</p> : null}
            </div>
          </>
        )}
      </div>

      <MonogramTag letters={draft.monogram} className={s.tagSlot} />
    </div>
  );
}
