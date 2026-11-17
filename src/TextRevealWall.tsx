import { useEffect, useRef } from "react";
import { effectLoop } from "./effectLoop";
import { observeViewportReplay } from "./viewportReplay";

// Adapted from Originkit's TextWall: fixed glyph cells, reverse sweep,
// staggered reveal/settle, hold and dissolve. Canvas replaces per-frame HTML
// rewrites and GSAP/Framer imports; the heading remains semantic and readable.
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const words = ["DESIGN", "CÓDIGO", "CONEXÃO", "AMADEITECH"];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};

export default function TextRevealWall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let time = 0;
    let previous = 0;
    const loop = effectLoop(
      canvas,
      (now, running) => {
        if (running && previous) time += Math.min(now - previous, 70);
        previous = now;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const dpr = Math.min(devicePixelRatio, 1.5);
        if (
          canvas.width !== Math.round(width * dpr) ||
          canvas.height !== Math.round(height * dpr)
        ) {
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.font = '500 15px "Barlow", sans-serif';
        ctx.textBaseline = "middle";
        const glyphWidth = Math.max(
          9,
          ctx.measureText(alphabet).width / alphabet.length,
        );
        const columns = Math.max(22, Math.floor(width / glyphWidth));
        const cell = width / columns;
        const cycle = (time % 9800) / 1000;
        words.forEach((word, row) => {
          const phase = cycle - row * 0.14;
          const reveal = running
            ? ease(phase / 1.25) - ease((phase - 5.75) / 1.25)
            : 1;
          const settle = running
            ? ease((phase - 0.6) / 1.25) - ease((phase - 5.15) / 1.25)
            : 1;
          const start = Math.round(
            (columns - word.length) * [0.08, 0.68, 0.3, 0.86][row],
          );
          const y = 12 + row * 23;
          ctx.save();
          ctx.beginPath();
          ctx.rect(width * (1 - reveal), y - 11, width * reveal, 23);
          ctx.clip();
          ctx.fillStyle = "#8eaef3";
          ctx.fillText(word, start * cell, y);
          ctx.restore();
          for (let i = 0; i < columns; i++) {
            const progress = (columns - i) / columns;
            if (progress > reveal) continue;
            if (i >= start && i < start + word.length) {
              continue;
            } else if (progress > settle) {
              ctx.fillStyle = "#749ce64d";
              ctx.fillText(
                alphabet[
                  (i * 17 + row * 7 + Math.floor(time / 110)) % alphabet.length
                ],
                i * cell,
                y,
              );
            }
          }
        });
      },
      () => false,
    );
    const visibility = observeViewportReplay(canvas, {
      onEnter() {
        time = 0;
        previous = 0;
        loop.schedule();
      },
      onExit() {
        previous = 0;
      },
    });
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (!disposed) loop.schedule();
    });
    return () => {
      disposed = true;
      visibility.dispose();
      loop.dispose();
    };
  }, []);
  return <canvas ref={ref} className="text-reveal-wall" aria-hidden="true" />;
}
