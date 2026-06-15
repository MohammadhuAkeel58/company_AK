"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * "Who We Are" — a scroll-driven journey through the company's DNA.
 *
 * A single GPU-raymarched structure is pinned full-screen and evolves across
 * four scroll-bound layers:
 *   01 Vision     — fragments emerge from darkness and organize (chaos -> order)
 *   02 Strategy   — the lattice grows complex and perfectly synchronized
 *   03 Creation   — a glowing core/ecosystem forms inside the structure
 *   04 Evolution  — everything accelerates and never settles
 *
 * Progress is derived directly from scroll (no plugins). Entry and exit fade
 * seamlessly to black so the section flows out of and back into the void.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseActive;
  uniform float uProgress;   // 0..1 across the whole section
  varying vec2  vUv;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  float smin(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
  }

  float gTime; vec2 gMouse; float gAmt;
  float gChaos, gComplex, gEco, gEvo;

  float map(vec3 p){
    float tt = gTime;

    float rs = 0.11 + gEvo*0.14;
    p.xz *= rot(tt*rs + gMouse.x*0.7);
    p.xy *= rot(tt*rs*0.7 + gMouse.y*0.4);

    float r = 1.0 + 0.05*sin(tt*0.8) + gEco*0.12;
    float sphere = length(p) - r;

    // domain warp — strong fragmentation early, subtle life later
    float warp = 0.06 + gChaos*0.42;
    vec3 q = p + warp*sin(p.yzx*(2.5 + gChaos*3.0) + tt*0.6);

    // shell, broken apart while chaos is high
    float frag = sin(q.x*4.0 + tt)*sin(q.y*4.0)*sin(q.z*4.0);
    float shell = abs(sphere) - (0.06 + gChaos*0.10);
    shell += gChaos*0.24*frag;

    // gyroid lattice — complexity ramps across Strategy
    float sc = mix(2.2, 4.6, gComplex);
    vec3  pp = q*sc;
    float th = mix(0.78, 0.42, gComplex) + 0.18*sin(tt*0.5);
    float lat = abs(dot(sin(pp), cos(pp.zxy)))/sc - th/sc;

    float d = max(shell, -lat);

    // ecosystem core grows and pulses through Creation
    float core = length(p) - (0.18 + gEco*(0.5 + 0.08*sin(tt*1.2)));
    d = smin(d, core, 0.2 + gEco*0.12);

    // cursor ripple
    float md = length(p.xy - gMouse*1.1);
    d += 0.022*sin(md*14.0 - tt*5.0)*exp(-md*1.8)*gAmt;

    return d;
  }

  vec3 calcNormal(vec3 p){
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
      map(p+e.xyy) - map(p-e.xyy),
      map(p+e.yxy) - map(p-e.yxy),
      map(p+e.yyx) - map(p-e.yyx)));
  }

  float softShadow(vec3 ro, vec3 rd){
    float res = 1.0, t = 0.03;
    for(int i=0;i<16;i++){
      float h = map(ro + rd*t);
      res = min(res, 9.0*h/t);
      t += clamp(h, 0.03, 0.25);
      if(h < 0.001 || t > 5.0) break;
    }
    return clamp(res, 0.0, 1.0);
  }

  float calcAO(vec3 p, vec3 n){
    float occ = 0.0, sca = 1.0;
    for(int i=0;i<5;i++){
      float hr = 0.01 + 0.13*float(i)/4.0;
      occ += (hr - map(p + n*hr))*sca;
      sca *= 0.82;
    }
    return clamp(1.0 - 1.6*occ, 0.0, 1.0);
  }

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.13, 289.7)))*43758.5453); }

  void main(){
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5*uResolution) / uResolution.y;

    gTime = uTime; gMouse = uMouse; gAmt = uMouseActive;
    gChaos   = 1.0 - smoothstep(0.0, 0.24, uProgress);
    gComplex = smoothstep(0.18, 0.50, uProgress);
    gEco     = smoothstep(0.46, 0.78, uProgress);
    gEvo     = smoothstep(0.70, 1.00, uProgress);

    vec3 ro = vec3(uMouse.x*0.25, uMouse.y*0.2, 3.3);
    vec3 fwd = normalize(vec3(0.0) - ro);
    vec3 rgt = normalize(cross(vec3(0.0,1.0,0.0), fwd));
    vec3 upv = cross(fwd, rgt);
    vec3 rd  = normalize(uv.x*rgt + uv.y*upv + 1.6*fwd);

    float t = 0.0, glow = 0.0;
    bool hit = false;
    vec3 p = ro;
    for(int i=0;i<88;i++){
      p = ro + rd*t;
      float d = map(p);
      glow += 0.016 / (1.0 + d*d*40.0);
      if(d < 0.0013){ hit = true; break; }
      t += d*0.8;
      if(t > 7.0) break;
    }

    vec3 lime = vec3(0.886, 1.0, 0.318);
    vec3 teal = vec3(0.0, 0.153, 0.173);
    vec3 col = vec3(0.0);

    if(hit){
      vec3 n = calcNormal(p);
      vec3 l = normalize(vec3(0.5 + gMouse.x*0.7, 0.75, 0.5 + gMouse.y*0.5));
      float dif  = clamp(dot(n, l), 0.0, 1.0);
      float sh   = softShadow(p + n*0.02, l);
      float occ  = calcAO(p, n);
      float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
      vec3  hv   = normalize(l - rd);
      float spec = pow(clamp(dot(n, hv), 0.0, 1.0), 80.0);
      float bdif = clamp(dot(n, -l), 0.0, 1.0);

      // lime energy intensifies as the organism comes alive
      float energy = 0.7 + gEco*0.5 + gEvo*0.4;

      col  = vec3(0.015, 0.03, 0.035) * occ;
      col += vec3(0.55, 0.72, 0.78) * dif * sh * 0.55;
      col += teal * 1.4 * (0.4 + 0.6*dif) * occ;
      col += teal * 0.4 * bdif;
      col += lime * fres * 1.3 * occ * energy;
      col += lime * spec * sh * 1.2 * energy;
    }

    vec3 glowCol = mix(teal, lime, clamp(glow*0.6, 0.0, 1.0));
    col += glowCol * glow * 0.9;

    float vig = smoothstep(1.3, 0.2, length(uv));
    col += teal * 0.06 * vig * (1.0 - float(hit));

    col = col / (col + vec3(0.9));
    col = pow(col, vec3(0.4545));
    col *= smoothstep(1.5, 0.4, length(uv * vec2(0.9, 1.0)));

    // emerge from black / dissolve to black at the section boundaries
    float edge = smoothstep(0.0, 0.06, uProgress) * (1.0 - smoothstep(0.93, 1.0, uProgress));
    col *= edge;

    col += (hash(fragCoord) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const LAYERS = [
  {
    num: "01",
    name: "VISION",
    lead: "We see opportunities",
    accent: "before others see possibilities.",
  },
  {
    num: "02",
    name: "STRATEGY",
    lead: "We don’t guess.",
    accent: "We engineer outcomes.",
  },
  {
    num: "03",
    name: "CREATION",
    lead: "We transform",
    accent: "imagination into reality.",
  },
  {
    num: "04",
    name: "EVOLUTION",
    lead: "We never stop",
    accent: "building what comes next.",
  },
];

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function WhoWeAre() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!canvas || !section || !stage) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseActive: { value: 0 },
      uProgress: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeScale = prefersReduced ? 0.15 : 1;

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const cap = Math.min(1, 1600 / Math.max(w, h));
      const scale = cap * Math.min(window.devicePixelRatio || 1, 1);
      const bw = Math.max(1, Math.round(w * scale));
      const bh = Math.max(1, Math.round(h * scale));
      renderer.setSize(bw, bh, false);
      uniforms.uResolution.value.set(bw, bh);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // Cached overlay nodes driven each frame (no React re-renders)
    const statements = Array.from(
      section.querySelectorAll<HTMLElement>(".wwa-statement"),
    );
    const navItems = Array.from(
      section.querySelectorAll<HTMLElement>(".wwa-nav-item"),
    );
    const navBorders = navItems.map((n) =>
      n.querySelector<HTMLElement>(".wwa-nav-bar"),
    );
    const progressFill = section.querySelector<HTMLElement>(".wwa-progress");

    // Pointer
    const target = new THREE.Vector2(0, 0);
    const current = new THREE.Vector2(0, 0);
    let active = 0;
    let lastMove = -10;
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
      lastMove = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let progress = 0;
    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      return clamp(-rect.top / Math.max(total, 1), 0, 1);
    };

    const updateOverlay = (p: number) => {
      const segs = LAYERS.length;
      const activeIdx = clamp(Math.floor(p * segs), 0, segs - 1);
      for (let i = 0; i < statements.length; i++) {
        const localT = clamp((p - i / segs) * segs, 0, 1);
        const op =
          smoothstep(0, 0.16, localT) * (1 - smoothstep(0.84, 1, localT));
        const node = statements[i];
        node.style.opacity = String(op);
        node.style.transform = `translateY(${(0.5 - localT) * 26}px)`;
        node.style.filter = `blur(${(1 - op) * 9}px)`;
      }
      for (let i = 0; i < navItems.length; i++) {
        const on = i === activeIdx;
        navItems[i].style.opacity = on ? "1" : "0.3";
        const bar = navBorders[i];
        if (bar) bar.style.transform = `scaleX(${on ? 1 : 0})`;
      }
      if (progressFill) progressFill.style.transform = `scaleY(${p})`;
    };

    let raf = 0;
    let last = performance.now();
    let running = false;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      progress += (readProgress() - progress) * Math.min(1, dt * 8);

      current.x += (target.x - current.x) * Math.min(1, dt * 6);
      current.y += (target.y - current.y) * Math.min(1, dt * 6);
      const wantActive = now / 1000 - lastMove < 0.6 ? 1 : 0;
      active += (wantActive - active) * Math.min(1, dt * 3);

      uniforms.uTime.value += dt * timeScale;
      uniforms.uMouse.value.copy(current);
      uniforms.uMouseActive.value = active;
      uniforms.uProgress.value = progress;

      updateOverlay(progress);
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only render while the section is on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[440vh] bg-black">
      {/* Pinned stage */}
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden text-[#eaf7ee]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {failed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#00272c_0%,#000_70%)]" />
        )}

        {/* Legibility wash behind the centered statements */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,transparent_62%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Overline */}
        <div className="absolute top-8 left-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#eaf7ee]/55 sm:left-9 lg:left-12">
          <span className="h-px w-8 bg-[#e1ff51]" />
          WHO WE ARE
        </div>

        {/* Statements (overlapping; one visible at a time) */}
        {LAYERS.map((l) => (
          <div
            key={l.num}
            className="wwa-statement pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0 will-change-[opacity,transform]"
          >
            <div className="mb-7 flex items-center gap-3 font-mono text-[11px] tracking-[0.45em] text-[#e1ff51]">
              <span>{l.num}</span>
              <span className="h-px w-6 bg-[#e1ff51]/60" />
              <span>{l.name}</span>
            </div>
            <p className="max-w-4xl text-3xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              {l.lead} <span className="text-[#e1ff51]">{l.accent}</span>
            </p>
          </div>
        ))}

        {/* Layer index (right) */}
        <nav className="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-5 lg:flex">
          {LAYERS.map((l) => (
            <div
              key={l.num}
              className="wwa-nav-item flex items-center gap-3 opacity-30 transition-opacity"
            >
              <span className="relative block h-px w-8 bg-[#eaf7ee]/25">
                <span className="wwa-nav-bar absolute inset-0 origin-left scale-x-0 bg-[#e1ff51]" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em]">
                {l.num} {l.name}
              </span>
            </div>
          ))}
        </nav>

        {/* Vertical progress (left) */}
        <div className="absolute top-1/2 left-6 hidden h-40 w-px -translate-y-1/2 bg-[#eaf7ee]/15 lg:block">
          <div className="wwa-progress absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-[#e1ff51]" />
        </div>
      </div>
    </section>
  );
}
