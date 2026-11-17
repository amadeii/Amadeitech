import * as THREE from "three";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer.js";

// The scene and its geometry are shared. Only the drawing backend changes when
// this browser cannot create or retain a WebGL context.
export class HeroRenderer {
  readonly domElement = document.createElement("div");
  private gpu: THREE.WebGLRenderer | null = null;
  private svg: SVGRenderer | null = null;
  private active!: THREE.WebGLRenderer | SVGRenderer;
  private width = 1;
  private height = 1;
  onChange: () => void = () => {};

  constructor() {
    this.domElement.style.cssText = "width:100%;height:100%";
    const canvas = document.createElement("canvas");
    try {
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      if (context) {
        this.gpu = new THREE.WebGLRenderer({
          canvas,
          context,
          alpha: true,
          antialias: true,
        });
        this.gpu.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        this.gpu.setClearColor(0, 0);
        this.gpu.toneMapping = THREE.NeutralToneMapping;
        this.gpu.toneMappingExposure = 1.1;
      }
    } catch {
      // GPU refusal is recoverable through the animated vector renderer.
    }
    canvas.addEventListener("webglcontextlost", this.lost);
    canvas.addEventListener("webglcontextrestored", this.restored);
    this.activate(this.gpu ?? this.vector());
  }

  get software() {
    return this.active === this.svg;
  }
  private vector() {
    if (!this.svg) {
      this.svg = new SVGRenderer();
      this.svg.setPrecision(2);
      this.svg.setQuality("low");
    }
    return this.svg;
  }
  private activate(renderer: THREE.WebGLRenderer | SVGRenderer) {
    this.active = renderer;
    renderer.setSize(this.width, this.height);
    this.domElement.replaceChildren(renderer.domElement);
    this.domElement.dataset.renderer = renderer === this.gpu ? "webgl" : "svg";
    this.onChange();
  }
  private lost = (event: Event) => {
    event.preventDefault();
    this.activate(this.vector());
  };
  private restored = () => {
    if (this.gpu) this.activate(this.gpu);
  };
  setSize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.active.setSize(this.width, this.height);
  }
  render(scene: THREE.Scene, camera: THREE.Camera) {
    if (this.active === this.gpu && this.gpu?.getContext().isContextLost())
      this.activate(this.vector());
    // SVG's Lambert lighting has no physical distance falloff or tone mapping.
    // Adapt light units temporarily to preserve the cobalto palette, then put
    // the physical values back for the GPU renderer and subsequent frames.
    const lights = this.software
      ? scene.children.filter(
          (object): object is THREE.Light => object instanceof THREE.Light,
        )
      : [];
    const intensities = lights.map((light) => light.intensity);
    lights.forEach((light) => {
      light.intensity *= light instanceof THREE.PointLight ? 0.015 : 0.18;
    });
    try {
      this.active.render(scene, camera);
    } finally {
      lights.forEach((light, i) => {
        light.intensity = intensities[i];
      });
    }
    if (this.software)
      this.active.domElement.style.backgroundColor = "transparent";
  }
  dispose() {
    if (this.gpu) {
      this.gpu.domElement.removeEventListener("webglcontextlost", this.lost);
      this.gpu.domElement.removeEventListener(
        "webglcontextrestored",
        this.restored,
      );
      this.gpu.dispose();
    }
    this.domElement.replaceChildren();
  }
}
