import { useEffect, useRef } from "react";
import { motionPreference } from "../motion";
import { observeViewportReplay } from "../viewportReplay";

// Originkit 3DStaggerFlip: preserve the two faces and their 1lh cube geometry.
// WAAPI replaces useAnimate; spring samples retain damping=30, stiffness=300,
// mass=1 from the supplied source without adding Framer Motion to the site.
const resting = "translateZ(-0.5lh) rotateX(0deg)";
const springFrames = Array.from({ length: 61 }, (_, i) => {
  const t = (i / 60) * 0.7;
  const w = Math.sqrt(300 - 15 * 15);
  const progress =
    i === 60
      ? 1
      : 1 - Math.exp(-15 * t) * (Math.cos(w * t) + (15 / w) * Math.sin(w * t));
  return {
    transform: `translateZ(-0.5lh) rotateX(${progress * 90}deg)`,
    offset: i / 60,
  };
});

export default function StaggerFlip({ text }: { text: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = heading.current;
    if (!el) return;
    const reduced = motionPreference();
    const chars = Array.from(
      el.querySelectorAll<HTMLElement>(".text-3d-flip-char"),
    );
    let animations: Animation[] = [];
    let active = false;
    let disposed = false;
    let run = 0;
    function reset() {
      run++;
      animations.forEach((a) => a.cancel());
      animations = [];
      active = false;
      el!.dataset.flip = "rest";
    }
    async function play() {
      if (
        disposed ||
        active ||
        reduced.matches ||
        document.hidden ||
        !visibility.visible
      )
        return;
      active = true;
      const currentRun = ++run;
      el!.dataset.flip = "playing";
      animations = chars.map((char, index) =>
        char.animate(springFrames, {
          duration: 700,
          delay: index * 50,
          fill: "both",
          easing: "linear",
        }),
      );
      await Promise.allSettled(animations.map((a) => a.finished));
      if (!disposed && active && run === currentRun) reset();
    }
    const visibility = observeViewportReplay(el, {
      onEnter: () => {
        void play();
      },
      onExit: reset,
      threshold: 0.5,
    });
    function hover(event: PointerEvent) {
      if (
        event.pointerType === "mouse" &&
        matchMedia("(hover: hover) and (pointer: fine)").matches
      )
        void play();
    }
    function preferenceChanged() {
      if (reduced.matches) reset();
      else if (visibility.visible) void play();
    }
    function hidden() {
      if (document.hidden) reset();
    }
    el.addEventListener("pointerenter", hover);
    reduced.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      disposed = true;
      reset();
      visibility.dispose();
      el.removeEventListener("pointerenter", hover);
      reduced.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [text]);
  return (
    <h2 ref={heading} className="stagger-flip" aria-label={text}>
      {text.split(" ").map((word, index, words) => (
        <span className="flip-word" aria-hidden="true" key={index}>
          {Array.from(word).map((char, i) => (
            <span
              className="text-3d-flip-char"
              style={{ transform: resting }}
              key={i}
            >
              <span className="flip-front">{char}</span>
              <span className="flip-second">{char}</span>
            </span>
          ))}
          {index < words.length - 1 && <span className="flip-space"> </span>}
        </span>
      ))}
    </h2>
  );
}
