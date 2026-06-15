"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const NAV = [
  { n: "01", label: "STRATEGY" },
  { n: "02", label: "SYSTEMS" },
  { n: "03", label: "SOFTWARE" },
  { n: "04", label: "IMPACT" },
];

const HEADLINE: { text: string; accent?: boolean }[][] = [
  [{ text: "WE TURN" }],
  [{ text: "COMPLEXITY" }],
  [{ text: "INTO " }, { text: "CLARITY.", accent: true }],
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Initial states
      gsap.set(".reveal-inner", { yPercent: 115 });
      gsap.set([".fx-top", ".fx-sub", ".fx-tag", ".fx-cta"], {
        autoAlpha: 0,
        y: 18,
      });
      gsap.set(".fx-nav-item", { autoAlpha: 0, x: 30 });
      gsap.set(".fx-nav-line", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".fx-vline", { scaleY: 0, transformOrigin: "top center" });
      gsap.set(".fx-scroll", { autoAlpha: 0, y: -10 });
      gsap.set(".fx-bg", { scale: 1.12 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.to(".fx-bg", { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
        .to(".fx-top", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.2)
        .to(
          ".reveal-inner",
          { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" },
          0.35,
        )
        .to(".fx-sub", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(".fx-tag", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.45")
        .to(".fx-cta", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(".fx-vline", { scaleY: 1, duration: 1, ease: "power2.inOut" }, 0.5)
        .to(
          ".fx-nav-line",
          { scaleX: 1, duration: 0.9, stagger: 0.1, ease: "power3.inOut" },
          0.6,
        )
        .to(
          ".fx-nav-item",
          { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.1 },
          0.7,
        )
        .to(".fx-scroll", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.3");

      // Looping scroll-arrow bounce
      gsap.to(".fx-arrow", {
        y: 8,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Subtle parallax on pointer move
      const onMove = (e: PointerEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(".fx-bg", {
          xPercent: x * -2,
          yPercent: y * -2,
          duration: 0.8,
          ease: "power2.out",
        });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      className="relative flex-1 overflow-hidden bg-[#001417] p-2 sm:p-3"
    >
      {/* Inner framed panel */}
      <section className="relative h-full min-h-[calc(100svh-1rem)] w-full overflow-hidden bg-background">
        {/* Background image */}
        <div
          className="fx-bg pointer-events-none absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2400&auto=format&fit=crop')",
          }}
          aria-hidden
        />
        {/* Teal tint over the grayscale image */}
        <div
          className="pointer-events-none absolute inset-0 bg-background mix-blend-multiply"
          aria-hidden
        />
        {/* Dark teal wash for depth and text legibility */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/90 via-background/55 to-background/85"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent"
          aria-hidden
        />

        {/* Content grid */}
        <div className="relative z-10 flex h-full flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
          {/* Top bar */}
          <header className="flex items-start justify-between">
            <div className="fx-top flex items-start gap-0.5">
              <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                NEXORA
              </span>
              <span className="mt-1 text-[10px] font-mono">™</span>
            </div>
            <button className="fx-top group flex cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.25em] outline-none focus-visible:text-accent sm:text-sm">
              <span className="text-foreground/40">[</span>
              <span className="transition-colors group-hover:text-accent">
                MENU
              </span>
              <span className="text-foreground/40">]</span>
            </button>
          </header>

          {/* Middle: headline + right nav */}
          <div className="flex flex-1 flex-col justify-center gap-12 lg:flex-row lg:items-start lg:justify-between lg:pt-[7vh]">
            {/* Headline block */}
            <div className="lg:max-w-none">
              <h1 className="font-sans text-[15vw] leading-[0.92] font-extrabold tracking-[-0.02em] sm:text-7xl lg:text-8xl">
                {HEADLINE.map((line, i) => (
                  <span
                    key={i}
                    className="reveal-line block overflow-hidden pb-[0.05em] lg:whitespace-nowrap"
                  >
                    <span className="reveal-inner block">
                      {line.map((part, j) => (
                        <span
                          key={j}
                          className={part.accent ? "text-accent" : undefined}
                        >
                          {part.text}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </h1>

              <p className="fx-sub mt-10 text-lg font-semibold tracking-tight sm:text-xl lg:mt-16">
                Strategy. Systems. Software. Impact.
              </p>

              <p className="fx-tag mt-4 font-mono text-[11px] tracking-[0.22em] text-foreground/60 sm:text-xs">
                TAILORED SOLUTIONS FOR AMBITIOUS BUSINESSES.
              </p>

              <a
                href="#contact"
                className="fx-cta group mt-9 inline-flex items-center gap-3 font-mono text-xs tracking-[0.22em] sm:text-sm"
              >
                <span className="relative pb-1">
                  LET&apos;S BUILD WHAT&apos;S NEXT
                  <span className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            </div>

            {/* Right nav list */}
            <nav className="relative hidden w-72 shrink-0 self-start pt-2 lg:block">
              <span className="fx-vline absolute top-0 -left-8 h-full w-px bg-foreground/20" />
              <ul>
                {NAV.map((item) => (
                  <li key={item.n} className="relative">
                    <span className="fx-nav-line absolute top-0 left-0 h-px w-full bg-foreground/20" />
                    <a
                      href={`#${item.label.toLowerCase()}`}
                      className="fx-nav-item group flex items-center gap-6 py-7"
                    >
                      <span className="font-mono text-xs text-foreground/45 transition-colors group-hover:text-accent">
                        {item.n}
                      </span>
                      <span className="text-lg font-bold tracking-wide transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Bottom right scroll cue */}
          <div className="flex justify-end">
            <div className="fx-scroll flex flex-col items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/60">
                SCROLL
                <br />
                DOWN
              </span>
              <span className="fx-arrow text-xl">↓</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
