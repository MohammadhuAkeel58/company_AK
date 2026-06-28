const stack = [
  "TypeScript", "React", "Next.js", "Node", "Python", "Go", "Rust",
  "PostgreSQL", "Redis", "Kafka", "GraphQL", "Kubernetes", "AWS", "GCP",
  "Terraform", "PyTorch", "LangChain", "Vercel",
];

/**
 * Stack — a thin "built with" telemetry band. An infinite marquee of the tools
 * NEXORA builds with, separated by lime signal dots. Pauses on reduced motion.
 */
export default function Stack() {
  const row = [...stack, ...stack];
  return (
    <section
      aria-label="Technologies we build with"
      className="relative overflow-hidden border-y border-[#eaf7ee]/12 py-6 text-[#eaf7ee]"
    >
      <style>{`
        @keyframes nx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .nx-marquee { animation: nx-marquee 38s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .nx-marquee { animation: none; } }
      `}</style>

      <div className="pointer-events-none flex items-center gap-6">
        <span className="z-10 shrink-0 bg-[#020405] pl-6 pr-2 font-mono text-[10px] tracking-[0.3em] text-[#e1ff51] sm:pl-9 lg:pl-12">
          BUILT&nbsp;WITH
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="nx-marquee flex w-max items-center gap-8 whitespace-nowrap font-mono text-sm tracking-tight text-[#eaf7ee]/55">
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-8">
                {t}
                <span className="h-1 w-1 rounded-full bg-[#e1ff51]/60" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
