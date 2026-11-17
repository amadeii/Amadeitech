import { motionPreference } from "./motion";

// Canvas effects share a bounded lifecycle, without React updates per frame.
export function effectLoop(
  canvas: HTMLCanvasElement,
  draw: (now: number, running: boolean) => void,
  paused: () => boolean,
) {
  const media = motionPreference();
  let visible = false;
  let frame = 0;
  let last = 0;
  let disposed = false;
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const running = !media.matches && !paused();
    if (running && now - last < 1000 / 30) {
      frame = requestAnimationFrame(render);
      return;
    }
    last = now;
    draw(now, running);
    if (running) schedule();
  }
  function schedule() {
    if (!disposed && !frame && visible && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(canvas);
  const resize = new ResizeObserver(schedule);
  resize.observe(canvas);
  document.addEventListener("visibilitychange", schedule);
  media.addEventListener("change", schedule);
  return {
    schedule,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", schedule);
    },
  };
}
