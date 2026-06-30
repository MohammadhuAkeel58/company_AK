"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/lib/useInView";
import { Component as InfiniteSlider } from "@/components/ui/argent-loop-infinite-slider";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export default function Work() {
  const { ref, shown } = useInView<HTMLDivElement>();
  const colRef = useRef<HTMLDivElement>(null); // stable (untransformed) — measured
  const frameRef = useRef<HTMLDivElement>(null); // transformed — parallax + clip

  // The heading is pinned (sticky) while the slider frame glides past it with a
  // gentle parallax lag and a bottom-up clip/fade reveal as it enters.
  useEffect(() => {
    const col = colRef.current;
    const frame = frameRef.current;
    if (!col || !frame) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      frame.style.transform = "none";
      frame.style.clipPath = "none";
      frame.style.opacity = "1";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = col.getBoundingClientRect();
      // travel: 0 when the column's top sits at the viewport bottom, 1 once its
      // bottom has risen to the viewport top.
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      // parallax lag: the frame drifts downward as you scroll, so it appears to
      // move a touch slower than the page against the fixed heading.
      frame.style.transform = `translateY(${((p - 0.5) * 120).toFixed(1)}px)`;
      // entry reveal — clip opens from the bottom edge and fades in.
      const reveal = clamp((vh - r.top) / (0.62 * vh), 0, 1);
      const e = 1 - Math.pow(1 - reveal, 3);
      frame.style.clipPath = `inset(0% 0% ${((1 - e) * 16).toFixed(2)}% 0% round 1rem)`;
      frame.style.opacity = (0.18 + 0.82 * e).toFixed(3);
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

  return (
    <section
      id="work"
      className="relative overflow-clip border-t border-[#eaf7ee]/12 py-24 text-[#eaf7ee] lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-9 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* heading column — pinned on desktop while the frame scrolls past */}
          <div
            ref={ref}
            className="lg:col-span-4 lg:sticky lg:top-[22vh] lg:self-start"
          >
            <div
              className="transition-all duration-700 motion-reduce:transition-none"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(20px)",
              }}
            >
              <h2 className="font-heading text-balance text-4xl leading-[1.22] tracking-[-0.015em] sm:text-5xl lg:text-6xl">
                Selected work we&apos;ve designed, built and{" "}
                <span className="text-[#e1ff51]">shipped</span>.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#eaf7ee]/55">
                Plays automatically — scroll, drag, or use the controls to move
                through the work.
              </p>
            </div>
          </div>

          {/* frame column — scrolls past the pinned heading with parallax */}
          <div ref={colRef} className="lg:col-span-8">
            <div
              ref={frameRef}
              className="h-[78vh] w-full overflow-hidden border border-[#eaf7ee]/12 will-change-transform"
              style={{ borderRadius: "1rem" }}
            >
              <InfiniteSlider />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
