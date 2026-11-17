import { useCallback, useState } from "react";
import GlobeStudy from "./effects/GlobeStudy";

const globeSettings = { radius: 128, drift: 70, letters: 100 };
const pointerSettings = { zoom: 0, light: 0, pins: 0 };
export default function Globe({ paused = false }: { paused?: boolean }) {
  const [unavailable, setUnavailable] = useState(false);
  const fail = useCallback(() => setUnavailable(true), []);
  return (
    <div className="globe-experience">
      {unavailable ? (
        <div className="globe-fallback">
          <img
            src="/textures/globe-poster-v4.png"
            alt="Globo terrestre composto por pontos e caracteres em azul"
          />
          <p>A versão estática preserva a experiência neste dispositivo.</p>
        </div>
      ) : (
        <>
          <div
            className="globe-canvas"
            role="img"
            aria-label="Globo terrestre azul feito de pontos e caracteres, com rotação autônoma contínua"
          >
            <GlobeStudy
              background="transparent"
              baseColor="#749dff"
              phrase="AmadeiTech"
              density={136}
              glyphSize={70}
              speed={50}
              asciiSpeed={0.6}
              globe={globeSettings}
              pointer={pointerSettings}
              autonomous
              paused={paused}
              onUnavailable={fail}
            />
          </div>
        </>
      )}
    </div>
  );
}
