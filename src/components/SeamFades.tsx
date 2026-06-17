"use client";

import { useEffect } from "react";

/**
 * Full-screen cross-dissolve between the scenes so the page reads as one
 * continuous world — not a stack of sections handing off.
 *
 * The scenes are fixed, full-viewport layers (see each component). This
 * controller fades the incoming one up *in place* over the whole screen as the
 * previous fades out, with a slight settling zoom — because they all sit on
 * black and overlap completely, there's no split line or sliding panel, just
 * one scene melting into the next.
 *
 * Timing comes from each scene's scroll container (its nearest <section>, or the
 * element itself for the hero). The first never fades in (it owns the top of the
 * page); the last never fades out (nothing follows it). Invisible layers are set
 * `pointer-events: none` so they never block the active scene underneath.
 */
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export default function SeamFades() {
  useEffect(() => {
    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-seam-scene]"),
    );
    if (scenes.length < 2) return;

    const refs = scenes.map((s) => s.closest("section") ?? s);
    const last = scenes.length - 1;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (let i = 0; i < scenes.length; i++) {
        const r = refs[i].getBoundingClientRect();
        // rises to full while its container climbs into view from below
        const incoming = i === 0 ? 1 : clamp01((r.top - vh) / (vh * 0.4 - vh));
        // fades out as its container's bottom passes the top of the screen
        const outgoing = i === last ? 1 : clamp01(r.bottom / (vh * 0.45));
        const vis = smooth(Math.min(incoming, outgoing));

        const st = scenes[i].style;
        st.opacity = String(vis);
        st.pointerEvents = vis > 0.02 ? "" : "none";
      }
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
      scenes.forEach((s) => {
        s.style.opacity = "";
        s.style.transform = "";
        s.style.pointerEvents = "";
      });
    };
  }, []);

  return null;
}
