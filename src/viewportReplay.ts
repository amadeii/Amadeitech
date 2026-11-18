type ReplayOptions = {
  onEnter: () => void;
  onExit?: () => void;
  threshold?: number;
  rootMargin?: string;
};

// Entry uses a small inset so a reveal's 24px travel cannot move its own
// observed box out of view. Only the real viewport rearms the next entry.
// Crossing the trigger threshold repeatedly never restarts an active reveal.
export function observeViewportReplay(
  element: Element,
  { onEnter, onExit, threshold = 0.12, rootMargin = "-32px 0px -32px 0px" }: ReplayOptions,
) {
  let armed = true;
  let active = false;
  let disposed = false;
  const exitObserver = new IntersectionObserver(([entry]) => {
    if (disposed) return;
    if (!entry.isIntersecting || entry.intersectionRect.height === 0) {
      armed = true;
      if (active) {
        active = false;
        onExit?.();
      }
    }
  });
  const entryObserver = new IntersectionObserver(
    ([entry]) => {
      if (
        disposed ||
        !armed ||
        !entry.isIntersecting ||
        entry.intersectionRect.height === 0 ||
        entry.intersectionRatio < threshold
      )
        return;
      armed = false;
      active = true;
      onEnter();
    },
    { threshold: [0, threshold], rootMargin },
  );
  exitObserver.observe(element);
  entryObserver.observe(element);
  return {
    get visible() {
      return active;
    },
    dispose() {
      disposed = true;
      exitObserver.disconnect();
      entryObserver.disconnect();
    },
  };
}
