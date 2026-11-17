import { useEffect } from "react";
import { motionPreference } from "./motion";
import { observeViewportReplay } from "./viewportReplay";

export function useProjectMotion() {
  useEffect(() => {
    const preference = motionPreference();
    const visuals = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".project:not(.project-chapter) .project-visual",
      ),
    );
    const active = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let frame = 0;
    const update = () => {
      frame = 0;
      if (preference.matches || innerWidth < 1000 || document.hidden) return;
      active.forEach((visual) => {
        const image = visual.querySelector<HTMLElement>(
          ".project-image-link:not(.is-panel) > img:not([aria-hidden])",
        );
        if (!image) return;
        const bounds = visual.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (bounds.top + bounds.height / 2 - innerHeight / 2) / innerHeight,
          ),
        );
        image.style.transform = `translateY(${progress * -14}px) scale(1.045)`;
      });
    };
    const schedule = () => {
      if (!frame && active.size) frame = requestAnimationFrame(update);
    };
    const observers = visuals.map((visual) =>
      observeViewportReplay(visual, {
        threshold: 0.08,
        onEnter() {
          active.add(visual);
          if (!preference.matches && !document.hidden) {
            const id = visual.closest<HTMLElement>(".project")?.dataset.project;
            const masks: Record<string, string> = {
              wandyfitt: "inset(12% 38% 12% 0)",
              ares: "inset(18% 0 18% 0 round 40% 40% 0 0)",
              beaute: "inset(0 49% 0 49%)",
              alanna: "inset(8% 8% 8% 8%)",
            };
            animations.get(visual)?.cancel();
            animations.set(
              visual,
              visual.animate(
                [
                  {
                    clipPath: masks[id || ""] || "inset(10%)",
                    transform:
                      id === "alanna"
                        ? "rotateZ(-2deg) scale(0.96)"
                        : "translateY(32px) scale(0.97)",
                  },
                  {
                    clipPath: "inset(0% 0% 0% 0% round 0% 0% 0% 0%)",
                    transform: "translateY(0) rotateZ(0) scale(1)",
                  },
                ],
                {
                  duration: id === "ares" ? 1400 : 1200,
                  easing: "cubic-bezier(0.23, 1, 0.32, 1)",
                  fill: "backwards",
                },
              ),
            );
          }
          schedule();
        },
        onExit() {
          active.delete(visual);
          animations.get(visual)?.cancel();
          animations.delete(visual);
        },
      }),
    );
    const reset = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      visuals.forEach((visual) =>
        visual
          .querySelectorAll<HTMLElement>(".project-image-link > img")
          .forEach((image) => image.style.removeProperty("transform")),
      );
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", reset);
    preference.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      cancelAnimationFrame(frame);
      observers.forEach((observer) => observer.dispose());
      reset();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", reset);
      preference.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);
}
