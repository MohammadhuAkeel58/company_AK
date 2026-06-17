"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * "Who We Are" — a scroll journey through four distinct digital worlds, each
 * tied to one facet of the company's DNA. No morphing structure is reused here
 * (that belongs to the hero): every layer is its own rendering technique,
 * cross-dissolving as the visitor scrolls.
 *
 *   01 Vision     — a particle field emerging and organizing from chaos
 *   02 Strategy   — an engineered megastructure / city, nothing accidental
 *   03 Creation   — a flowing liquid field, imagination becoming form
 *   04 Evolution  — everything converging, perpetually evolving
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uProgress;
  varying vec2  vUv;

  const vec3 ACCENT = vec3(0.886, 1.0, 0.318);
  const vec3 TEAL   = vec3(0.0, 0.153, 0.173);

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }
  float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<5;i++){ s+=a*vnoise(p); p*=2.0; a*=0.5; } return s; }
  float sdBox(vec3 p, vec3 b){ vec3 d=abs(p)-b; return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0); }

  // 01 Vision — volumetric light shafts emerging from darkness
  vec3 sceneVision(vec2 uv, float t, vec2 m){
    vec2 src = m*0.15;                  // light origin follows the cursor
    vec2 d = uv - src;
    float ang = atan(d.y, d.x);
    float rad = length(d);

    // animated angular noise sculpted into light shafts
    float n = fbm(vec2(ang*2.5 + t*0.12, t*0.1));
    float shaft = 0.5 + 0.5*sin(ang*18.0 + n*8.0 - t*0.4);
    shaft = pow(shaft, 4.0);
    float rays = shaft * (0.4 + 0.8*n);

    // radial profile: bright bloom at the core, shafts reaching outward
    float core  = exp(-rad*3.0);
    float reach = exp(-rad*0.8) * smoothstep(0.02, 0.28, rad);

    vec3 col = vec3(0.0);
    col += ACCENT * core * 2.6;
    col += mix(TEAL, ACCENT, 0.6) * rays * reach * 1.9;
    col += vec3(0.55, 0.75, 0.72) * core * 1.0;   // bright cream bloom heart
    col += TEAL * 0.08;
    return col;
  }

  // 02 Strategy — engineered megastructure / city
  float cityMap(vec3 p){
    float g = p.y;
    vec2 cell = floor(p.xz/2.2);
    vec2 lp = mod(p.xz, 2.2) - 1.1;
    float h = 0.5 + 3.2*hash21(cell);
    float bx = sdBox(vec3(lp.x, p.y - h*0.5, lp.y), vec3(0.72, h*0.5, 0.72));
    return min(g, bx);
  }
  vec3 sceneStrategy(vec2 uv, float t, vec2 m){
    vec3 ro = vec3(m.x*0.6, 2.4 + m.y*0.4, -t*1.0);
    vec3 fw = normalize(vec3(0.0, -0.45, -1.0));
    vec3 rt = normalize(cross(vec3(0,1,0), fw));
    vec3 up = cross(fw, rt);
    vec3 rd = normalize(uv.x*rt + uv.y*up + 1.4*fw);
    float tt = 0.0; bool hit=false; vec3 pos = ro;
    for(int i=0;i<64;i++){
      pos = ro + rd*tt;
      float d = cityMap(pos);
      if(d < 0.002){ hit=true; break; }
      tt += d*0.9;
      if(tt > 32.0) break;
    }
    vec3 col;
    if(hit){
      vec2 e = vec2(0.01, 0.0);
      vec3 n = normalize(vec3(
        cityMap(pos+e.xyy)-cityMap(pos-e.xyy),
        cityMap(pos+e.yxy)-cityMap(pos-e.yxy),
        cityMap(pos+e.yyx)-cityMap(pos-e.yyx)));
      vec3 l = normalize(vec3(0.4, 0.8, -0.3));
      float dif = clamp(dot(n,l), 0.0, 1.0);
      float fog = exp(-tt*0.06);
      col = vec3(0.02, 0.04, 0.05);
      col += TEAL*0.7*dif;
      float win = step(0.55, fract(pos.y*3.0)) * step(0.6, fract((pos.x+pos.z)*2.0)) * (1.0 - abs(n.y));
      col += ACCENT*win*0.55;
      col += ACCENT*0.22*pow(1.0-dif, 2.0)*(1.0-n.y);
      col *= fog;
    } else {
      col = TEAL*0.05 + ACCENT*0.04*smoothstep(0.5, 0.0, length(uv - vec2(0.0, 0.25)));
    }
    return col;
  }

  // 03 Creation — flowing liquid, imagination becoming form
  vec3 sceneCreation(vec2 uv, float t, vec2 m){
    vec2 p = uv*1.6 + 0.25*m;
    float n1 = fbm(p + vec2(0.0, t*0.15));
    float n2 = fbm(p*1.5 + n1*1.6 + vec2(t*0.1, 0.0));
    float v  = fbm(p + n2*1.2 + vec2(t*0.05, -t*0.07));
    float lines = abs(sin(v*9.0 - t*0.6));
    float glow = 0.12 / (lines + 0.04);
    vec3 col = mix(TEAL*0.4, ACCENT, smoothstep(0.3, 0.85, v));
    col *= 0.25 + glow*0.85;
    col += ACCENT*0.18*pow(1.0 - abs(v-0.5)*2.0, 3.0);
    return col;
  }

  // 04 Evolution — everything converging, perpetually evolving
  vec3 sceneEvolution(vec2 uv, float t, vec2 m){
    vec2 p = uv*1.4 + 0.2*m;
    float r = length(p);
    float a = atan(p.y, p.x) + t*0.2 + (1.0 - r)*2.2;
    vec2 sp = vec2(cos(a), sin(a))*r;
    float n = fbm(sp*3.0 + t*0.1);
    float conv = abs(fract(r*3.0 - t*0.45) - 0.5);
    float glow = smoothstep(0.1, 0.0, conv) * exp(-r*0.7);
    vec3 col = mix(TEAL*0.3, ACCENT, n);
    col *= 0.22 + glow*1.3;
    col += ACCENT*smoothstep(0.22, 0.0, r)*1.3;
    return col;
  }

  vec3 sceneAt(int idx, vec2 uv, float t, vec2 m){
    if(idx <= 0) return sceneVision(uv, t, m);
    else if(idx == 1) return sceneStrategy(uv, t, m);
    else if(idx == 2) return sceneCreation(uv, t, m);
    return sceneEvolution(uv, t, m);
  }

  float hashv(vec2 p){ return fract(sin(dot(p, vec2(41.13, 289.7)))*43758.5453); }

  void main(){
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5*uResolution) / uResolution.y;
    float t = uTime;
    vec2 m = uMouse;

    // one continuous "Creation" liquid world for the whole section;
    // scrolling advances the flow so it feels like travelling through it
    vec3 col = sceneCreation(uv, t + uProgress*5.0, m);

    // brighten toward the luminous teal/cream glow of the hero structure
    col *= 1.9;
    col = col / (col + vec3(0.62));
    col = pow(col, vec3(0.4545));
    col *= smoothstep(1.95, 0.5, length(uv * vec2(0.9, 1.0)));

    float edge = smoothstep(0.0, 0.04, uProgress) * (1.0 - smoothstep(0.96, 1.0, uProgress));
    col *= edge;

    col += (hashv(fragCoord) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const LAYERS = [
  { num: "01", name: "VISION", lead: "We see opportunities", accent: "before others see possibilities." },
  { num: "02", name: "STRATEGY", lead: "We don’t guess.", accent: "We engineer outcomes." },
  { num: "03", name: "CREATION", lead: "We transform", accent: "imagination into reality." },
  { num: "04", name: "EVOLUTION", lead: "We never stop", accent: "building what comes next." },
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

    const statements = Array.from(
      section.querySelectorAll<HTMLElement>(".wwa-statement"),
    );
    const navItems = Array.from(
      section.querySelectorAll<HTMLElement>(".wwa-nav-item"),
    );
    const navBars = navItems.map((n) => n.querySelector<HTMLElement>(".wwa-nav-bar"));
    const counter = section.querySelector<HTMLElement>(".wwa-counter");
    const progressFill = section.querySelector<HTMLElement>(".wwa-progress");

    const target = new THREE.Vector2(0, 0);
    const current = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let progress = 0;
    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      return clamp(-rect.top / Math.max(total, 1), 0, 1);
    };

    const N = LAYERS.length; // 4 parts
    const INTRO = 0.08; // hold the bare scene briefly before the first reveals
    const OUTRO = 0.08; // and after the last, so nothing pops during the seam
    const updateOverlay = (p: number) => {
      // Distribute all four parts across the *pinned* scroll. Each owns a window
      // centred at i+0.5, so the first fades IN after entry (not pre-shown during
      // the transition) and the last fades out before the exit seam.
      const fp = clamp((p - INTRO) / (1 - INTRO - OUTRO), 0, 1);
      const c = fp * N; // 0..N
      for (let i = 0; i < statements.length; i++) {
        const op = smoothstep(0.5, 0.16, Math.abs(c - (i + 0.5)));
        statements[i].style.opacity = String(op);
        statements[i].style.transform = `translateY(${(i + 0.5 - c) * 22}px)`;
        statements[i].style.filter = `blur(${(1 - op) * 8}px)`;
      }
      const activeIdx = clamp(Math.floor(c), 0, navItems.length - 1);
      for (let i = 0; i < navItems.length; i++) {
        const on = i === activeIdx;
        navItems[i].style.opacity = on ? "1" : "0.3";
        const bar = navBars[i];
        if (bar) bar.style.transform = `scaleX(${on ? 1 : 0})`;
      }
      if (counter) counter.textContent = String(activeIdx + 1).padStart(2, "0");
      if (progressFill) progressFill.style.transform = `scaleY(${p})`;
    };

    let raf = 0;
    let last = performance.now();
    let running = false;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      progress += (readProgress() - progress) * Math.min(1, dt * 8);
      current.x += (target.x - current.x) * Math.min(1, dt * 5);
      current.y += (target.y - current.y) * Math.min(1, dt * 5);
      uniforms.uTime.value += dt * timeScale;
      uniforms.uMouse.value.copy(current);
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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(section);
    const onVis = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[440vh] bg-black">
      <div
        ref={stageRef}
        data-seam-scene
        className="fixed inset-0 overflow-hidden text-[#eaf7ee] will-change-[opacity,transform]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {failed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#00272c_0%,#000_70%)]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_62%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute top-8 left-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#eaf7ee]/55 sm:left-9 lg:left-12">
          <span className="h-px w-8 bg-[#e1ff51]" />
          WHO WE ARE
        </div>
        <div className="absolute top-8 right-6 font-mono text-[10px] tracking-[0.35em] text-[#eaf7ee]/55 sm:right-9 lg:right-12">
          <span className="wwa-counter text-[#e1ff51]">01</span> / 04
        </div>

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
            <p className="max-w-4xl text-4xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              {l.lead} <span className="text-[#e1ff51]">{l.accent}</span>
            </p>
          </div>
        ))}

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

        <div className="absolute top-1/2 left-6 hidden h-40 w-px -translate-y-1/2 bg-[#eaf7ee]/15 lg:block">
          <div className="wwa-progress absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-[#e1ff51]" />
        </div>
      </div>
    </section>
  );
}
