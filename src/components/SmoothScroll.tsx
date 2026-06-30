"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Site-wide smooth (inertia) scrolling. Lenis drives the real window scroll
 * position, so the scroll-position-based scene animations and the seam
 * cross-dissolve keep working unchanged — they just glide instead of snapping.
 * Disabled when the visitor prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Lenis doesn't intercept in-page anchor links, so a native `#section` jump
    // fights its rAF loop. Route hash-link clicks through lenis.scrollTo so they
    // glide to the right position (including the pinned Contact panel target).
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      if (href === "#") {
        lenis.scrollTo(0);
        return;
      }
      // Contact lives inside the pinned Process section's sliding panel, fully
      // revealed at the very end of that section's scroll — so target the
      // section's last scroll position rather than the (pinned) element itself.
      if (href === "#contact") {
        const proc = document.getElementById("process");
        if (proc) {
          lenis.scrollTo(proc.offsetTop + proc.offsetHeight - window.innerHeight);
          return;
        }
      }
      const target = document.querySelector(href);
      if (target) lenis.scrollTo(target as HTMLElement);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
