"use client";

import { useInView } from "@/lib/useInView";

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
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-[#eaf7ee]/12 px-6 py-24 text-[#eaf7ee] sm:px-9 lg:px-12 lg:py-36"
    >
      <style>{`
        .nx-phase-n {
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(234,247,238,0.45);
        }
      `}</style>

      <div ref={ref} className="relative mx-auto max-w-6xl">
        <div
          className="max-w-2xl transition-all duration-700 motion-reduce:transition-none"
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(20px)" }}
        >
          <h2 className="font-heading text-balance text-3xl leading-[1.3] tracking-[-0.01em] sm:text-4xl lg:text-5xl">
            One protocol, from first call to{" "}
            <span className="text-[#e1ff51]">production</span>.
          </h2>
        </div>

        {/* connector line behind the phase numbers (desktop) */}
        <div className="relative mt-16 lg:mt-24">
          <div className="pointer-events-none absolute inset-x-0 top-[1.7rem] hidden h-px bg-gradient-to-r from-[#e1ff51]/50 via-[#eaf7ee]/15 to-transparent lg:block" />

          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-4">
            {phases.map((p, i) => (
              <div
                key={p.n}
                className="relative transition-all duration-700 motion-reduce:transition-none"
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "none" : "translateY(24px)",
                  transitionDelay: `${160 + i * 90}ms`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="relative z-10 block h-3 w-3 shrink-0 rounded-full bg-[#e1ff51] shadow-[0_0_14px_2px_rgba(225,255,81,0.5)]" />
                  <span className="nx-phase-n text-3xl font-bold tracking-tight lg:text-4xl">
                    {p.n}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#eaf7ee]/55">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
