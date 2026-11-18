// One Pointer Events policy for both renderers and the AT. Native vertical
// panning remains owned by the browser; pointercancel always releases attraction.
export function observeHeroPointer(
  host: HTMLElement,
  move: (event: PointerEvent) => void,
  leave: () => void,
) {
  let active: number | null = null;
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    active = event.pointerId;
    move(event);
  };
  const track = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    if (event.pointerType !== "mouse" && active !== event.pointerId) return;
    move(event);
  };
  const up = (event: PointerEvent) => {
    if (active !== event.pointerId) return;
    active = null;
    if (event.pointerType !== "mouse" || event.type === "pointercancel")
      leave();
  };
  const out = (event: PointerEvent) => {
    if (active === event.pointerId && event.pointerType !== "mouse") return;
    leave();
  };
  const callout = (event: Event) => event.preventDefault();
  host.addEventListener("pointerdown", down, { passive: true });
  host.addEventListener("pointermove", track, { passive: true });
  host.addEventListener("pointerenter", track, { passive: true });
  host.addEventListener("pointerleave", out, { passive: true });
  host.addEventListener("contextmenu", callout);
  window.addEventListener("pointerup", up, { passive: true });
  window.addEventListener("pointercancel", up, { passive: true });
  return () => {
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointermove", track);
    host.removeEventListener("pointerenter", track);
    host.removeEventListener("pointerleave", out);
    host.removeEventListener("contextmenu", callout);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  };
}
