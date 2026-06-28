"use client";

import { useEffect, useState } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const links = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

function Mark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#e1ff51]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </svg>
  );
}

function Globe() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.7 3 2.7 15 0 18M12 3c-2.7 3-2.7 15 0 18" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 text-[#eaf7ee] sm:px-5 sm:pt-4 lg:px-6 lg:pt-5">
      <nav
        aria-label="Primary"
        className={cx(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-colors duration-300 lg:px-5",
          scrolled || open
            ? "border-[#eaf7ee]/12 bg-black/75 backdrop-blur-xl"
            : "border-[#eaf7ee]/10 bg-black/35 backdrop-blur-md",
        )}
      >
        {/* logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2"
        >
          <Mark />
          <span className="text-lg font-bold tracking-tight">NEXORA</span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[#eaf7ee]/70 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-[#e1ff51]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* desktop actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <button className="flex items-center gap-1.5 rounded-full border border-[#eaf7ee]/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-[#eaf7ee]/70 transition-colors hover:border-[#e1ff51]/40 hover:text-[#e1ff51]">
            <Globe /> EN
          </button>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-[#e1ff51] px-4 py-2 text-xs font-semibold tracking-tight text-black transition-transform duration-200 hover:scale-[1.03]"
          >
            GET AN ESTIMATE
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex items-center gap-2.5 font-mono text-xs tracking-[0.25em] outline-none lg:hidden"
        >
          <span className="flex h-3 w-6 flex-col justify-center gap-[5px]">
            <span
              className={cx(
                "h-px w-6 bg-current transition-transform duration-300",
                open && "translate-y-[3px] rotate-45",
              )}
            />
            <span
              className={cx(
                "h-px w-6 bg-current transition-transform duration-300",
                open && "-translate-y-[3px] -rotate-45",
              )}
            />
          </span>
          {open ? "CLOSE" : "MENU"}
        </button>
      </nav>

      {/* mobile panel */}
      <div
        className={cx(
          "mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border bg-black/90 backdrop-blur-xl transition-all duration-300 lg:hidden",
          open
            ? "max-h-96 border-[#eaf7ee]/12 opacity-100"
            : "pointer-events-none max-h-0 border-transparent opacity-0",
        )}
      >
        <div className="flex flex-col p-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-[#eaf7ee]/80 transition-colors hover:bg-[#eaf7ee]/5 hover:text-[#e1ff51]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e1ff51] px-4 py-3 text-sm font-semibold tracking-tight text-black"
          >
            GET AN ESTIMATE →
          </a>
        </div>
      </div>
    </header>
  );
}
