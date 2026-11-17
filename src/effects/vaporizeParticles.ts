// Particle algorithms adapted directly from the supplied Originkit TextVaporize.tsx.
// Original preserved in amadeitech-efeitos-titulos; licensing: THIRD_PARTY.md.
export type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  r: number;
  g: number;
  b: number;
  opacity: number;
  originalAlpha: number;
  angle: number;
  speed: number;
  start: number;
  driftX: number;
  driftY: number;
  wobble: number;
  scatterX: number;
  scatterY: number;
  shouldFadeQuickly: boolean;
};
export type ParticleCanvas = HTMLCanvasElement & { particleSize?: number };
export type Boundaries = { left: number; right: number; width: number };
const DRIFT_REACH = 45;
const SWEEP_SPAN = 0.6;
export const createParticles = (
  ctx: CanvasRenderingContext2D,
  canvas: ParticleCanvas,
  text: string,
  textX: number,
  textY: number,
  font: string,
  color: string,
  alignment: CanvasTextAlign,
) => {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment;
  ctx.textBaseline = "middle";
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;
  if (ctx.fontKerning) ctx.fontKerning = "normal";
  if (ctx.textRendering) ctx.textRendering = "geometricPrecision";
  const metrics = ctx.measureText(text);
  let textLeft;
  const textWidth = metrics.width;
  if (alignment === "center") {
    textLeft = textX - textWidth / 2;
  } else if (alignment === "left") {
    textLeft = textX;
  } else {
    textLeft = textX - textWidth;
  }
  const textBoundaries = {
    left: textLeft,
    right: textLeft + textWidth,
    width: textWidth,
  };
  ctx.fillText(text, textX, textY);
  const ascent = metrics.actualBoundingBoxAscent || 60;
  const descent = metrics.actualBoundingBoxDescent || 20;
  const pad = 4;
  const x0 = Math.max(0, Math.floor(textLeft - pad));
  const y0 = Math.max(0, Math.floor(textY - ascent - pad));
  const x1 = Math.min(canvas.width, Math.ceil(textLeft + textWidth + pad));
  const y1 = Math.min(canvas.height, Math.ceil(textY + descent + pad));
  const boxW = Math.max(1, x1 - x0);
  const boxH = Math.max(1, y1 - y0);
  const data = ctx.getImageData(x0, y0, boxW, boxH).data;
  const currentDPR = canvas.width / parseInt(canvas.style.width);
  const sampleRate = Math.max(1, Math.round(currentDPR));
  canvas.particleSize = sampleRate;
  for (let y = 0; y < boxH; y += sampleRate) {
    for (let x = 0; x < boxW; x += sampleRate) {
      const index = (y * boxW + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255;
        particles.push({
          x: x0 + x,
          y: y0 + y,
          originalX: x0 + x,
          originalY: y0 + y,
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          opacity: originalAlpha,
          originalAlpha,
          angle: 0,
          speed: 0,
          start: 0,
          driftX: 0,
          driftY: 0,
          wobble: 0,
          scatterX: 0,
          scatterY: 0,
          shouldFadeQuickly: false,
        });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
};

export const updateParticles = (
  particles: Particle[],
  progress: number,
  MULTIPLIED_VAPORIZE_SPREAD: number,
  density: number,
) => {
  let allParticlesVaporized = true;
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const shouldVaporize = progress >= (particle.start ?? 0);
    if (shouldVaporize) {
      if (particle.speed === 0) {
        particle.angle = Math.random() * Math.PI * 2;
        particle.speed = 0.5 + Math.random();
        const reach = particle.speed * MULTIPLIED_VAPORIZE_SPREAD * DRIFT_REACH;
        particle.driftX = Math.cos(particle.angle) * reach;
        particle.driftY = Math.sin(particle.angle) * reach * 0.6;
        particle.wobble = (Math.random() - 0.5) * 2;
        particle.shouldFadeQuickly = Math.random() > density;
      }
      const local = localProgress(progress, particle.start ?? 0);
      const fade = particle.shouldFadeQuickly ? Math.min(1, local * 2) : local;
      particle.opacity = particle.originalAlpha * (1 - fade);
      const travel = local * (2 - local);
      const wobble =
        Math.sin(local * Math.PI * 3 + particle.angle) *
        particle.wobble *
        MULTIPLIED_VAPORIZE_SPREAD *
        4 *
        local;
      particle.x = particle.originalX + particle.driftX * travel + wobble;
      particle.y = particle.originalY + particle.driftY * travel;
      if (particle.opacity > 0.01) {
        allParticlesVaporized = false;
      }
    } else {
      allParticlesVaporized = false;
    }
  }
  return allParticlesVaporized;
};

export const renderParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  globalDpr: number,
  bufferRef: { current: ImageData | null },
  canvas: ParticleCanvas,
) => {
  const w = canvas.width;
  const h = canvas.height;
  if (w <= 0 || h <= 0) return;
  let buf = bufferRef.current;
  if (!buf || buf.width !== w || buf.height !== h) {
    buf = ctx.createImageData(w, h);
    bufferRef.current = buf;
  }
  const data = buf.data;
  data.fill(0);
  const size = Math.max(1, canvas.particleSize || Math.round(globalDpr));
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const a = p.opacity;
    if (a <= 0.01) continue;
    const alpha = a > 1 ? 255 : (a * 255) | 0;
    const px = p.x | 0;
    const py = p.y | 0;
    for (let dy = 0; dy < size; dy++) {
      const y = py + dy;
      if (y < 0 || y >= h) continue;
      let idx = (y * w + px) * 4;
      for (let dx = 0; dx < size; dx++) {
        const x = px + dx;
        if (x >= 0 && x < w) {
          data[idx] = p.r;
          data[idx + 1] = p.g;
          data[idx + 2] = p.b;
          data[idx + 3] = alpha;
        }
        idx += 4;
      }
    }
  }
  ctx.putImageData(buf, 0, 0);
};

export const assignStarts = (
  particles: Particle[],
  boundaries: Boundaries,
  order: string,
) => {
  const width = boundaries?.width || 1;
  const left = boundaries?.left ?? 0;
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (order === "together") {
      particle.start = 0;
      continue;
    }
    const frac = Math.max(0, Math.min(1, (particle.originalX - left) / width));
    particle.start = (order === "right-to-left" ? 1 - frac : frac) * SWEEP_SPAN;
  }
};

export const localProgress = (e: number, start = 0) => {
  const span = 1 - start;
  if (span <= 0) return e >= start ? 1 : 0;
  return Math.max(0, Math.min(1, (e - start) / span));
};

export const assignScatter = (particles: Particle[], spread: number) => {
  const reach = Math.max(20, spread * 60);
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.4 + Math.random() * 0.6) * reach;
    particle.scatterX = particle.originalX + Math.cos(angle) * dist;
    particle.scatterY = particle.originalY + Math.sin(angle) * dist * 0.5;
  }
};

export const resetParticles = (particles: Particle[]) => {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x = p.originalX;
    p.y = p.originalY;
    p.opacity = p.originalAlpha;
    p.speed = 0;
    p.driftX = 0;
    p.driftY = 0;
  }
};

// ------------------------------------------------------------ //
// CALCULATE VAPORIZE SPREAD
// ------------------------------------------------------------ //
export const calculateVaporizeSpread = (fontSize: number) => {
  const size = fontSize;
  const points = [
    { size: 20, spread: 0.2 },
    { size: 50, spread: 0.5 },
    { size: 100, spread: 1.5 },
  ];
  if (size <= points[0].size) return points[0].spread;
  if (size >= points[points.length - 1].size)
    return points[points.length - 1].spread;
  let i = 0;
  while (i < points.length - 1 && points[i + 1].size < size) i++;
  const p1 = points[i];
  const p2 = points[i + 1];
  return (
    p1.spread +
    ((size - p1.size) * (p2.spread - p1.spread)) / (p2.size - p1.size)
  );
};

export function cubicBezierEase(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p: number) => {
    let t = p;
    for (let i = 0; i < 8; i++) {
      const x = sampleX(t) - p;
      const d = dX(t);
      if (Math.abs(x) < 1e-4 || Math.abs(d) < 1e-6) break;
      t -= x / d;
    }
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return sampleY(t);
  };
}
