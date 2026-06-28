"use client";

import { useInView } from "@/lib/useInView";
import { Component as InfiniteSlider } from "@/components/ui/argent-loop-infinite-slider";

export default function Work() {
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <section
      id="work"
      className="relative overflow-hidden border-t border-[#eaf7ee]/12 py-24 text-[#eaf7ee] lg:py-36"
    >
      <div ref={ref} className="mx-auto max-w-6xl px-6 sm:px-9 lg:px-12">
        {/* heading — matches the other sections' horizontal style */}
        <div
          className="max-w-3xl transition-all duration-700 motion-reduce:transition-none"
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(20px)" }}
        >
          <h2 className="font-heading text-balance text-3xl leading-[1.3] tracking-[-0.01em] sm:text-4xl lg:text-5xl">
            Selected work we&apos;ve designed, built and{" "}
            <span className="text-[#e1ff51]">shipped</span>.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#eaf7ee]/55">
            Plays automatically — scroll, drag, or use the controls to move
            through the work.
          </p>
        </div>
      </div>

      {/* immersive infinite slider — scoped to its own frame so it never
          hijacks the page's smooth scroll */}
      <div
        className="mx-auto mt-12 max-w-6xl px-6 transition-all duration-700 motion-reduce:transition-none sm:px-9 lg:mt-16 lg:px-12"
        style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(34px)" }}
      >
        <div className="h-[78vh] w-full overflow-hidden rounded-2xl border border-[#eaf7ee]/12">
          <InfiniteSlider />
        </div>
      </div>
    </section>
  );
}
