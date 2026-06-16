"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * "Services" — sticky product storytelling. One persistent WebGL core (kin to
 * the hero object) is the protagonist: it glides across the screen as the
 * visitor scrolls (drifting north-west → south-east), being dissected to
 * reveal a different hidden internal system per capability. The open space
 * opposite the object carries that service's description and its categories.
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
  uniform float uProgress;
  uniform float uOpen, uComplex, uUI, uCloud, uEmission, uEvolve, uCam;
  uniform vec2  uObjOffset;
  uniform vec3  uAccent;
  varying vec2  vUv;

  const vec3 TEAL = vec3(0.0, 0.153, 0.173);

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float smin(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
  }
  float sdBox(vec3 p, vec3 b){ vec3 d=abs(p)-b; return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0); }

  float map(vec3 p){
    p.xz *= rot(uTime*0.12 + uMouse.x*0.5);
    p.xy *= rot(uTime*0.08 + uMouse.y*0.3);
    float r = length(p);

    float shell = abs(r - 1.0) - 0.04;
    float latc = p.y / max(r, 0.001);
    shell = max(shell, uOpen*0.95 - abs(latc));

    float sc = 3.0 + uComplex*2.5;
    vec3 pp = p*sc;
    float th = 0.55 - uComplex*0.12;
    float gA = abs(dot(sin(pp), cos(pp.zxy)))/sc - th/sc;
    float arch = max(r - 0.9, -gA);

    float yy = mod(p.y + 8.0, 0.3) - 0.15;
    float pan = max(sdBox(vec3(p.x, yy, p.z), vec3(0.85, 0.012, 0.85)), r - 0.88);
    float internal = mix(arch, min(arch, pan), uUI);

    float cell = 0.5;
    vec3 pr = mod(p + cell, 2.0*cell) - cell;
    float nd = length(pr) - 0.05;
    nd = max(nd, r - (1.0 + uCloud*1.4));
    nd = max(nd, 0.9 - r);
    internal = mix(internal, min(internal, nd), uCloud);

    float core = r - (0.34 + uEvolve*0.18 + 0.04*sin(uTime*1.2));

    float d = min(shell, internal);
    d = smin(d, core, 0.18);

    float md = length(p.xy - uMouse*1.1);
    d += 0.02*sin(md*14.0 - uTime*5.0)*exp(-md*1.8)*uMouseActive;
    return d;
  }

  vec3 calcNormal(vec3 p){
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
      map(p+e.xyy)-map(p-e.xyy),
      map(p+e.yxy)-map(p-e.yxy),
      map(p+e.yyx)-map(p-e.yyx)));
  }
  float softShadow(vec3 ro, vec3 rd){
    float res=1.0, t=0.03;
    for(int i=0;i<16;i++){ float h=map(ro+rd*t); res=min(res, 9.0*h/t); t+=clamp(h,0.03,0.25); if(h<0.001||t>5.0) break; }
    return clamp(res,0.0,1.0);
  }
  float calcAO(vec3 p, vec3 n){
    float occ=0.0, sca=1.0;
    for(int i=0;i<5;i++){ float hr=0.01+0.13*float(i)/4.0; occ+=(hr-map(p+n*hr))*sca; sca*=0.82; }
    return clamp(1.0-1.6*occ, 0.0, 1.0);
  }
  float hashv(vec2 p){ return fract(sin(dot(p, vec2(41.13, 289.7)))*43758.5453); }

  void main(){
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5*uResolution) / uResolution.y;

    // position the object on screen (it glides as you scroll)
    vec2 cuv = uv - uObjOffset;

    vec3 ro = vec3(uMouse.x*0.2, uMouse.y*0.18, uCam);
    vec3 fwd = normalize(vec3(0.0) - ro);
    vec3 rgt = normalize(cross(vec3(0,1,0), fwd));
    vec3 upv = cross(fwd, rgt);
    vec3 rd  = normalize(cuv.x*rgt + cuv.y*upv + 1.6*fwd);

    float t=0.0, glow=0.0; bool hit=false; vec3 p=ro;
    for(int i=0;i<76;i++){
      p = ro + rd*t;
      float d = map(p);
      glow += 0.016 / (1.0 + d*d*40.0);
      if(d < 0.0013){ hit=true; break; }
      t += d*0.8;
      if(t > 9.0) break;
    }

    vec3 col = vec3(0.0);
    if(hit){
      vec3 n = calcNormal(p);
      vec3 l = normalize(vec3(0.5 + uMouse.x*0.7, 0.75, 0.5 + uMouse.y*0.5));
      float dif = clamp(dot(n,l), 0.0, 1.0);
      float sh  = softShadow(p + n*0.02, l);
      float occ = calcAO(p, n);
      float fres = pow(1.0 - clamp(dot(n,-rd), 0.0, 1.0), 3.0);
      vec3 hv = normalize(l - rd);
      float spec = pow(clamp(dot(n,hv), 0.0, 1.0), 80.0);

      col  = vec3(0.015, 0.03, 0.035) * occ;
      col += vec3(0.55, 0.72, 0.78) * dif * sh * 0.55;
      col += TEAL * 1.4 * (0.4 + 0.6*dif) * occ;
      col += uAccent * fres * 1.3 * occ;
      col += uAccent * spec * sh * 1.2;

      float vein = 0.5 + 0.5*sin(p.x*9.0 + p.y*7.0 + p.z*8.0 - uTime*3.5);
      col += uAccent * uEmission * pow(vein, 4.0) * 1.8;
      col += uAccent * exp(-length(p)*2.2) * (0.3 + uEvolve*0.9);
    }

    vec3 glowCol = mix(TEAL, uAccent, clamp(glow*0.6, 0.0, 1.0));
    col += glowCol * glow * 0.9;

    col *= 1.7;
    col = col / (col + vec3(0.6));
    col = pow(col, vec3(0.4545));
    col *= smoothstep(1.9, 0.55, length(uv * vec2(0.9, 1.0)));

    // emerge from black on entry; stay full-bright through the finale zoom
    col *= smoothstep(0.0, 0.04, uProgress);

    col += (hashv(fragCoord) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SERVICES = [
  {
    num: "01", name: "WEB DEVELOPMENT", side: "left",
    lead: "Engineered", accent: "to last.",
    desc: "Fast, secure, scalable systems — architected on fundamentals, not trends.",
    cats: ["Frontend", "Backend & APIs", "E‑commerce", "Headless CMS", "Web Apps"],
  },
  {
    num: "02", name: "UI / UX DESIGN", side: "right",
    lead: "Designed", accent: "to feel inevitable.",
    desc: "Interfaces shaped around real behavior — intuitive, fluid, impossible to forget.",
    cats: ["Product Design", "Design Systems", "Prototyping", "User Research", "Interaction"],
  },
  {
    num: "03", name: "AI & AUTOMATION", side: "left",
    lead: "Software", accent: "that thinks.",
    desc: "Models and agents that learn, decide, and act — removing the work that slows you down.",
    cats: ["ML Models", "Agents & RAG", "Automation", "Chatbots", "Analytics"],
  },
  {
    num: "04", name: "CLOUD INFRASTRUCTURE", side: "right",
    lead: "Ready", accent: "for anything.",
    desc: "Resilient, observable platforms that scale long before the load ever arrives.",
    cats: ["AWS · GCP · Azure", "DevOps", "Kubernetes", "CI/CD", "Observability"],
  },
  {
    num: "05", name: "DIGITAL TRANSFORMATION", side: "left",
    lead: "One", accent: "moving system.",
    desc: "Strategy, modernization and integration unified into a single force for growth.",
    cats: ["Strategy", "Modernization", "Integration", "Data Platforms", "Enablement"],
  },
];

type P = {
  pos: [number, number]; cam: number;
  open: number; complex: number; ui: number; cloud: number;
  emission: number; evolve: number; accent: [number, number, number];
};
// Snaking travel path. The object keeps the SAME shape the whole way through
// (no dots / panel changes) — only its position and accent colour shift as it
// glides corner-to-corner; the text sits in the open space opposite it.
// Shape params are identical across every waypoint for a consistent object.
const BASE = { open: 0.92, complex: 0.6, ui: 0, cloud: 0, emission: 0.3, evolve: 0.15 };
// Object alternates right/left at mid-height (no bottom drops) and sits large
// so it reaches toward centre — keeping the gap to the copy tight.
// Descending diagonal zig-zag — each waypoint flips sides AND steps down a
// little, so every move is a clear diagonal glide. The object is sized to stay
// fully on screen across the whole descent (no roof/floor clipping), and each
// service's copy is anchored to its waypoint height (see layoutStatements).
// (Mobile overrides this to a centred object — see updateScene.)
const SVC: P[] = [
  { pos: [0.34, 0.15], cam: 4.8, ...BASE, accent: [0.886, 1.0, 0.318] },
  { pos: [-0.34, 0.075], cam: 4.8, ...BASE, accent: [0.5, 1.0, 0.72] },
  { pos: [0.34, 0.0], cam: 4.8, ...BASE, accent: [0.6, 0.95, 1.0] },
  { pos: [-0.34, -0.075], cam: 4.8, ...BASE, accent: [0.55, 0.82, 1.0] },
  { pos: [0.34, -0.15], cam: 4.8, ...BASE, accent: [0.886, 1.0, 0.318] },
];

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export default function ServicesSection() {
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
      uOpen: { value: 0 },
      uComplex: { value: 0 },
      uUI: { value: 0 },
      uCloud: { value: 0 },
      uEmission: { value: 0 },
      uEvolve: { value: 0 },
      uCam: { value: 3.4 },
      uObjOffset: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: new THREE.Color(0.886, 1.0, 0.318) },
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
      section.querySelectorAll<HTMLElement>(".svc-statement"),
    );
    const navItems = Array.from(
      section.querySelectorAll<HTMLElement>(".svc-nav-item"),
    );
    const navBars = navItems.map((n) => n.querySelector<HTMLElement>(".svc-nav-bar"));
    const counter = section.querySelector<HTMLElement>(".svc-counter");
    const progressFill = section.querySelector<HTMLElement>(".svc-progress");

    // Anchor each service's copy to its object waypoint: opposite side, same
    // height (desktop). On mobile, fall back to the centred bottom layout.
    const layoutStatements = () => {
      const mobile = window.innerWidth < 1024;
      statements.forEach((el, idx) => {
        if (mobile) {
          el.style.top = "";
          el.style.bottom = "";
          el.style.left = "";
          el.style.right = "";
          el.style.maxWidth = "";
          el.style.alignItems = "";
          el.style.textAlign = "";
          el.style.transform = "";
        } else {
          const wpY = SVC[idx].pos[1];
          el.style.top = `${(0.5 - wpY) * 100}%`;
          el.style.bottom = "auto";
          el.style.transform = "translateY(-50%)";
          el.style.maxWidth = "24rem";
          el.style.alignItems = "flex-start";
          el.style.textAlign = "left";
          if (SERVICES[idx].side === "right") {
            el.style.right = "7%";
            el.style.left = "auto";
          } else {
            el.style.left = "7%";
            el.style.right = "auto";
          }
        }
      });
    };
    layoutStatements();
    window.addEventListener("resize", layoutStatements);

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

    const N = SVC.length;
    const SEGS = N - 1; // flight segments between the waypoints
    const FLIGHT = 0.84; // services occupy the first 84% of scroll

    const updateScene = (p: number) => {
      // last stretch zooms the object toward the camera to fill the screen
      const finale = smoothstep(FLIGHT, 1.0, p);

      // One continuous, eased flight through every waypoint. The object never
      // holds-then-snaps; it floats the whole time and only decelerates as it
      // nears each capability — that's when the text reveals.
      const fp = clamp(p / FLIGHT, 0, 1);
      const u = fp * SEGS;
      const i = clamp(Math.floor(u), 0, SEGS - 1);
      const f = easeInOut(clamp(u - i, 0, 1));
      const A = SVC[i];
      const B = SVC[i + 1];

      uniforms.uOpen.value = lerp(A.open, B.open, f);
      uniforms.uComplex.value = lerp(A.complex, B.complex, f);
      uniforms.uUI.value = lerp(A.ui, B.ui, f);
      uniforms.uCloud.value = lerp(A.cloud, B.cloud, f);
      uniforms.uEmission.value = lerp(A.emission, B.emission, f);
      uniforms.uEvolve.value = lerp(A.evolve, B.evolve, f);

      // glide position, then pull to centre and zoom in for the finale
      const px = lerp(A.pos[0], B.pos[0], f);
      const py = lerp(A.pos[1], B.pos[1], f);
      const baseCam = lerp(A.cam, B.cam, f);
      if (window.innerWidth < 1024) {
        // narrow screens have no room for side-travel — keep the object
        // centred in the upper area with the copy stacked below it
        uniforms.uObjOffset.value.set(0, lerp(0.34, 0, finale));
        uniforms.uCam.value = lerp(5.0, 1.7, finale);
      } else {
        uniforms.uObjOffset.value.set(lerp(px, 0, finale), lerp(py, 0, finale));
        uniforms.uCam.value = lerp(baseCam, 1.3, finale); // toward the face
      }
      uniforms.uAccent.value.setRGB(
        lerp(A.accent[0], B.accent[0], f),
        lerp(A.accent[1], B.accent[1], f),
        lerp(A.accent[2], B.accent[2], f),
      );
      uniforms.uProgress.value = p;

      // each capability's text reveals as the object settles; cleared on zoom
      const last = N - 1;
      for (let j = 0; j < statements.length; j++) {
        let op = smoothstep(0.42, 0.08, Math.abs(u - j));
        if (j === last) op = Math.max(op, smoothstep(last - 0.42, last, u));
        op *= 1 - finale;
        statements[j].style.opacity = String(op);
      }

      const activeIdx = clamp(Math.round(u), 0, navItems.length - 1);
      for (let j = 0; j < navItems.length; j++) {
        const on = j === activeIdx;
        navItems[j].style.opacity = on ? String(1 - finale) : String(0.3 * (1 - finale));
        const bar = navBars[j];
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
      progress += (readProgress() - progress) * Math.min(1, dt * 3.5);
      current.x += (target.x - current.x) * Math.min(1, dt * 5);
      current.y += (target.y - current.y) * Math.min(1, dt * 5);
      const wantActive = now / 1000 - lastMove < 0.6 ? 1 : 0;
      active += (wantActive - active) * Math.min(1, dt * 3);
      uniforms.uTime.value += dt * timeScale;
      uniforms.uMouse.value.copy(current);
      uniforms.uMouseActive.value = active;
      updateScene(progress);
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
      window.removeEventListener("resize", layoutStatements);
      document.removeEventListener("visibilitychange", onVis);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[560vh] bg-black">
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden text-[#eaf7ee]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {failed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#00272c_0%,#000_70%)]" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 to-transparent" />

        <div className="absolute top-8 left-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#eaf7ee]/55 sm:left-9 lg:left-12">
          <span className="h-px w-8 bg-[#e1ff51]" />
          CAPABILITIES
        </div>
        <div className="absolute top-8 right-6 font-mono text-[10px] tracking-[0.35em] text-[#eaf7ee]/55 sm:right-9 lg:right-12">
          <span className="svc-counter text-[#e1ff51]">01</span> / 05
        </div>

        {/* Per-service copy in the open space opposite the object */}
        {SERVICES.map((s) => (
          <div
            key={s.num}
            className="svc-statement pointer-events-none absolute inset-x-6 bottom-[9%] flex flex-col items-center text-center opacity-0 will-change-[opacity]"
          >
            <div className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] text-[#e1ff51]">
              <span>{s.num}</span>
              <span className="h-px w-6 bg-[#e1ff51]/60" />
              <span>{s.name}</span>
            </div>
            <p className="text-3xl font-bold leading-[1.04] tracking-tight sm:text-4xl lg:text-5xl">
              {s.lead} <span className="text-[#e1ff51]">{s.accent}</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#eaf7ee]/55 lg:max-w-xs">
              {s.desc}
            </p>
            <ul className="mt-6 flex max-w-md flex-wrap justify-center gap-2 lg:justify-start">
              {s.cats.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-[#eaf7ee]/15 px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-[#eaf7ee]/70"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <nav className="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-4 2xl:flex">
          {SERVICES.map((s) => (
            <div
              key={s.num}
              className="svc-nav-item flex items-center gap-3 opacity-30 transition-opacity"
            >
              <span className="relative block h-px w-7 bg-[#eaf7ee]/25">
                <span className="svc-nav-bar absolute inset-0 origin-left scale-x-0 bg-[#e1ff51]" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.22em]">
                {s.num} {s.name}
              </span>
            </div>
          ))}
        </nav>

        <div className="absolute top-1/2 left-6 hidden h-40 w-px -translate-y-1/2 bg-[#eaf7ee]/15 2xl:block">
          <div className="svc-progress absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-[#e1ff51]" />
        </div>
      </div>
    </section>
  );
}
