/**
 * Contact / CTA — a focused conversion block to close the page before the
 * footer. On-brand with the hero (black / lime, Space Grotesk + mono).
 */
export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-[#eaf7ee]/10 px-6 py-28 text-[#eaf7ee] sm:px-9 lg:px-12 lg:py-44"
    >
      {/* ambient lime glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(225,255,81,0.08),transparent_70%)] blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-balance text-5xl leading-[1.16] tracking-[-0.02em] sm:text-7xl lg:text-8xl">
          Let&apos;s build something{" "}
          <span className="text-[#e1ff51]">impossible</span>.
        </h2>

        <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[#eaf7ee]/60 lg:text-xl">
          Tell us where you&apos;re headed and what&apos;s in the way. We&apos;ll
          come back with a clear path — and the team to build it.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/45">
          <span className="text-[#eaf7ee]/70">hello@nexora.dev</span>
          <span className="hidden h-3 w-px bg-[#eaf7ee]/20 sm:block" />
          <span>REMOTE · WORLDWIDE</span>
          <span className="hidden h-3 w-px bg-[#eaf7ee]/20 sm:block" />
          <span>MON–FRI · 9–6</span>
        </div>
      </div>
    </section>
  );
}
