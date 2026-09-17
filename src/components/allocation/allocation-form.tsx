"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";
import { FlaconSilhouette } from "./flacon-silhouette";
import { MonogramTag } from "./monogram-tag";
import { WaxSeal } from "./wax-seal";
import { VESSELS, type VesselId } from "./vessels";

export type AllocationDraft = {
  name: string;
  email: string;
  vessel: VesselId;
  monogram: string;
};

type Field = "name" | "email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MONOGRAM_MAX = 3;

/** Letters only, uppercase, at most three. */
export function cleanMonogram(raw: string): string {
  return raw
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, MONOGRAM_MAX);
}

function errorFor(field: Field, draft: AllocationDraft): string | null {
  if (field === "name") {
    return draft.name.trim().length === 0 ? "Please tell us the name to write in the ledger." : null;
  }
  const email = draft.email.trim();
  if (email.length === 0) return "Please add an email so the atelier can write back.";
  if (!EMAIL_PATTERN.test(email)) return "That email looks incomplete. Try the form name@example.com.";
  return null;
}

type AllocationFormProps = {
  draft: AllocationDraft;
  onChange: (patch: Partial<AllocationDraft>) => void;
  onSubmit: () => void;
  pending: boolean;
  note?: string;
};

const labelClass = "block font-sans text-[10px] uppercase tracking-[0.3em] text-rosemary/65";
const inputClass =
  "mt-2 block w-full min-w-0 rounded-none border-0 border-b border-hairline bg-transparent px-0 pb-2 pt-1 font-serif text-2xl font-light text-rosemary placeholder:text-rosemary/30 transition-colors duration-500 focus:border-brass focus:outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass aria-[invalid=true]:border-[#98422c]";

export function AllocationForm({ draft, onChange, onSubmit, pending, note }: AllocationFormProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false });

  const nameError = touched.name ? errorFor("name", draft) : null;
  const emailError = touched.email ? errorFor("email", draft) : null;
  const remaining = MONOGRAM_MAX - draft.monogram.length;

  const ids = {
    name: `${uid}-name`,
    nameError: `${uid}-name-error`,
    email: `${uid}-email`,
    emailError: `${uid}-email-error`,
    vesselLegend: `${uid}-vessel`,
    monogram: `${uid}-monogram`,
    monogramHint: `${uid}-monogram-hint`,
    status: `${uid}-status`,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setTouched({ name: true, email: true });
    const firstInvalid = (["name", "email"] as const).find((field) => errorFor(field, draft) !== null);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(ids[firstInvalid])}`)?.focus();
      return;
    }
    onSubmit();
  };

  const rise = (order: number) =>
    reduce
      ? {}
      : {
          initial: { y: 18 },
          animate: { y: 0 },
          transition: { duration: 1.1, ease: EASE_SILK, delay: 0.25 + order * 0.08 },
        };

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-10" aria-busy={pending}>
      {note ? (
        <motion.div {...rise(0)} className="border-y border-hairline bg-herb/70 px-5 py-4">
          <p className="font-serif text-lg italic leading-snug text-rosemary">
            <span className="mr-2 font-sans text-[10px] not-italic uppercase tracking-[0.3em] text-rosemary/65">
              Your composition:
            </span>
            {note}
          </p>
        </motion.div>
      ) : null}

      <motion.div {...rise(1)} className="grid gap-8 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor={ids.name} className={labelClass}>
            Name <span aria-hidden className="text-brass">*</span>
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            data-autofocus
            value={draft.name}
            disabled={pending}
            placeholder="Your full name"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? ids.nameError : undefined}
            onChange={(event) => onChange({ name: event.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className={inputClass}
          />
          <FieldError id={ids.nameError} message={nameError} />
        </div>
        <div className="min-w-0">
          <label htmlFor={ids.email} className={labelClass}>
            Email <span aria-hidden className="text-brass">*</span>
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={draft.email}
            disabled={pending}
            placeholder="name@example.com"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? ids.emailError : undefined}
            onChange={(event) => onChange({ email: event.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={inputClass}
          />
          <FieldError id={ids.emailError} message={emailError} />
        </div>
      </motion.div>

      <motion.fieldset {...rise(2)} className="min-w-0" disabled={pending}>
        <legend id={ids.vesselLegend} className={labelClass}>
          Flacon vessel
        </legend>
        <div role="radiogroup" aria-labelledby={ids.vesselLegend} className="mt-4 flex flex-col border-t border-hairline">
          {VESSELS.map((vessel) => {
            const checked = draft.vessel === vessel.id;
            const inputId = `${uid}-vessel-${vessel.id}`;
            return (
              <label
                key={vessel.id}
                htmlFor={inputId}
                className="group relative flex min-h-[88px] cursor-pointer items-center gap-5 border-b border-hairline px-3 py-4 transition-colors duration-700 hover:bg-herb/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brass"
              >
                <input
                  id={inputId}
                  type="radio"
                  name="vessel"
                  value={vessel.id}
                  checked={checked}
                  onChange={() => onChange({ vessel: vessel.id })}
                  className="peer sr-only"
                />
                {checked ? (
                  <motion.span
                    layoutId={`${uid}-vessel-frame`}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 border border-brass/80 bg-parchment"
                    transition={{ type: "spring", stiffness: 90, damping: 20, mass: 1 }}
                    style={{ zIndex: 0 }}
                  />
                ) : null}
                <span className="relative z-[1] flex h-16 w-12 shrink-0 items-end justify-center">
                  <FlaconSilhouette
                    vessel={vessel.id}
                    className="w-auto transition-transform duration-700 ease-out group-hover:-translate-y-0.5"
                    style={{ height: `${Math.round(vessel.scale * 100)}%` }}
                  />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-serif text-2xl font-light text-rosemary">{vessel.volume}</span>
                    <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-rosemary/65">{vessel.name}</span>
                  </span>
                  <span className="mt-1 block text-[13px] font-light leading-relaxed text-rosemary/70">{vessel.note}</span>
                </span>
                <span
                  aria-hidden
                  className="relative z-[1] grid h-5 w-5 shrink-0 place-items-center rounded-full border border-rosemary/40 transition-colors duration-500 peer-checked:border-brass"
                >
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full bg-terracotta"
                    initial={false}
                    animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: EASE_SILK }}
                  />
                </span>
              </label>
            );
          })}
        </div>
      </motion.fieldset>

      <motion.div {...rise(3)} className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <label htmlFor={ids.monogram} className={labelClass}>
            Monogram foil stamp
          </label>
          <input
            id={ids.monogram}
            name="monogram"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={MONOGRAM_MAX}
            value={draft.monogram}
            disabled={pending}
            placeholder="A E"
            aria-describedby={ids.monogramHint}
            onChange={(event) => onChange({ monogram: cleanMonogram(event.target.value) })}
            className={`${inputClass} tracking-[0.4em] uppercase`}
          />
          <p id={ids.monogramHint} className="mt-2 text-[12px] font-light leading-relaxed text-rosemary/65">
            Up to three letters, A to Z, pressed in brass foil.{" "}
            <span className="whitespace-nowrap text-rosemary">
              {remaining === 1 ? "1 letter" : `${remaining} letters`} remaining
            </span>
          </p>
        </div>
        <figure className="min-w-0">
          <MonogramTag letters={draft.monogram} className="mx-auto w-full max-w-[280px]" />
          <figcaption className="mt-1 text-center font-sans text-[9px] uppercase tracking-[0.3em] text-rosemary/50">
            Live preview · leather tag
          </figcaption>
        </figure>
      </motion.div>

      <motion.div {...rise(4)} className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={pending}
          aria-describedby={ids.status}
          className="group relative flex min-h-14 w-full items-center justify-center gap-4 overflow-hidden bg-rosemary px-6 py-4 font-sans text-[11px] uppercase tracking-[0.34em] text-linen transition-colors duration-700 hover:bg-moss disabled:cursor-progress"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-brass/40 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:left-[115%] group-hover:opacity-100"
          />
          <AnimatePresence mode="wait" initial={false}>
            {pending ? (
              <motion.span
                key="pending"
                className="relative flex items-center gap-4"
                initial={reduce ? false : { y: "60%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={reduce ? undefined : { y: "-60%", opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_SILK }}
              >
                <WaxSeal initial={draft.monogram} className="h-9 w-9" />
                Pressing the seal
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                className="relative"
                initial={reduce ? false : { y: "60%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={reduce ? undefined : { y: "-60%", opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_SILK }}
              >
                Enter my request
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <p id={ids.status} aria-live="polite" className="text-center text-[12px] font-light leading-relaxed text-rosemary/65">
          {pending
            ? "Pressing your request into the ledger…"
            : "No payment is taken. The atelier writes to you before anything is poured."}
        </p>
      </motion.div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          key={message}
          id={id}
          role="alert"
          className="mt-2 overflow-hidden text-[12px] leading-relaxed text-[#98422c]"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_SILK }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
