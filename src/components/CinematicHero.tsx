"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * A real-time, GPU-raymarched "living structure".
 *
 * The entire object is a signed-distance field evaluated per-pixel in a custom
 * fragment shader: an evolving lattice-sphere with a pulsing inner core,
 * volumetric haze, soft shadows, ambient occlusion and cursor-driven ripples.
 * No meshes, no particles — pure math on the GPU.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uMouse;        // -1..1
  uniform float uMouseActive;  // 0..1
  varying vec2  vUv;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  float smin(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
  }

  float gTime;
  vec2  gMouse;
  float gAmt;

  // The living structure as a signed distance field.
  float map(vec3 p){
    // slow, cursor-biased rotation of the whole organism
    p.xz *= rot(gTime*0.12 + gMouse.x*0.8);
    p.xy *= rot(gTime*0.08 + gMouse.y*0.5);

    // breathing radius
    float r = 1.0 + 0.05*sin(gTime*0.8);
    float sphere = length(p) - r;

    // domain warp gives the surface a living, fluid quality
    vec3 q = p + 0.10*sin(p.yzx*3.0 + gTime*0.6);

    // gyroid lattice whose thickness pulses -> the shell opens, collapses,
    // and reconstructs over time
    float sc = 3.2;
    vec3  pp = q*sc;
    float th = 0.55 + 0.35*sin(gTime*0.45);
    float lat = abs(dot(sin(pp), cos(pp.zxy)))/sc - th/sc;

    // carve a thin shell, then perforate it with the lattice
    float shell = max(abs(sphere) - 0.06, -lat);
    float d = shell;

    // pulsing inner core glowing through the lattice
    float core = length(p) - (0.5 + 0.08*sin(gTime*1.2));
    d = smin(d, core, 0.25);

    // a wave that ripples across the surface from the cursor
    float md = length(p.xy - gMouse*1.1);
    d += 0.025*sin(md*14.0 - gTime*5.0)*exp(-md*1.8)*gAmt;

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
    for(int i=0;i<18;i++){
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
      float d  = map(p + n*hr);
      occ += (hr - d)*sca;
      sca *= 0.82;
    }
    return clamp(1.0 - 1.6*occ, 0.0, 1.0);
  }

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.13, 289.7)))*43758.5453); }

  void main(){
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5*uResolution) / uResolution.y;

    gTime = uTime;
    gMouse = uMouse;
    gAmt  = uMouseActive;

    // camera with subtle cursor parallax for depth
    vec3 ro = vec3(uMouse.x*0.25, uMouse.y*0.2, 3.25);
    vec3 fwd = normalize(vec3(0.0) - ro);
    vec3 rgt = normalize(cross(vec3(0.0,1.0,0.0), fwd));
    vec3 upv = cross(fwd, rgt);
    vec3 rd  = normalize(uv.x*rgt + uv.y*upv + 1.6*fwd);

    float t = 0.0, glow = 0.0;
    bool hit = false;
    vec3 p = ro;
    for(int i=0;i<90;i++){
      p = ro + rd*t;
      float d = map(p);
      glow += 0.016 / (1.0 + d*d*40.0);   // volumetric proximity haze
      if(d < 0.0012){ hit = true; break; }
      t += d*0.8;
      if(t > 7.0) break;
    }

    vec3 lime = vec3(0.886, 1.0, 0.318);  // #e1ff51
    vec3 teal = vec3(0.0, 0.153, 0.173);  // #00272c

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

      col  = vec3(0.015, 0.03, 0.035) * occ;          // obsidian ambient
      col += vec3(0.55, 0.72, 0.78) * dif * sh * 0.55; // cool key light
      col += teal * 1.4 * (0.4 + 0.6*dif) * occ;       // teal body
      col += teal * 0.4 * bdif;                         // teal fill from behind
      col += lime * fres * 1.3 * occ;                  // lime rim energy
      col += lime * spec * sh * 1.2;                   // lime specular spark
    }

    // atmospheric halo around the silhouette
    vec3 glowCol = mix(teal, lime, clamp(glow*0.6, 0.0, 1.0));
    col += glowCol * glow * 0.9;

    // faint teal vignette glow in the void
    float vig = smoothstep(1.3, 0.2, length(uv));
    col += teal * 0.06 * vig * (1.0 - float(hit));

    // filmic tone map + gamma
    col = col / (col + vec3(0.9));
    col = pow(col, vec3(0.4545));

    // cinematic vignette
    col *= smoothstep(1.5, 0.4, length(uv * vec2(0.9, 1.0)));

    // dithering kills banding on the dark gradients
    col += (hash(fragCoord) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = root.current;
    if (!canvas || !container) return;

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
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeScale = prefersReduced ? 0.15 : 1;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Render at a sane resolution: never oversample retina, cap large screens
      const cap = Math.min(1, 1600 / Math.max(w, h));
      const scale = cap * Math.min(window.devicePixelRatio || 1, 1);
      const bw = Math.max(1, Math.round(w * scale));
      const bh = Math.max(1, Math.round(h * scale));
      renderer.setSize(bw, bh, false);
      uniforms.uResolution.value.set(bw, bh);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Pointer interaction
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

    let raf = 0;
    let last = performance.now();
    let running = true;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      current.x += (target.x - current.x) * Math.min(1, dt * 6);
      current.y += (target.y - current.y) * Math.min(1, dt * 6);
      const wantActive = now / 1000 - lastMove < 0.6 ? 1 : 0;
      active += (wantActive - active) * Math.min(1, dt * 3);

      uniforms.uTime.value += dt * timeScale;
      uniforms.uMouse.value.copy(current);
      uniforms.uMouseActive.value = active;

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useGSAP(
    () => {
      gsap.set(".cin-canvas", { autoAlpha: 0 });
      gsap.set(".cin-fade", { autoAlpha: 0, y: 22 });
      gsap.set(".cin-line", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".cin-canvas", { autoAlpha: 1, duration: 1.8 }, 0)
        .to(".cin-line", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.5)
        .to(".cin-fade", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.6);

      gsap.to(".cin-arrow", {
        y: 7,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      className="relative h-svh w-full overflow-hidden bg-black text-[#eaf7ee]"
    >
      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="cin-canvas absolute inset-0 h-full w-full"
      />

      {/* Fallback if WebGL is unavailable */}
      {failed && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#00272c_0%,#000_70%)]" />
      )}

      {/* Edge darkening for cinematic finish */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
      {/* Legibility scrims behind the typography (don't touch the WebGL) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-9 lg:p-12">
        {/* Top bar */}
        <header className="flex items-start justify-between">
          <div className="cin-fade flex items-start gap-0.5">
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              NEXORA
            </span>
            <span className="mt-1 font-mono text-[10px]">™</span>
          </div>
          <button
            aria-label="Open menu"
            className="cin-fade group pointer-events-auto flex cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.25em] outline-none sm:text-sm"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="h-px w-6 bg-[#eaf7ee] transition-colors group-hover:bg-[#e1ff51]" />
              <span className="h-px w-6 bg-[#eaf7ee] transition-colors group-hover:bg-[#e1ff51]" />
            </span>
            <span className="transition-colors group-hover:text-[#e1ff51]">
              MENU
            </span>
          </button>
        </header>

        {/* Bottom block */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-5xl">
            <div className="cin-fade mb-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#e1ff51] sm:text-xs">
              <span className="cin-line h-px w-10 bg-[#e1ff51]" />
              NEXORA — DIGITAL ENGINEERING
            </div>
            <h1 className="cin-fade text-balance text-5xl font-bold leading-[0.92] tracking-[-0.03em] sm:text-7xl lg:text-8xl xl:text-9xl">
              We build{" "}
              <span className="text-[#e1ff51]">impossible</span>
              <br className="hidden sm:block" /> digital experiences.
            </h1>
          </div>

          {/* Scroll cue */}
          <div className="cin-fade flex shrink-0 items-center gap-4 self-start lg:flex-col lg:items-end lg:self-end">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#eaf7ee]/55">
              SCROLL
            </span>
            <span className="cin-arrow text-lg text-[#e1ff51]">↓</span>
          </div>
        </div>
      </div>
    </main>
  );
}
