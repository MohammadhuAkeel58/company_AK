"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

type Phase = {
  n: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const phases: Phase[] = [
  {
    n: "01",
    title: "Discover",
    desc: "We map the terrain — goals, constraints, and the real problem under the brief.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Architect",
    desc: "A technical blueprint you can see and pressure-test before a line of code is written.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9.5h17M9.5 3.5v17" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Build",
    desc: "Tight iterations shipped continuously, with quality engineered in from the start.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m4 7 8 4 8-4M12 11v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Scale",
    desc: "Hardened, observable, handed over — or run by us as you grow.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 20V4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m7 15 3.5-3.5 3 3L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// The closing Contact / CTA — rendered inside the sliding handoff panel (and as
// a plain block for reduced-motion users), so the horizontal scroll lands the
// visitor directly on the final section.
function ContactCTA() {
  return (
    <>
      {/* ambient lime glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(225,255,81,0.1),transparent_70%)] blur-3xl" />

      <h2 className="relative font-heading text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
        Let&apos;s build something{" "}
        <span className="text-[#e1ff51]">impossible</span>.
      </h2>

      <p className="relative mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#eaf7ee]/60 lg:text-lg">
        Tell us where you&apos;re headed and what&apos;s in the way. We&apos;ll
        come back with a clear path — and the team to build it.
      </p>

      <div className="relative mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="mailto:hello@nexora.dev"
          className="group inline-flex items-center gap-2 rounded-full bg-[#e1ff51] px-7 py-3.5 text-sm font-semibold tracking-tight text-black transition-transform duration-200 hover:scale-[1.03]"
        >
          Start a project
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </a>
        <a
          href="mailto:hello@nexora.dev"
          className="inline-flex items-center gap-2 rounded-full border border-[#eaf7ee]/20 px-7 py-3.5 text-sm font-medium tracking-tight text-[#eaf7ee] transition-colors duration-200 hover:border-[#e1ff51]/50 hover:text-[#e1ff51]"
        >
          Book a call
        </a>
      </div>

      <div className="relative mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/45">
        <span className="text-[#eaf7ee]/70">hello@nexora.dev</span>
        <span className="hidden h-3 w-px bg-[#eaf7ee]/20 sm:block" />
        <span>REMOTE · WORLDWIDE</span>
        <span className="hidden h-3 w-px bg-[#eaf7ee]/20 sm:block" />
        <span>MON–FRI · 9–6</span>
      </div>
    </>
  );
}

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  // The horizontal card scroll occupies this fraction of the pinned travel; the
  // remainder slides the full-screen handoff panel in to bridge into Contact.
  const CARD_SPAN = 0.72;

  // Pin the stage and convert vertical scroll into horizontal travel across the
  // phase cards. Falls back to a plain grid when reduced motion is preferred.
  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!section || !wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }

    // Cache the expensive layout reads (offsetHeight / scrollWidth) — recompute
    // only on resize, never per frame, to avoid forcing a reflow every frame.
    const metrics = { total: 1, maxX: 0 };
    const measure = () => {
      metrics.total = Math.max(1, section.offsetHeight - window.innerHeight);
      metrics.maxX = Math.max(0, track.scrollWidth - wrap.clientWidth);
    };
    measure();

    // Drive the transform from a rAF loop (in step with Lenis' own frame), not
    // from scroll events — so the cards track the pinned heading without lag.
    // Reading only getBoundingClientRect + writing a compositor transform keeps
    // each frame cheap; we skip the write entirely when far off-screen.
    let raf = 0;
    let lastX = NaN;
    const render = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > -200 && rect.top < vh + 200) {
        const p = clamp(-rect.top / metrics.total, 0, 1);
        // Cards travel across the first CARD_SPAN of the scroll …
        const cardP = clamp(p / CARD_SPAN, 0, 1);
        const x = -(cardP * metrics.maxX);
        // … then the handoff panel slides in from the right over the rest.
        const panelP = clamp((p - CARD_SPAN) / (1 - CARD_SPAN), 0, 1);
        if (x !== lastX || panelP > 0) {
          lastX = x;
          track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
          if (fillRef.current)
            fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
          if (panelRef.current)
            panelRef.current.style.transform = `translate3d(${((1 - panelP) * 100).toFixed(3)}%,0,0)`;
          // Let the heading/cards stage recede slightly as the panel covers it.
          if (stageRef.current)
            stageRef.current.style.opacity = (1 - panelP * 0.65).toFixed(3);
        }
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onResize = () => {
      measure();
      lastX = NaN; // force a re-apply at the new scale
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className={
        reduced
          ? "relative border-t border-[#eaf7ee]/12 px-6 py-24 text-[#eaf7ee] sm:px-9 lg:px-12 lg:py-36"
          : "relative h-[420vh] border-t border-[#eaf7ee]/12 text-[#eaf7ee]"
      }
    >
      <div
        className={
          reduced
            ? ""
            : "sticky top-0 h-svh overflow-hidden"
        }
      >
       <div
        ref={stageRef}
        className={
          reduced ? "" : "flex h-full flex-col justify-center"
        }
       >
        {/* heading */}
        <div className="mx-auto w-full max-w-4xl px-6 text-center sm:px-9 lg:px-12">
          <h2 className="mx-auto font-heading text-balance text-3xl font-bold uppercase leading-[1.08] tracking-[-0.01em] sm:text-4xl lg:text-5xl">
            One protocol, from first call to{" "}
            <span className="text-[#e1ff51]">production</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-[#eaf7ee]/55 sm:text-base">
            A single, repeatable path that turns ambiguity into shipped,
            production-grade software — no guesswork, no wasted motion.
          </p>
          {!reduced && (
            <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#eaf7ee]/40">
              SCROLL <span aria-hidden>→</span>
            </span>
          )}
        </div>

        {/* phase cards — horizontal track on scroll, grid when reduced */}
        <div
          ref={wrapRef}
          className={
            reduced
              ? "mx-auto mt-12 w-full max-w-6xl px-6 sm:px-9 lg:px-12"
              : "mt-8 overflow-hidden lg:mt-10"
          }
        >
          <div
            ref={trackRef}
            className={
              reduced
                ? "grid grid-cols-1 border-l border-[#eaf7ee]/12 sm:grid-cols-2"
                : "flex will-change-transform"
            }
          >
            {phases.map((p, i) => (
              <article
                key={p.n}
                className={
                  "group relative flex shrink-0 flex-col items-center justify-center border-r border-[#eaf7ee]/12 px-8 py-10 text-center transition-colors duration-300 hover:bg-[#eaf7ee]/[0.03] sm:px-10 " +
                  (reduced
                    ? "min-h-[20rem] border-t"
                    : "h-[44vh] w-[85vw] sm:w-[56vw] lg:h-[46vh] lg:w-[27rem]") +
                  (!reduced && i === 0 ? " border-l" : "")
                }
              >
                {/* phase index */}
                <span className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.25em] text-[#eaf7ee]/30">
                  0{i + 1} / 0{phases.length}
                </span>

                {/* icon in filled disc */}
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7ee] text-[#04090c] transition-colors duration-300 group-hover:bg-[#e1ff51] [&>svg]:h-7 [&>svg]:w-7">
                  {p.icon}
                </span>

                <h3 className="mt-7 font-heading text-2xl font-bold uppercase tracking-tight lg:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-xs text-base leading-relaxed text-[#eaf7ee]/55">
                  {p.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* scroll-progress bar */}
        {!reduced && (
          <div className="mx-auto mt-10 w-full max-w-6xl px-6 sm:px-9 lg:px-12">
            <div className="relative h-px w-full overflow-hidden bg-[#eaf7ee]/12">
              <span
                ref={fillRef}
                className="absolute inset-y-0 left-0 block w-full origin-left bg-[#e1ff51]"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        )}
       </div>

        {/* handoff panel — slides in from the right as the cards finish, then
            hands the page off to the Contact section directly below. */}
        {!reduced && (
          <div
            ref={panelRef}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden border-l border-[#eaf7ee]/12 bg-[#04090c] px-6 text-center will-change-transform sm:px-9"
            style={{ transform: "translate3d(100%,0,0)" }}
          >
            <ContactCTA />
          </div>
        )}

        {/* reduced-motion: no sliding panel, so render the Contact CTA inline */}
        {reduced && (
          <div
            id="contact"
            className="relative mx-auto mt-20 flex max-w-3xl flex-col items-center border-t border-[#eaf7ee]/12 pt-20 text-center"
          >
            <ContactCTA />
          </div>
        )}
      </div>
    </section>
  );
}
