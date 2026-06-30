"use client";

import { useInView } from "@/lib/useInView";

type Capability = {
  domain: string;
  name: string;
  spec: string;
};

// Classified by engineering domain — the tag carries real information (the
// discipline), not decorative numbering.
const capabilities: Capability[] = [
  {
    domain: "ENGINEERING",
    name: "Web & Product",
    spec: "Fast, resilient apps and platforms — architected on fundamentals, not trends.",
  },
  {
    domain: "INTERFACE",
    name: "Design & UX",
    spec: "Interfaces shaped around real behavior. Intuitive, fluid, unmistakably yours.",
  },
  {
    domain: "INTELLIGENCE",
    name: "AI & Automation",
    spec: "Models, agents and pipelines that remove the work that slows you down.",
  },
  {
    domain: "INFRASTRUCTURE",
    name: "Cloud & DevOps",
    spec: "Observable platforms that scale long before the load ever arrives.",
  },
  {
    domain: "DATA",
    name: "Data & Analytics",
    spec: "Signal pulled from noise — pipelines and dashboards that drive decisions.",
  },
  {
    domain: "DIRECTION",
    name: "Strategy",
    spec: "Roadmaps and architecture that align the technology with the outcome.",
  },
];

export default function Services() {
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <section
      id="services"
      className="relative z-30 -mt-[100vh] overflow-hidden rounded-t-[2.5rem] border-t border-[#eaf7ee]/12 bg-[#04090c] px-6 py-24 text-[#eaf7ee] shadow-[0_-30px_70px_-20px_rgba(0,0,0,0.65)] sm:px-9 lg:px-12 lg:py-36"
    >
      <style>{`
        .svc-name {
          color: transparent;
          -webkit-text-stroke: 1.2px rgba(234,247,238,0.82);
          transition: color .35s ease, -webkit-text-stroke-color .35s ease, transform .45s cubic-bezier(.2,.7,.2,1);
        }
        .svc-row:hover .svc-name,
        .svc-row:focus-within .svc-name {
          color: #e1ff51;
          -webkit-text-stroke-color: #e1ff51;
        }
        @media (min-width: 1024px) {
          .svc-row:hover .svc-name,
          .svc-row:focus-within .svc-name { transform: translateX(0.5rem); }
        }
        .svc-sweep { transform: scaleX(0); transform-origin: left; transition: transform .5s cubic-bezier(.2,.7,.2,1); }
        .svc-row:hover .svc-sweep, .svc-row:focus-within .svc-sweep { transform: scaleX(1); }
        @media (prefers-reduced-motion: reduce) {
          .svc-name, .svc-sweep, .svc-reveal { transition: none !important; }
        }
      `}</style>

      <div ref={ref} className="relative mx-auto max-w-6xl">
        {/* eyebrow */}
        <h2
          className="max-w-4xl font-heading text-balance text-4xl leading-[1.22] tracking-[-0.015em] transition-all duration-700 motion-reduce:transition-none sm:text-5xl lg:text-6xl"
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(20px)" }}
        >
          Every discipline it takes to turn complexity into{" "}
          <span className="text-[#e1ff51]">working software</span>.
        </h2>

        {/* ledger */}
        <div className="mt-14 lg:mt-20">
          {capabilities.map((c, i) => (
            <div
              key={c.name}
              tabIndex={0}
              className="svc-row group relative block border-t border-[#eaf7ee]/12 py-6 outline-none transition-all duration-700 last:border-b motion-reduce:transition-none lg:py-7"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(26px)",
                transitionDelay: `${160 + i * 70}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-[#eaf7ee]/40 transition-colors group-hover:text-[#e1ff51] group-focus-within:text-[#e1ff51]">
                    {c.domain}
                  </span>
                  <h3 className="svc-name mt-2.5 text-[2.6rem] font-bold leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]">
                    {c.name}
                  </h3>
                  {/* spec: always visible on mobile, reveals on hover from lg up */}
                  <p className="svc-reveal mt-3 max-w-lg text-base leading-relaxed text-[#eaf7ee]/45 transition-all duration-500 lg:mt-0 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:mt-4 lg:group-hover:max-h-28 lg:group-hover:opacity-100 lg:group-focus-within:mt-4 lg:group-focus-within:max-h-28 lg:group-focus-within:opacity-100">
                    {c.spec}
                  </p>
                </div>

                {/* index + travelling arrow */}
                <div className="flex shrink-0 items-center gap-4 pt-1 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/35">
                  <span className="hidden sm:inline">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg leading-none text-[#eaf7ee]/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#e1ff51] group-focus-within:translate-x-1 group-focus-within:text-[#e1ff51]">
                    ↗
                  </span>
                </div>
              </div>

              {/* signal sweep */}
              <span className="svc-sweep pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#e1ff51]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
