import { useEffect, useRef } from "react";
import { effectLoop } from "../effectLoop";
import { motionPreference } from "../motion";
import { observeViewportReplay } from "../viewportReplay";
import {
  createParticles,
  updateParticles,
  renderParticles,
  assignStarts,
  assignScatter,
  resetParticles,
  localProgress,
  calculateVaporizeSpread,
  cubicBezierEase,
} from "./vaporizeParticles";
import type { Particle, ParticleCanvas } from "./vaporizeParticles";

// Originkit's original particle phase machine and raster algorithms, with a
// semantic responsive heading, bounded canvas and the site's shared lifecycle.
const lines = ["Criamos o que", "vem depois."];
const easeOut = cubicBezierEase(0, 0, 0.58, 1);
export default function TextVaporize() {
  const heading = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = heading.current;
    const canvas = canvasRef.current as ParticleCanvas | null;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const media = motionPreference();
    let particles: Particle[] = [];
    let phase: "hold" | "out" | "in" = "hold";
    let time = 0,
      previous = 0,
      spread = 1,
      dpr = 1;
    let disposed = false,
      ready = false,
      needsSample = true,
      renderedHold = false,
      replayPending = true;
    const buffer = { current: null as ImageData | null };

    function sample() {
      if (!el || !canvas || !ctx) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      const pad = 30;
      canvas.width = Math.round((rect.width + pad * 2) * dpr);
      canvas.height = Math.round((rect.height + pad * 2) * dpr);
      canvas.style.width = `${rect.width + pad * 2}px`;
      canvas.style.height = `${rect.height + pad * 2}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      buffer.current = null;
      particles = [];
      const font = `${style.fontWeight} ${fontSize * dpr}px ${style.fontFamily}`;
      ctx.font = font;
      ctx.letterSpacing = `${parseFloat(style.letterSpacing) * dpr || 0}px`;
      ctx.textBaseline = "alphabetic";
      const alphabetic = ctx.measureText("Hg");
      ctx.textBaseline = "middle";
      const middle = ctx.measureText("Hg");
      const middleOffset =
        alphabetic.actualBoundingBoxAscent - middle.actualBoundingBoxAscent;
      const lineHeight = parseFloat(style.lineHeight) * dpr;
      const baseline =
        (lineHeight -
          alphabetic.fontBoundingBoxAscent -
          alphabetic.fontBoundingBoxDescent) /
          2 +
        alphabetic.fontBoundingBoxAscent;
      el.querySelectorAll<HTMLElement>(".vaporize-line").forEach((line) => {
        const bounds = line.getBoundingClientRect();
        const x = (bounds.left - rect.left + pad) * dpr;
        const y = (bounds.top - rect.top + pad) * dpr + baseline - middleOffset;
        const sampled = createParticles(
          ctx,
          canvas,
          line.textContent || "",
          x,
          y,
          font,
          style.color,
          "left",
        );
        particles.push(...sampled.particles);
      });
      // Keep drift within the heading's local 30px bleed, independent of DPR.
      spread = Math.min(0.32, calculateVaporizeSpread(fontSize) * 0.4) * dpr;
      phase = "hold";
      time = 0;
      renderedHold = false;
      previous = 0;
      ready = particles.length > 0;
      el.dataset.vaporizeReady = String(ready);
      needsSample = false;
    }
    function setPhase(next: typeof phase) {
      phase = next;
      time = 0;
      renderedHold = false;
      resetParticles(particles);
      if (next !== "hold")
        assignStarts(
          particles,
          {
            left: 30 * dpr,
            right: canvas!.width - 30 * dpr,
            width: canvas!.width - 60 * dpr,
          },
          "left-to-right",
        );
      if (next === "in") assignScatter(particles, spread);
    }
    // Size and reveal the canvas before observing it: a display:none canvas
    // has no intersection and cannot bootstrap its own first render.
    sample();
    const loop = effectLoop(
      canvas,
      (now, running) => {
        if (needsSample) sample();
        if (!ready) return;
        if (!running) {
          resetParticles(particles);
          phase = "hold";
          time = 0;
          previous = 0;
          renderedHold = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          el.dataset.vaporizePhase = "reduced";
          return;
        }
        if (replayPending) {
          setPhase("in");
          previous = 0;
          replayPending = false;
        }
        const dt = previous ? Math.min((now - previous) / 1000, 0.07) : 0;
        previous = now;
        time += dt;
        el.dataset.vaporizePhase = phase;
        if (phase === "hold") {
          if (!renderedHold) {
            renderParticles(ctx, particles, dpr, buffer, canvas);
            renderedHold = true;
          }
          if (time >= 3.6) setPhase("out");
        } else if (phase === "out") {
          const p = Math.min(1, time / 1.65);
          updateParticles(particles, easeOut(p), spread, 0.92);
          renderParticles(ctx, particles, dpr, buffer, canvas);
          if (p >= 1) setPhase("in");
        } else {
          const p = Math.min(1, time / 1.4),
            e = easeOut(p);
          for (const particle of particles) {
            const local = localProgress(e, particle.start);
            particle.x =
              particle.scatterX +
              (particle.originalX - particle.scatterX) * local;
            particle.y =
              particle.scatterY +
              (particle.originalY - particle.scatterY) * local;
            particle.opacity = particle.originalAlpha * local;
          }
          renderParticles(ctx, particles, dpr, buffer, canvas);
          if (p >= 1) setPhase("hold");
        }
      },
      () => false,
    );
    function resize() {
      needsSample = true;
      loop.schedule();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const visibility = observeViewportReplay(el, {
      onEnter() {
        replayPending = true;
        previous = 0;
        loop.schedule();
      },
      onExit() {
        previous = 0;
      },
    });
    function hidden() {
      previous = 0;
    }
    document.addEventListener("visibilitychange", hidden);
    function preferenceChanged() {
      previous = 0;
      if (media.matches) {
        resetParticles(particles);
        phase = "hold";
        time = 0;
      }
      loop.schedule();
    }
    media.addEventListener("change", preferenceChanged);
    void document.fonts.ready.then(() => {
      if (!disposed) resize();
    });
    return () => {
      disposed = true;
      loop.dispose();
      observer.disconnect();
      visibility.dispose();
      media.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", hidden);
      delete el.dataset.vaporizeReady;
    };
  }, []);
  return (
    <h1 className="vaporize-heading" ref={heading}>
      <span className="vaporize-source">
        {lines.map((line, i) => (
          <span className="vaporize-line" key={line}>
            {line}
            {i === 0 ? " " : ""}
          </span>
        ))}
      </span>
      <canvas ref={canvasRef} className="vaporize-canvas" aria-hidden="true" />
    </h1>
  );
}
