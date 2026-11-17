import { useEffect, useRef, useState } from "react";
import type { PointerEvent, KeyboardEvent } from "react";
import type { Project } from "./content";
import { showcaseScreens } from "./showcaseScreens";
import { motionPreference } from "./motion";
import { observeResponsiveEntrance } from "./mobileEntrance";
import IPhoneHardware from "./IPhoneHardware";

// Screens stay mounted: transitions retarget naturally even when a visitor
// changes direction mid-reveal. Pointer motion never causes React renders.
export default function ProjectShowcase({ project }: { project: Project }) {
  const screens = showcaseScreens[project.id];
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    time: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const frame = useRef(0);
  const current = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const preference = motionPreference();
    const depth = el.querySelector<HTMLElement>(".showcase-depth")!;
    const entrance = el.querySelector<HTMLElement>(".showcase-entrance")!;
    let animation: Animation | undefined;
    let scrollFrame = 0;
    let visible = false;
    let previousWidth = innerWidth;
    const reset = () => {
      animation?.cancel();
      depth.style.removeProperty("transform");
      camera.current?.style.removeProperty("transform");
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    };
    const update = () => {
      scrollFrame = 0;
      if (!visible || preference.matches || document.hidden) return;
      const r = el.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight),
      );
      depth.style.transform = `translate3d(0,${progress * (innerWidth < 768 ? 3 : 10)}px,0)`;
    };
    const schedule = () => {
      if (visible && !scrollFrame && !preference.matches)
        scrollFrame = requestAnimationFrame(update);
    };
    const observer = observeResponsiveEntrance(el, {
      threshold: 0.12,
      onSettle() {
        visible = true;
        el.dataset.visible = "true";
        schedule();
      },
      onEnter() {
        visible = true;
        el.dataset.visible = "true";
        if (!preference.matches && !document.hidden) {
          const starts: Record<string, Keyframe> = {
            wandyfitt: {
              transform:
                "perspective(1400px) translateX(-28px) rotateY(5deg) scale(.97)",
              clipPath: "inset(0 20% 8% 0)",
              opacity: 0.45,
            },
            ares: {
              transform:
                "perspective(1400px) translateY(24px) rotateX(4deg) scale(.97)",
              clipPath: "inset(12% 0 12% 0 round 12%)",
              opacity: 0.5,
            },
            beaute: {
              transform:
                "perspective(1400px) translateY(16px) rotateY(-3deg) scale(.98)",
              clipPath: "ellipse(28% 55% at 50% 50%)",
              opacity: 0.45,
            },
            alanna: {
              transform:
                "perspective(1400px) translateY(22px) rotateZ(-1.5deg) scale(.97)",
              clipPath: "inset(5% 5% 5% 5%)",
              opacity: 0.5,
            },
          };
          const mobile = innerWidth < 768;
          const mobileStarts: Record<string, string> = {
            wandyfitt:
              "perspective(1400px) translateY(22px) rotateY(-6deg) scale(.97)",
            ares: "perspective(1400px) translateY(26px) rotateX(5deg) scale(.98)",
            beaute:
              "perspective(1400px) translateY(18px) rotateY(4deg) scale(.98)",
            alanna:
              "perspective(1400px) translateY(24px) rotateZ(-1.5deg) scale(.97)",
          };
          animation = entrance.animate(
            [
              mobile
                ? { transform: mobileStarts[project.id], opacity: 0 }
                : starts[project.id],
              {
                transform:
                  "perspective(1400px) translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)",
                clipPath: mobile
                  ? "none"
                  : project.id === "beaute"
                    ? "ellipse(80% 90% at 50% 50%)"
                    : "inset(0% 0% 0% 0% round 0%)",
                opacity: 1,
              },
            ],
            {
              duration: project.id === "wandyfitt" ? 900 : 1200,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "backwards",
            },
          );
        }
        schedule();
      },
      onExit() {
        visible = false;
        el.dataset.visible = "false";
        reset();
      },
    });
    const resize = () => {
      // Mobile browser chrome changes height while scrolling. That is not a
      // layout change and must not cancel an entrance halfway through.
      if (innerWidth >= 768 || innerWidth !== previousWidth) reset();
      previousWidth = innerWidth;
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      observer.dispose();
      reset();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [project.id]);

  const select = (next: number, instant = false) => {
    if (root.current) {
      root.current.dataset.instant = String(instant);
      root.current.dataset.direction =
        next > current.current ? "forward" : "backward";
    }
    current.current = (next + screens.length) % screens.length;
    setActive(current.current);
  };
  const moveCamera = (transform: string) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (camera.current) camera.current.style.transform = transform;
    });
  };
  const release = () => {
    drag.current = null;
    cancelAnimationFrame(frame.current);
    camera.current?.style.removeProperty("transform");
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    const d = drag.current;
    if (d) {
      const dx = event.clientX - d.x,
        dy = event.clientY - d.y;
      if (!d.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8)
        d.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      if (d.axis !== "x") return;
      if (!event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.setPointerCapture(event.pointerId);
      if (!motionPreference().matches)
        moveCamera(
          `translate3d(${Math.max(-24, Math.min(24, dx * 0.13))}px,0,0) rotateY(${Math.max(-2, Math.min(2, dx * 0.012))}deg)`,
        );
    } else if (
      event.pointerType === "mouse" &&
      matchMedia("(hover:hover) and (pointer:fine)").matches &&
      !motionPreference().matches
    ) {
      const r = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5,
        y = (event.clientY - r.top) / r.height - 0.5;
      moveCamera(
        `translate3d(${x * 4}px,${y * 3}px,0) rotateX(${-y * 2}deg) rotateY(${x * 3}deg)`,
      );
    }
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    const d = drag.current;
    if (d?.axis === "x") {
      const dx = event.clientX - d.x;
      const speed = Math.abs(dx) / Math.max(1, performance.now() - d.time);
      if (Math.abs(dx) > 48 || (Math.abs(dx) > 22 && speed > 0.4))
        select(current.current + (dx < 0 ? 1 : -1));
    }
    release();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    select(
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? screens.length - 1
          : current.current + (e.key === "ArrowRight" ? 1 : -1),
      true,
    );
  };

  return (
    <div
      className="showcase"
      ref={root}
      role="region"
      aria-roledescription="galeria"
      aria-label={`Explore ${project.name}`}
    >
      <div className="showcase-depth">
        <div className="showcase-entrance">
          <div className="showcase-camera" ref={camera}>
            <IPhoneHardware />
            <div className="showcase-browser-bar" aria-hidden="true">
              <span className="showcase-window-marks">
                <i />
                <i />
                <i />
              </span>
              <span>{new URL(project.url).hostname}</span>
            </div>
            <div className="showcase-glass" aria-hidden="true" />
            <div
              className="showcase-screen-stage"
              tabIndex={0}
              role="group"
              aria-label={`Telas de ${project.name}. Use as setas para explorar.`}
              onKeyDown={keys}
              onPointerMove={pointerMove}
              onPointerLeave={() => {
                if (!drag.current) release();
              }}
              onPointerDown={(e) => {
                if (e.isPrimary && e.button === 0)
                  drag.current = {
                    x: e.clientX,
                    y: e.clientY,
                    time: performance.now(),
                    axis: null,
                  };
              }}
              onPointerUp={pointerUp}
              onPointerCancel={release}
              onLostPointerCapture={release}
            >
              {screens.map((screen, i) => (
                <picture
                  key={screen.desktop}
                  className={`showcase-screen${active === i ? " is-active" : ""}`}
                  aria-hidden={active !== i}
                >
                  <source media="(max-width: 767px)" srcSet={screen.mobile} />
                  <img
                    src={screen.desktop}
                    width="1440"
                    height="960"
                    loading="lazy"
                    decoding="async"
                    alt={screen.alt}
                    draggable="false"
                  />
                </picture>
              ))}
              <span className="showcase-phone-island" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="showcase-navigation">
        <div
          className="showcase-scene-copy"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(screens.length).padStart(2, "0")}
          </span>
          <strong>{screens[active].label}</strong>
        </div>
        <div
          className="showcase-controls"
          role="group"
          aria-label={`Selecionar tela de ${project.name}`}
        >
          {screens.map((screen, i) => (
            <button
              key={screen.label}
              type="button"
              aria-label={`Ver ${screen.label}`}
              aria-pressed={i === active}
              onClick={(e) => select(i, e.detail === 0)}
            >
              <span />
            </button>
          ))}
          <button
            className="showcase-next"
            type="button"
            aria-label={`Próxima tela de ${project.name}`}
            onClick={(e) => select(current.current + 1, e.detail === 0)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 12h16m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="showcase-filmstrip" aria-label="Outras perspectivas">
        {screens.map(
          (screen, i) =>
            i !== active && (
              <button
                key={screen.desktop}
                type="button"
                onClick={(e) => select(i, e.detail === 0)}
                aria-label={`Explorar ${screen.label}`}
              >
                <img
                  src={screen.desktop}
                  width="1440"
                  height="960"
                  alt=""
                  loading="lazy"
                  draggable="false"
                />
                <span>{screen.label}</span>
              </button>
            ),
        )}
      </div>
      <p className="showcase-gesture-hint">
        <span className="hint-desktop">Arraste para mudar de perspectiva</span>
        <span className="hint-mobile">Deslize para explorar</span>
      </p>
    </div>
  );
}
