// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import type { CSSProperties } from "react";
import { ChapterHead } from "@/components/book/chapter-head";
import { MarginNote } from "@/components/book/margin-note";
import { PlateDrawing } from "@/components/ritual/plate-drawing";
import { RitualProgress } from "@/components/ritual/ritual-progress";
import { SprayFlacon } from "@/components/ritual/spray-flacon";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import { RITUAL_PHASES, type RitualPhaseId } from "@/lib/ritual-phases";
import s from "./ritual.module.css";

/** The figures that change as a plate draws: HTML overlays, counted in CSS (ritual.module.css). */
const COUNTERS: Record<RitualPhaseId, readonly string[]> = {
  forage: [s.clock],
  press: [],
  steep: [s.temp, s.day],
  filter: [s.ml],
};

type Vars = CSSProperties & Record<`--${string}`, number>;

/**
 * IV · The ritual. One server-rendered DOM for every reader: four steps and a stage of four plates.
 * How it reads (interleaved and complete, or a sticky plate drawn by the scroll) is decided in CSS.
 * The plates are static files; PlateDrawing swaps one inline only when it can be scrubbed, and
 * RitualProgress stands in for the scroll timeline where a browser lacks it. The chapter closes on
 * the finished flacon, which the reader can hold to spray (SprayFlacon).
 */
export function RitualChapter() {
  const last = RITUAL_PHASES.length - 1;
  return (
    <section id="ritual" aria-labelledby="ritual-title" className="bk-chapter">
      <ChapterHead
        id="ritual"
        numeral="IV"
        title="Four slow steps from field to flacon"
        lead="Every plant is picked by hand at dawn, frozen within the hour, steeped cold for six months, then filtered by gravity alone. Nothing is heated and nothing is rushed, so the scent keeps the shape it had in the field."
      />
      <div className={`bk-book ${s.rt}`} data-rt="">
        <div className={s.steps} data-rt-steps="">
          {RITUAL_PHASES.map((phase, i) => (
            <article
              key={phase.id}
              className={s.step}
              style={{ "--row": i + 1 } as Vars}
              aria-labelledby={`ritual-step-${phase.id}`}
            >
              <span className={s.stepNumeral} aria-hidden="true">
                {phase.numeral}
              </span>
              <p className={`bk-label ${s.place}`}>{phase.place}</p>
              <h3 id={`ritual-step-${phase.id}`} className={s.stepTitle}>
                {phase.title}
              </h3>
              <p className={s.stepBody}>{phase.description}</p>
              <p className={s.technique}>{phase.technique}</p>
              <div className={s.notes}>
                {phase.notes.map((note) => (
                  <MarginNote key={note.figure} figure={note.figure} side="left">
                    {note.text}
                  </MarginNote>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className={`bk-gutter ${s.gutter}`} aria-hidden="true" />
        <div className={s.stage} data-rt-stage="">
          {RITUAL_PHASES.map((phase, i) => (
            <figure
              key={phase.id}
              className={s.plate}
              style={{ "--i": i, "--row": i + 1 } as Vars}
              // Spread, not `={cond ? "" : undefined}`: an undefined prop still costs bytes in the RSC payload.
              {...(i === 0 && { "data-first": "" })}
              {...(i === last && { "data-last": "" })}
            >
              <div className={`bk-paper ${s.draw}`}>
                <PlateDrawing file={`${phase.id}.svg`} alt={phase.plateAlt} order={i} />
                {COUNTERS[phase.id].map((counter, k) => (
                  // A fixed list, so the index is a stable key (and a shorter one in the payload).
                  <span key={k} className={`${s.counter} ${counter}`} aria-hidden="true" />
                ))}
              </div>
              {/* One line: the plate's name, then its imprint (the figure's one watermark). */}
              <figcaption className={s.caption}>
                <p className={s.captionText}>
                  {phase.plate.replace(" — ", ", ")}{" "}
                  <span className="bk-imprint">· drawn for Aetheria · {COPYRIGHT_MARK} · do not redistribute</span>
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <RitualProgress />
      </div>
      <SprayFlacon />
    </section>
  );
}
