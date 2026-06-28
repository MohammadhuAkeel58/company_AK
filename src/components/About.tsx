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
      // the fill sweeps over the middle ~72% of the section's scroll
      const cursor = clamp((p - 0.08) / 0.72, 0, 1) * (totalLetters + 8) - 4;
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
      className="relative h-[220vh] text-[#eaf7ee]"
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-6 sm:px-9 lg:px-12">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="font-heading text-[1.9rem] font-medium leading-[1.38] tracking-[-0.01em] sm:text-5xl sm:leading-[1.32] lg:text-[4.25rem] lg:leading-[1.3]">
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
