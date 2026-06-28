/**
 * Minimal site footer — gives the page a graceful ending with brand, contact
 * and a copyright line, matching the NEXORA mono/lime aesthetic.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[#eaf7ee]/10 px-6 py-12 text-[#eaf7ee] sm:px-9 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-start gap-0.5">
            <span className="text-xl font-bold tracking-tight">NEXORA</span>
            <span className="mt-1 font-mono text-[10px]">™</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#eaf7ee]/45">
            We turn complexity into clarity. Strategy, systems, software, impact.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href="mailto:hello@nexora.dev"
            className="font-mono text-sm tracking-wide transition-colors hover:text-[#e1ff51]"
          >
            hello@nexora.dev
          </a>
          <div className="flex gap-5 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/45">
            <a className="transition-colors hover:text-[#e1ff51]" href="#">
              LINKEDIN
            </a>
            <a className="transition-colors hover:text-[#e1ff51]" href="#">
              GITHUB
            </a>
            <a className="transition-colors hover:text-[#e1ff51]" href="#">
              X
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-[#eaf7ee]/10 pt-6 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/30">
        © 2026 NEXORA — DIGITAL ENGINEERING. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
