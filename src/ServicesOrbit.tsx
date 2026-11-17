import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motionPreference } from "./motion";
import { observeViewportReplay } from "./viewportReplay";
import "./services-orbit.css";

const services = [
  {
    name: "Sites & experiências",
    text: "Para apresentar o seu negócio com clareza e personalidade.",
    detail: "Sites institucionais, landing pages e portfólios.",
    icon: "M4 7h24v20H4zM4 12h24M8 9.5h.01M11 9.5h.01M9 17h6M9 21h12",
  },
  {
    name: "Lojas & vendas",
    text: "Para transformar interesse em uma jornada de compra simples.",
    detail: "E-commerce, catálogos e pedidos online.",
    icon: "M7 11h18l2 16H5zM11 12V8a5 5 0 0 1 10 0v4M12 18h.01M20 18h.01",
  },
  {
    name: "Sistemas sob medida",
    text: "Para organizar processos que as ferramentas prontas não resolvem.",
    detail: "Sistemas web, painéis e soluções personalizadas.",
    icon: "M4 4h9v9H4zM19 19h9v9h-9zM19 4h9v9h-9zM4 19h9v9H4zM13 8h6M8 13v6M24 13v6M13 24h6",
  },
];

export default function ServicesOrbit({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const cards = Array.from(
      el.querySelectorAll<HTMLButtonElement>(".orbit-service"),
    );
    const globe = el.querySelector<HTMLElement>(".orbital-globe")!;
    const preference = motionPreference();
    let frame = 0,
      previous = 0,
      phase = innerWidth < 768 ? Math.PI / 2 : Math.PI / 6,
      speed = 1;
    let hovered = -1,
      focused = -1;
    let width = el.clientWidth;
    let compact = innerWidth < 1000;
    let mobile = innerWidth < 768;
    let cardWidth = cards[0].offsetWidth;
    let selected = -1;
    let selectionTimer = 0;
    const slots = [0, 1, 2];
    let foregroundSlot: number | null = null;
    let visible = false,
      disposed = false;
    let entries: Animation[] = [];

    function paint() {
      const radius = mobile
        ? Math.max(24, (width / 2 - cardWidth / 2 - 8) * 0.95)
        : Math.min(width * 0.33, Math.max(100, width / 2 - 155), 340);
      cards.forEach((card, index) => {
        const angle = phase + (slots[index] * Math.PI * 2) / 3;
        const x = Math.cos(angle) * radius;
        const y =
          Math.sin(angle) * (mobile ? 132 : 142) +
          Math.cos(angle) * (mobile ? -18 : -24);
        const z = Math.sin(angle) * (mobile ? 145 : 230);
        const active = mobile
          ? selected === index ||
            (focused === index && card.matches(":focus-visible"))
          : focused !== -1
            ? focused === index
            : hovered === index;
        const yaw = -Math.cos(angle) * 24;
        card.style.transform = mobile
          ? `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${(-Math.sin(angle) * 8).toFixed(2)}deg) translate(-50%,-50%)`
          : compact
            ? `translate3d(${(Math.cos(angle) * 2).toFixed(2)}px,0,0) rotateY(${(Math.sin(angle) * 2).toFixed(2)}deg)`
            : `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${(-Math.sin(angle) * 8).toFixed(2)}deg) translate(-50%,-50%)`;
        // The original globe and its circular solid core sit between the two
        // half-orbits. Outside its silhouette, the far cards remain visible.
        card.style.zIndex = String(
          (compact && !mobile) || active || (mobile && selected === index)
            ? 4
            : z < 0
              ? 1
              : 3,
        );
        if (mobile) card.dataset.selected = String(selected === index);
        else delete card.dataset.selected;
        card.dataset.depth = z.toFixed(2);
        card.dataset.orbitSlot = String(slots[index]);
      });
      el!.dataset.phase = phase.toFixed(4);
      el!.dataset.speed = speed.toFixed(3);
    }
    function promote(index: number) {
      if (index < 0 || (compact && !mobile)) return;
      // Exchange actual orbital slots instead of creating a fourth, fixed pose.
      // The outgoing card takes precisely the incoming card's former place.
      if (foregroundSlot === null) {
        foregroundSlot = slots.reduce((front, slot) =>
          Math.sin(phase + (slot * Math.PI * 2) / 3) >
          Math.sin(phase + (front * Math.PI * 2) / 3)
            ? slot
            : front,
        );
      }
      const outgoing = slots.indexOf(foregroundSlot);
      [slots[index], slots[outgoing]] = [slots[outgoing], slots[index]];
    }
    function clearEntries() {
      entries.forEach((animation) => animation.cancel());
      entries = [];
    }
    function reveal() {
      clearEntries();
      el!.dataset.orbitEntry = "active";
      if (preference.matches || document.hidden || focused !== -1) return;
      // Establish the live orbital pose before the first entrance frame.
      paint();
      entries = [
        globe.animate(
          [
            { opacity: 0, transform: "translate(-50%,-50%) scale(.94)" },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1)" },
          ],
          {
            duration: 1100,
            delay: 200,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "backwards",
          },
        ),
        ...cards.map((card, index) =>
          // Individual transform properties compose with the orbit's transform;
          // never capture/replace that moving transform with a frozen keyframe.
          card.animate(
            [
              { opacity: 0, scale: ".96", translate: "0 0 -32px" },
              { opacity: 1, scale: "1", translate: "0 0 0px" },
            ],
            {
              duration: 620,
              delay: 320 + index * 180,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "backwards",
            },
          ),
        ),
      ];
    }
    function render(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) {
        previous = 0;
        return;
      }
      if (preference.matches) {
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.zIndex = "";
        });
        previous = 0;
        return;
      }
      const dt = previous ? Math.min(now - previous, 64) : 0;
      previous = now;
      // Touch leaves anchors focused even after scrolling. Only keyboard focus
      // may hold a mobile orbit; touch selection has a bounded reading pause.
      const keyboardFocus =
        focused !== -1 && cards[focused].matches(":focus-visible");
      const stopped =
        (mobile ? keyboardFocus : focused !== -1) ||
        (mobile && selected !== -1);
      const target = stopped ? 0 : !mobile && hovered !== -1 ? 0.035 : 1;
      if (!stopped) foregroundSlot = null;
      speed += (target - speed) * (1 - Math.exp(-dt / 320));
      if (!stopped)
        phase =
          (phase + (dt / (mobile ? 24000 : 36000)) * Math.PI * 2 * speed) %
          (Math.PI * 2);
      else speed = 0;
      paint();
      if (!stopped) schedule();
      else previous = 0;
    }
    function schedule() {
      if (!disposed && !frame && visible && !document.hidden)
        frame = requestAnimationFrame(render);
    }
    const visibility = observeViewportReplay(el, {
      threshold: 0.08,
      onEnter() {
        visible = true;
        previous = 0;
        reveal();
        schedule();
      },
      onExit() {
        if (mobile) {
          clearTimeout(selectionTimer);
          selected = -1;
          cards.forEach((card) => delete card.dataset.selected);
        }
        visible = false;
        previous = 0;
        cancelAnimationFrame(frame);
        frame = 0;
        clearEntries();
        el.dataset.orbitEntry = "pending";
      },
    });
    const resize = new ResizeObserver(() => {
      width = el.clientWidth;
      compact = innerWidth < 1000;
      mobile = innerWidth < 768;
      cardWidth = cards[0].offsetWidth;
      if (!mobile) selected = -1;
      schedule();
    });
    resize.observe(el);
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hovered = cards.indexOf(event.currentTarget as HTMLButtonElement);
      schedule();
    };
    const leave = () => {
      hovered = -1;
      schedule();
    };
    const focus = (event: FocusEvent) => {
      focused = cards.indexOf(event.target as HTMLButtonElement);
      promote(focused);
      clearEntries();
      el.dataset.orbitEntry = "active";
      schedule();
    };
    const blur = () => {
      focused = -1;
      schedule();
    };
    const changed = () => {
      previous = 0;
      if (preference.matches || document.hidden) {
        clearEntries();
        el.dataset.orbitEntry = "active";
      }
      if (preference.matches) {
        selected = -1;
        cards.forEach((card) => delete card.dataset.selected);
      }
      schedule();
    };
    const select = (event: MouseEvent) => {
      if (!mobile || preference.matches || event.detail === 0) return;
      const index = cards.indexOf(event.currentTarget as HTMLButtonElement);
      if (selected === index) return;
      event.preventDefault();
      promote(index);
      selected = index;
      clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(() => {
        selected = -1;
        schedule();
      }, 5000);
      schedule();
    };
    const dismiss = (event: PointerEvent) => {
      if (
        !mobile ||
        selected === -1 ||
        cards.some((card) => card.contains(event.target as Node))
      )
        return;
      selected = -1;
      clearTimeout(selectionTimer);
      cards.forEach((card) => card.blur());
      schedule();
    };
    document.addEventListener("pointerdown", dismiss);
    cards.forEach((card) => {
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      card.addEventListener("focus", focus);
      card.addEventListener("blur", blur);
      card.addEventListener("click", select);
    });
    preference.addEventListener("change", changed);
    document.addEventListener("visibilitychange", changed);
    return () => {
      disposed = true;
      clearTimeout(selectionTimer);
      cancelAnimationFrame(frame);
      clearEntries();
      visibility.dispose();
      resize.disconnect();
      cards.forEach((card) => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        card.removeEventListener("focus", focus);
        card.removeEventListener("blur", blur);
        card.removeEventListener("click", select);
      });
      preference.removeEventListener("change", changed);
      document.removeEventListener("visibilitychange", changed);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  return (
    <div className="services-scene" ref={scene} data-orbit-entry="pending">
      <div className="orbital-light" aria-hidden="true" />
      <div className="services-orbit">
        <div className="orbital-globe">{children}</div>
        {services.map((service) => (
          <button
            type="button"
            className="orbit-service"
            key={service.name}
            aria-label={service.name}
          >
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d={service.icon} />
            </svg>
            <span className="orbit-service-title">{service.name}</span>
            <span className="orbit-service-copy">{service.text}</span>
            <span className="orbit-detail">{service.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
