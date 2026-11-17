import { useEffect, useRef } from "react";
import { founder } from "./content";
import { motionPreference } from "./motion";
import { observeResponsiveEntrance } from "./mobileEntrance";

export default function FounderPortrait() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const preference = motionPreference();
    let animations: Animation[] = [];
    const stop = () => {
      animations.forEach((a) => a.cancel());
      animations = [];
    };
    const observer = observeResponsiveEntrance(el, {
      onEnter() {
        stop();
        if (preference.matches || document.hidden) return;
        const image = el.querySelector<HTMLElement>(".portrait-image")!;
        animations = [
          ...Array.from(el.querySelectorAll("path"), (path, i) =>
            path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
              duration: 1100,
              delay: i * 80,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "backwards",
            }),
          ),
          image.animate(
            [
              {
                clipPath: "inset(100% 0 0 0)",
                transform: "perspective(1000px) rotateY(-5deg) scale(1.025)",
              },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                transform: "perspective(1000px) rotateY(0deg) scale(1)",
              },
            ],
            {
              duration: 1300,
              delay: 180,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "backwards",
            },
          ),
        ];
      },
      onExit: stop,
    });
    preference.addEventListener("change", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stop();
      observer.dispose();
      preference.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);
  return (
    <div className="founder-portrait portrait-editorial" ref={ref}>
      <div className="portrait-backplane" aria-hidden="true" />
      <div className="portrait-image">
        {founder.photo && (
          <img
            src={founder.photo}
            alt={`Retrato de ${founder.name || founder.signature}`}
            width="1086"
            height="1448"
            loading="lazy"
          />
        )}
      </div>
      <svg
        className="portrait-contour"
        viewBox="0 0 400 520"
        fill="none"
        aria-hidden="true"
      >
        <path pathLength="1" d="M1 110V25L25 1H290M399 410V495L375 519H110" />
        <path pathLength="1" d="M315 12H387V84M85 508H13V436" />
      </svg>
      <div className="portrait-caption">
        <span>Design & código</span>
        <span>{founder.signature}</span>
      </div>
    </div>
  );
}
