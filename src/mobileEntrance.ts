import { motionPreference } from "./motion";
import { observeViewportReplay } from "./viewportReplay";

type EntranceOptions = Parameters<typeof observeViewportReplay>[1] & {
  onSettle?: () => void;
};

// Desktop retains the approved observer and timing. Mobile prepares offscreen
// content before intersection, rather than hiding content already being read.
export function observeResponsiveEntrance(
  element: HTMLElement,
  options: EntranceOptions,
) {
  const mobile = matchMedia("(max-width: 767px)");
  const preference = motionPreference();
  let active = false;
  let cleanup = () => {};
  const configure = () => {
    cleanup();
    delete element.dataset.mobileEntry;
    if (!mobile.matches) {
      const observer = observeViewportReplay(element, options);
      cleanup = () => observer.dispose();
      readVisible = () => observer.visible;
      return;
    }
    readVisible = () => active;
    const rect = element.getBoundingClientRect();
    active = rect.bottom > 0 && rect.top < innerHeight && rect.height > 0;
    const prepare = () => {
      if (!preference.matches) element.dataset.mobileEntry = "pending";
      else delete element.dataset.mobileEntry;
    };
    if (active) options.onSettle?.();
    else prepare();
    const observer = new IntersectionObserver(([entry]) => {
      const intersects =
        entry.isIntersecting && entry.intersectionRect.height > 0;
      if (intersects && !active) {
        active = true;
        // Both changes occur in this task, before the next paint.
        delete element.dataset.mobileEntry;
        options.onEnter();
      } else if (!intersects && active) {
        active = false;
        options.onExit?.();
        prepare();
      }
    });
    observer.observe(element);
    const changed = () => {
      if (active) {
        delete element.dataset.mobileEntry;
        if (preference.matches) options.onExit?.();
        else options.onSettle?.();
      } else prepare();
    };
    const focus = () => {
      delete element.dataset.mobileEntry;
      if (!active) options.onSettle?.();
      active = true;
    };
    preference.addEventListener("change", changed);
    element.addEventListener("focusin", focus);
    cleanup = () => {
      observer.disconnect();
      preference.removeEventListener("change", changed);
      element.removeEventListener("focusin", focus);
      delete element.dataset.mobileEntry;
    };
  };
  let readVisible = () => active;
  configure();
  mobile.addEventListener("change", configure);
  return {
    get visible() {
      return readVisible();
    },
    dispose() {
      cleanup();
      mobile.removeEventListener("change", configure);
    },
  };
}
