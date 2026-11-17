import { useEffect, useRef } from "react";
import { motionPreference } from "./motion";

// Continuous identity motion pauses/resumes; it does not replay like an entrance.
// CSS rotates two small layers. No canvas, per-frame JS or pointer interception.
export default function OrionOrbit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const preference = motionPreference();
    let visible = false;
    const sync = () => {
      field.dataset.running = String(
        visible && !document.hidden && !preference.matches,
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(field.parentElement || field);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <span
      className="orion-orbit"
      ref={ref}
      aria-hidden="true"
      data-running="false"
    >
      <span className="orion-orbit-plane">
        <span className="orion-orbit-spin" />
      </span>
      <span className="orion-orbit-plane orion-orbit-plane-secondary">
        <span className="orion-orbit-spin" />
      </span>
    </span>
  );
}
