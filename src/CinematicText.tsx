import { useEffect, useRef } from "react";
import { motionPreference } from "./motion";
import { observeResponsiveEntrance } from "./mobileEntrance";

export type TextDirection =
  | "atelier"
  | "horizon"
  | "energy"
  | "balance"
  | "luxury"
  | "photograph"
  | "finale";

// The DOM is always the finished composition. WAAPI supplies only a temporary
// entrance, so a failed script, interrupted reveal or preference change is safe.
export default function CinematicText({
  lines,
  direction = "atelier",
}: {
  lines: string[];
  direction?: TextDirection;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const content = lines.join("\n");
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = motionPreference();
    let animations: Animation[] = [];
    let generation = 0;
    const stop = () => {
      generation++;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      element.dataset.cinematic = "rest";
    };
    const play = () => {
      stop();
      if (preference.matches || document.hidden) return;
      const run = generation;
      element.dataset.cinematic = "playing";
      const glyphs =
        direction === "energy" ||
        direction === "luxury" ||
        direction === "photograph";
      const targets = element.querySelectorAll<HTMLElement>(
        direction === "atelier" || direction === "finale"
          ? ".cinema-line-body"
          : glyphs
            ? ".cinema-glyph"
            : ".cinema-word",
      );
      animations = Array.from(targets, (target, index) => {
        const start: Record<TextDirection, string> = {
          atelier:
            "perspective(900px) translateY(112%) rotateX(-32deg) rotateZ(2deg)",
          horizon: "translateX(-110%) skewX(-8deg)",
          energy: `translateY(${index % 2 ? 135 : 110}%) rotateZ(${index % 2 ? -9 : 9}deg) scale(1.16)`,
          balance:
            "perspective(900px) translateY(105%) rotateX(-20deg) rotateZ(-3deg)",
          luxury: "translateY(-110%) scale(1.04)",
          photograph: `perspective(900px) translateY(110%) translateZ(${index % 2 ? 90 : -100}px) rotateY(-18deg)`,
          finale:
            "perspective(1200px) translateY(120%) rotateX(-28deg) scale(0.91)",
        };
        return target.animate(
          [
            { transform: start[direction] },
            {
              transform:
                "perspective(1200px) translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) skewX(0) scale(1)",
            },
          ],
          {
            duration:
              direction === "finale"
                ? 1400
                : direction === "balance"
                  ? 1300
                  : 1100,
            delay:
              index *
              (direction === "atelier" || direction === "finale"
                ? 140
                : glyphs
                  ? 35
                  : 65),
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "backwards",
          },
        );
      });
      void Promise.allSettled(
        animations.map((animation) => animation.finished),
      ).then(() => {
        if (generation === run) element.dataset.cinematic = "rest";
      });
    };
    const visibility = observeResponsiveEntrance(element, {
      onEnter: play,
      onExit: stop,
      threshold: 0.16,
    });
    const changed = () => {
      if (preference.matches || document.hidden) stop();
      else if (visibility.visible && innerWidth >= 768) play();
    };
    preference.addEventListener("change", changed);
    document.addEventListener("visibilitychange", changed);
    return () => {
      stop();
      visibility.dispose();
      preference.removeEventListener("change", changed);
      document.removeEventListener("visibilitychange", changed);
    };
  }, [content, direction]);

  return (
    <span className={`cinematic-text cinema-${direction}`} ref={root}>
      {lines.map((line, index) => (
        <span className="cinema-line" key={line}>
          <span className="cinema-line-body">
            {line.split(" ").map((word, i) => (
              <span className="cinema-word-mask" key={`${word}-${i}`}>
                <span className="cinema-word">
                  {direction === "energy" ||
                  direction === "luxury" ||
                  direction === "photograph"
                    ? Array.from(word).map((character, c) => (
                        <span className="cinema-glyph" key={c}>
                          {character}
                        </span>
                      ))
                    : word}
                </span>
                {i < line.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </span>
          {index < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
