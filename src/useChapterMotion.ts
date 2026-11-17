import { useEffect } from "react";
import { motionPreference } from "./motion";
import { observeViewportReplay } from "./viewportReplay";

// Scoped to WandyFitt and Beauté. Each part observes its own viewport arrival;
// this keeps the reading sequence intact on long mobile compositions.
export function useChapterMotion() {
  useEffect(() => {
    const preference = motionPreference();
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>(".project-chapter"),
    );
    const active = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let frame = 0;
    const clear = (element: HTMLElement) => {
      animations.get(element)?.cancel();
      animations.delete(element);
    };
    const update = () => {
      frame = 0;
      if (preference.matches || document.hidden) return;
      active.forEach((chapter) => {
        const rect = chapter.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight,
          ),
        );
        const mobile = innerWidth <= 700;
        const wandy = chapter.dataset.project === "wandyfitt";
        const title = chapter.querySelector<HTMLElement>(".project-title");
        const image = chapter.querySelector<HTMLElement>(
          ".project-image-link:not(.is-panel) > img",
        );
        if (title)
          title.style.transform = `translateY(${progress * (mobile ? 4 : wandy ? 14 : -12)}px)`;
        if (image)
          image.style.transform = `translateY(${progress * (mobile ? -6 : wandy ? -22 : -14)}px) scale(${mobile ? 1.035 : 1.065})`;
      });
    };
    const schedule = () => {
      if (!frame && active.size) frame = requestAnimationFrame(update);
    };
    const observers = chapters.flatMap((chapter) => {
      const wandy = chapter.dataset.project === "wandyfitt";
      const visual = chapter.querySelector<HTMLElement>(".project-visual");
      const caption = chapter.querySelector<HTMLElement>(".project-caption");
      const triggers = [
        observeViewportReplay(chapter, {
          threshold: 0.08,
          onEnter() {
            active.add(chapter);
            schedule();
          },
          onExit() {
            active.delete(chapter);
          },
        }),
      ];
      if (visual)
        triggers.push(
          observeViewportReplay(visual, {
            threshold: 0.08,
            onEnter() {
              clear(visual);
              if (preference.matches || document.hidden) return;
              animations.set(
                visual,
                visual.animate(
                  [
                    {
                      clipPath: wandy
                        ? "inset(0 24% 14% 0)"
                        : "inset(16% 0 16% 0)",
                      transform: wandy
                        ? "perspective(1200px) translateX(-32px) rotateY(5deg) scale(0.97)"
                        : "translateY(30px) scale(1.025)",
                    },
                    {
                      clipPath: "inset(0% 0% 0% 0%)",
                      transform:
                        "perspective(1200px) translate3d(0,0,0) rotateY(0deg) scale(1)",
                    },
                  ],
                  {
                    duration: wandy ? 1150 : 1450,
                    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
                    fill: "backwards",
                  },
                ),
              );
            },
            onExit() {
              clear(visual);
            },
          }),
        );
      if (caption)
        triggers.push(
          observeViewportReplay(caption, {
            onEnter() {
              clear(caption);
              if (preference.matches || document.hidden) return;
              animations.set(
                caption,
                caption.animate(
                  [
                    {
                      transform: `translate${wandy ? "X" : "Y"}(24px)`,
                      opacity: 0.35,
                    },
                    { transform: "translate3d(0,0,0)", opacity: 1 },
                  ],
                  {
                    duration: 800,
                    delay: 100,
                    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
                    fill: "backwards",
                  },
                ),
              );
            },
            onExit() {
              clear(caption);
            },
          }),
        );
      return triggers;
    });
    const reset = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      chapters.forEach((chapter) =>
        chapter
          .querySelectorAll<HTMLElement>(
            ".project-title, .project-image-link > img",
          )
          .forEach((el) => el.style.removeProperty("transform")),
      );
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", reset);
    preference.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      active.clear();
      cancelAnimationFrame(frame);
      observers.forEach((observer) => observer.dispose());
      reset();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", reset);
      preference.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);
}
