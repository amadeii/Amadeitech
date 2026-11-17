// The build-time DEV guard prevents local demonstration settings in production.
// Keep the browser's real matchMedia untouched so accessibility remains testable.
const localDevelopment =
  import.meta.env.DEV &&
  ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const requested = localDevelopment
  ? new URLSearchParams(location.search).get("motion")
  : null;
const mode = localDevelopment
  ? requested === "reduce"
    ? "reduce"
    : requested === "system"
      ? "system"
      : "full"
  : "system";

export const motionPreview = mode === "full";
const media = matchMedia("(prefers-reduced-motion: reduce)");
// Snapshot the native query and update from its event. Render loops should read
// our resolved state, rather than polling the live MediaQueryList each frame.
let systemReduced = media.matches;
const preference = {
  get matches() {
    return mode === "reduce" || (mode === "system" && systemReduced);
  },
  addEventListener: media.addEventListener.bind(media),
  removeEventListener: media.removeEventListener.bind(media),
};

function syncMotion() {
  document.documentElement.dataset.motion = preference.matches ? "reduce" : "full";
  if (motionPreview) document.documentElement.dataset.motionPreview = "true";
  else delete document.documentElement.dataset.motionPreview;
}
syncMotion();
function onSystemMotion(event: MediaQueryListEvent) {
  systemReduced = event.matches;
  syncMotion();
}
media.addEventListener("change", onSystemMotion);
if (import.meta.hot) {
  import.meta.hot.dispose(() => media.removeEventListener("change", onSystemMotion));
}

export function motionPreference() {
  return preference;
}
