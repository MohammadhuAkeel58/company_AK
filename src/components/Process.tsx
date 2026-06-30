"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const phases = [
  {
    n: "01",
    title: "Discover",
    desc: "We map the terrain — goals, constraints, and the real problem under the brief.",
  },
  {
    n: "02",
    title: "Architect",
    desc: "A technical blueprint you can see and pressure-test before a line of code is written.",
  },
  {
    n: "03",
    title: "Build",
    desc: "Tight iterations shipped continuously, with quality engineered in from the start.",
  },
  {
    n: "04",
    title: "Scale",
    desc: "Hardened, observable, handed over — or run by us as you grow.",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);

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
        const x = -(p * metrics.maxX);
        if (x !== lastX) {
          lastX = x;
          track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
          if (fillRef.current)
            fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
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
          : "relative h-[340vh] border-t border-[#eaf7ee]/12 text-[#eaf7ee]"
      }
    >
      <style>{`
        .nx-phase-n {
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(234,247,238,0.4);
        }
      `}</style>

      <div
        className={
          reduced
            ? ""
            : "sticky top-0 flex h-svh flex-col justify-center overflow-hidden"
        }
      >
        {/* heading */}
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-9 lg:px-12">
          <div className="flex items-end justify-between gap-6">
            <h2 className="max-w-2xl font-heading text-balance text-4xl leading-[1.22] tracking-[-0.015em] sm:text-5xl lg:text-6xl">
              One protocol, from first call to{" "}
              <span className="text-[#e1ff51]">production</span>.
            </h2>
            {!reduced && (
              <span className="hidden shrink-0 items-center gap-2 pb-2 font-mono text-[10px] tracking-[0.25em] text-[#eaf7ee]/40 lg:flex">
                SCROLL <span aria-hidden>→</span>
              </span>
            )}
          </div>
        </div>

        {/* phase cards — horizontal track on scroll, grid when reduced */}
        <div
          ref={wrapRef}
          className={
            reduced
              ? "mx-auto mt-12 w-full max-w-6xl px-6 sm:px-9 lg:px-12"
              : "mt-10 overflow-hidden lg:mt-14"
          }
        >
          <div
            ref={trackRef}
            className={
              reduced
                ? "grid gap-6 sm:grid-cols-2"
                : "flex gap-5 px-6 will-change-transform sm:px-9 lg:gap-6 lg:px-12"
            }
          >
            {phases.map((p, i) => (
              <article
                key={p.n}
                className={
                  "group relative flex shrink-0 flex-col justify-between rounded-2xl border border-[#eaf7ee]/12 bg-[#06090c]/70 p-8 transition-colors duration-300 hover:border-[#e1ff51]/40 lg:p-10 " +
                  (reduced
                    ? "min-h-[16rem]"
                    : "h-[52vh] w-[82vw] sm:w-[56vw] lg:h-[54vh] lg:w-[33rem]")
                }
              >
                <div className="flex items-start justify-between">
                  <span className="nx-phase-n text-7xl font-bold tracking-tight lg:text-8xl">
                    {p.n}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#eaf7ee]/35">
                    0{i + 1} / 0{phases.length}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#e1ff51]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e1ff51] shadow-[0_0_12px_2px_rgba(225,255,81,0.5)]" />
                    PHASE
                  </span>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-base leading-relaxed text-[#eaf7ee]/55">
                    {p.desc}
                  </p>
                </div>
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
    </section>
  );
}
