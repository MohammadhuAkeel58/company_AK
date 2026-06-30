"use client";

import * as React from "react";

interface ProjectData {
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
}

// NEXORA selected work. Verified Unsplash stock images.
const PROJECT_DATA: ProjectData[] = [
  {
    title: "Adidas",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    category: "Commerce Platform",
    year: "2025",
    description: "Headless storefront rebuild",
  },
  {
    title: "Meta",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
    category: "Design System",
    year: "2025",
    description: "Cross-platform UI system",
  },
  {
    title: "Whole Foods",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop",
    category: "Brand & Web",
    year: "2024",
    description: "Editorial brand site",
  },
  {
    title: "Clash of Clans",
    image:
      "https://images.unsplash.com/photo-1572495641004-28421ae52e52?q=80&w=1887&auto=format&fit=crop",
    category: "Realtime & AI",
    year: "2024",
    description: "Live-ops control room",
  },
  {
    title: "Spotify",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1896&auto=format&fit=crop",
    category: "Data & Analytics",
    year: "2023",
    description: "Listening insights platform",
  },
];

const CONFIG = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
};

const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

const getProjectData = (index: number) => {
  const i =
    ((Math.abs(index) % PROJECT_DATA.length) + PROJECT_DATA.length) %
    PROJECT_DATA.length;
  return PROJECT_DATA[i];
};

export function Component() {
  const [visibleRange, setVisibleRange] = React.useState({
    min: -CONFIG.BUFFER_SIZE,
    max: CONFIG.BUFFER_SIZE,
  });

  const state = React.useRef({
    currentY: 0,
    targetY: 0,
    isDragging: false,
    isSnapping: false,
    snapStart: { time: 0, y: 0, target: 0 },
    lastScrollTime: Date.now(),
    dragStart: { y: 0, scrollY: 0 },
    projectHeight: 0, // set from the container on mount
  });

  // The component is scoped to this container (NOT window) so it never hijacks
  // the page's smooth scroll — it only reacts while you interact with it.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const projectsRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const captionTitleRef = React.useRef<HTMLParagraphElement>(null);
  const captionYearRef = React.useRef<HTMLParagraphElement>(null);
  const captionIndexRef = React.useRef<number | null>(null);
  const requestRef = React.useRef<number>(undefined);

  // Swap the centered caption's title/year whenever a new project takes focus,
  // with a quick cross-fade. Lives at the container level (above every project
  // layer) so it's never trapped behind an image's stacking context.
  const syncCaption = (index: number) => {
    if (captionIndexRef.current === index) return;
    captionIndexRef.current = index;
    const data = getProjectData(index);
    const title = captionTitleRef.current;
    const year = captionYearRef.current;
    if (!title || !year) return;
    title.textContent = data.title;
    year.textContent = data.year;
    title.parentElement!.style.opacity = "0";
    requestAnimationFrame(() => {
      if (title.parentElement) title.parentElement.style.opacity = "1";
    });
  };

  // playback + manual navigation
  const [playing, setPlaying] = React.useState(true);
  const pausedRef = React.useRef(false); // true while the pointer is over it

  // jump exactly one project up (-1) or down (+1), snapping cleanly
  const step = React.useCallback((dir: 1 | -1) => {
    const s = state.current;
    if (!s.projectHeight) return;
    s.isSnapping = false;
    s.lastScrollTime = Date.now();
    const current = Math.round(-s.targetY / s.projectHeight);
    s.targetY = -(current + dir) * s.projectHeight;
  }, []);

  const updateParallax = (
    img: HTMLImageElement | null,
    scroll: number,
    index: number,
    height: number,
  ) => {
    if (!img) return;
    if (!img.dataset.parallaxCurrent) img.dataset.parallaxCurrent = "0";

    let current = parseFloat(img.dataset.parallaxCurrent);
    const target = (-scroll - index * height) * 0.2;
    current = lerp(current, target, 0.1);

    if (Math.abs(current - target) > 0.01) {
      img.style.transform = `translateY(${current}px) scale(1.35)`;
      img.dataset.parallaxCurrent = current.toString();
    }
  };

  const updateSnap = () => {
    const s = state.current;
    const progress = Math.min(
      (Date.now() - s.snapStart.time) / CONFIG.SNAP_DURATION,
      1,
    );
    const eased = 1 - Math.pow(1 - progress, 3);
    s.targetY = s.snapStart.y + (s.snapStart.target - s.snapStart.y) * eased;
    if (progress >= 1) s.isSnapping = false;
  };

  const snapToProject = () => {
    const s = state.current;
    const current = Math.round(-s.targetY / s.projectHeight);
    const target = -current * s.projectHeight;
    s.isSnapping = true;
    s.snapStart = { time: Date.now(), y: s.targetY, target };
  };

  const updatePositions = () => {
    const s = state.current;
    if (!s.projectHeight) return;

    projectsRef.current.forEach((el, index) => {
      const y = index * s.projectHeight + s.currentY;
      el.style.transform = `translateY(${y}px)`;
      updateParallax(el.querySelector("img"), s.currentY, index, s.projectHeight);
    });
  };

  const animate = () => {
    const s = state.current;
    if (!s.projectHeight) return;
    const now = Date.now();

    if (!s.isSnapping && !s.isDragging && now - s.lastScrollTime > 100) {
      const snapPoint =
        -Math.round(-s.targetY / s.projectHeight) * s.projectHeight;
      if (Math.abs(s.targetY - snapPoint) > 1) snapToProject();
    }

    if (s.isSnapping) updateSnap();
    if (!s.isDragging) {
      s.currentY += (s.targetY - s.currentY) * CONFIG.LERP_FACTOR;
    }

    updatePositions();
  };

  const renderedRange = React.useRef({
    min: -CONFIG.BUFFER_SIZE,
    max: CONFIG.BUFFER_SIZE,
  });

  const animationLoop = () => {
    animate();

    const s = state.current;
    if (s.projectHeight) {
      // caption follows the visually-centered (lerped) project
      syncCaption(Math.round(-s.currentY / s.projectHeight));
      const currentIndex = Math.round(-s.targetY / s.projectHeight);
      const min = currentIndex - CONFIG.BUFFER_SIZE;
      const max = currentIndex + CONFIG.BUFFER_SIZE;
      if (
        min !== renderedRange.current.min ||
        max !== renderedRange.current.max
      ) {
        renderedRange.current = { min, max };
        setVisibleRange({ min, max });
      }
    }

    requestRef.current = requestAnimationFrame(animationLoop);
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    state.current.projectHeight = container.clientHeight;

    const onWheel = (e: WheelEvent) => {
      // keep the wheel inside the slider; don't let it reach Lenis / the page
      e.preventDefault();
      e.stopPropagation();
      const s = state.current;
      s.isSnapping = false;
      s.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * CONFIG.SCROLL_SPEED, CONFIG.MAX_VELOCITY),
        -CONFIG.MAX_VELOCITY,
      );
      s.targetY -= delta;
    };

    const onTouchStart = (e: TouchEvent) => {
      const s = state.current;
      s.isDragging = true;
      s.isSnapping = false;
      s.dragStart = { y: e.touches[0].clientY, scrollY: s.targetY };
      s.lastScrollTime = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = state.current;
      if (!s.isDragging) return;
      e.preventDefault();
      s.targetY =
        s.dragStart.scrollY + (e.touches[0].clientY - s.dragStart.y) * 1.5;
      s.lastScrollTime = Date.now();
    };

    const onTouchEnd = () => {
      state.current.isDragging = false;
    };

    const onResize = () => {
      state.current.projectHeight = container.clientHeight;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    onResize();
    syncCaption(0);
    if (!reduce) requestRef.current = requestAnimationFrame(animationLoop);
    else updatePositions();

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay — steps through the work on its own, pausing while you interact
  React.useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (pausedRef.current || state.current.isDragging || document.hidden) return;
      step(1);
    }, 3500);
    return () => window.clearInterval(id);
  }, [playing, step]);

  const indices: number[] = [];
  for (let i = visibleRange.min; i <= visibleRange.max; i++) indices.push(i);

  return (
    <div
      ref={containerRef}
      className="parallax-container"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <style>{`
        .parallax-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #020405;
          cursor: grab;
          touch-action: none;
        }
        .parallax-container:active { cursor: grabbing; }
        .project-list { list-style: none; margin: 0; padding: 0; }
        .project {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          overflow: hidden;
          will-change: transform;
        }
        .project img {
          width: 100%; height: 100%;
          object-fit: cover;
          will-change: transform;
          transform: scale(1.35);
        }
        /* readability scrim behind the centered caption */
        .parallax-container::after {
          content: "";
          position: absolute; inset: 0;
          pointer-events: none;
          background:
            radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0.55), transparent 72%),
            linear-gradient(180deg, rgba(0,0,0,0.3), transparent 32%, transparent 68%, rgba(0,0,0,0.3));
        }
        /* big title + year centered over each project image */
        .project-caption {
          position: absolute; inset: 0;
          z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1.25rem;
          padding: 1.5rem;
          text-align: center;
          pointer-events: none;
          transition: opacity .4s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .project-caption { transition: none; }
        }
        .project-caption .pc-title {
          font-family: var(--font-heading), sans-serif;
          font-size: clamp(2.75rem, 9vw, 7rem);
          line-height: 0.92;
          letter-spacing: -0.02em;
          color: #eaf7ee;
          text-shadow: 0 4px 40px rgba(0,0,0,0.55);
        }
        .project-caption .pc-year {
          font-family: var(--font-mono), monospace;
          font-size: clamp(0.95rem, 2.4vw, 1.5rem);
          letter-spacing: 0.4em;
          color: #e1ff51;
          text-shadow: 0 2px 24px rgba(0,0,0,0.55);
        }
        .slider-controls {
          position: absolute;
          right: 1.5rem; bottom: 1.75rem;
          z-index: 3;
          display: flex; flex-direction: column; gap: 0.6rem;
          pointer-events: auto;
        }
        .slider-controls button {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 9999px;
          border: 1px solid rgba(234,247,238,0.25);
          background: rgba(2,4,5,0.4);
          backdrop-filter: blur(8px);
          color: #eaf7ee;
          cursor: pointer;
          transition: border-color .25s ease, color .25s ease, transform .25s ease;
        }
        .slider-controls button:hover {
          border-color: rgba(225,255,81,0.6);
          color: #e1ff51;
        }
        .slider-controls button:active { transform: scale(0.92); }
        .slider-controls svg { width: 16px; height: 16px; display: block; }
        @media (max-width: 640px) {
          .slider-controls { right: 1rem; bottom: 1rem; }
        }
      `}</style>

      {/* navigation + autoplay controls */}
      <div className="slider-controls">
        <button type="button" aria-label="Previous work" onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause autoplay" : "Play autoplay"}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button type="button" aria-label="Next work" onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="project-list">
        {indices.map((i) => {
          const data = getProjectData(i);
          return (
            <div
              key={i}
              className="project"
              ref={(el) => {
                if (el) projectsRef.current.set(i, el);
                else projectsRef.current.delete(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt={data.title} draggable={false} />
            </div>
          );
        })}
      </div>

      {/* big title + year centered over the focused image, kept in sync by the
          animation loop so it always sits above every project layer */}
      <div className="project-caption">
        <p className="pc-title" ref={captionTitleRef} />
        <p className="pc-year" ref={captionYearRef} />
      </div>
    </div>
  );
}
