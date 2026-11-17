import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import NetworkLines from "./effects/NetworkLines";
import { effectLoop } from "./effectLoop";
type Props = ComponentProps<typeof NetworkLines>;

function CanvasNetwork({
  baseColor = "#406bc9",
  accentColor = "#a1caff",
  linkDistance = 160,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const nodes = Array.from({ length: 85 }, (_, i) => ({
      x: ((i * 173 + 37) % 997) / 997,
      y: ((i * 311 + 71) % 991) / 991,
      vx: Math.sin(i * 2.3) * 0.018,
      vy: Math.cos(i * 1.7) * 0.018,
    }));
    let last = 0;
    const loop = effectLoop(
      canvas,
      (now, running) => {
        const dt = running && last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        const w = canvas.clientWidth,
          h = canvas.clientHeight,
          dpr = Math.min(devicePixelRatio, 1.5);
        if (
          canvas.width !== Math.round(w * dpr) ||
          canvas.height !== Math.round(h * dpr)
        ) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        for (const n of nodes) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        }
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = baseColor;
        const reach = Math.min(linkDistance, w * 0.3);
        for (let i = 0; i < nodes.length; i++)
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i],
              b = nodes[j],
              distance = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
            if (distance >= reach) continue;
            ctx.globalAlpha = (1 - distance / reach) * 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.8;
        for (const n of nodes) {
          ctx.beginPath();
          ctx.arc(n.x * w, n.y * h, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
      () => false,
    );
    return () => loop.dispose();
  }, [baseColor, accentColor, linkDistance]);
  return (
    <canvas
      ref={ref}
      data-renderer="canvas2d"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

export default function NetworkField(props: Props) {
  const [software, setSoftware] = useState(false);
  const unavailable = useCallback(() => setSoftware(true), []);
  return software ? (
    <CanvasNetwork {...props} />
  ) : (
    <NetworkLines {...props} onUnavailable={unavailable} />
  );
}
