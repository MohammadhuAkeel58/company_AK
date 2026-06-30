"use client";

import { Fragment, useEffect, useRef } from "react";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const STATEMENT =
  "We are a digital engineering studio. We turn complexity into clarity — partnering with ambitious teams to design and build the software, systems and AI that move their business forward.";

// Words filled in lime instead of white as they brighten.
const isAccent = (w: string) => /complexity|clarity/i.test(w);

const words = STATEMENT.split(" ").map((w) => ({
  letters: w.split(""),
  accent: isAccent(w),
}));
const totalLetters = words.reduce((n, w) => n + w.letters.length, 0);

const DIM = 0.2; // resting opacity of an unfilled letter

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / Math.max(total, 1), 0, 1);
      // The fill completes in the first ~43% of the scroll, then About simply
      // holds — fully lit and pinned — so the whole statement is readable before
      // the next section rises up and overlays it.
      const cursor = clamp((p - 0.08) / 0.35, 0, 1) * (totalLetters + 8) - 4;
      for (let i = 0; i < refs.current.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        // ~4-letter soft edge so the boundary reads as a gradient, not a hard line
        const lp = reduce ? 1 : clamp((cursor - i) / 4, 0, 1);
        el.style.opacity = String(DIM + (1 - DIM) * lp);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  let gi = 0;
  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-0 h-[340vh] text-[#eaf7ee]"
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-6 sm:px-9 lg:px-12">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="font-heading text-[2.4rem] font-medium leading-[1.32] tracking-[-0.015em] sm:text-6xl sm:leading-[1.26] lg:text-[5.25rem] lg:leading-[1.22]">
            {words.map((w, wi) => (
              <Fragment key={wi}>
                <span className="inline-block">
                  {w.letters.map((ch) => {
                    const idx = gi++;
                    return (
                      <span
                        key={idx}
                        ref={(el) => {
                          refs.current[idx] = el;
                        }}
                        style={{
                          opacity: DIM,
                          color: w.accent ? "#e1ff51" : "#eaf7ee",
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
                {wi < words.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
