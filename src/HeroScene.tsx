import { motionPreference } from "./motion";
import { useEffect, useRef } from "react";
import { HeroRenderer } from "./HeroRenderer";
import { observeHeroPointer } from "./heroPointer";
import * as THREE from "three";

// An extruded interpretation of AT; the original brand asset remains in the header.
export default function HeroScene({ paused = false }: { paused?: boolean }) {
  const motionPaused = useRef(paused);
  const resume = useRef<() => void>(() => {});
  useEffect(() => {
    motionPaused.current = paused;
    resume.current();
  }, [paused]);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = motionPreference();
    const renderer = new HeroRenderer();
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    const group = new THREE.Group();
    const metal = new THREE.MeshPhysicalMaterial({
      color: 0x075cdb,
      metalness: 0.66,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const geometries: THREE.BufferGeometry[] = [];
    function extrude(shape: THREE.Shape) {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: renderer.software ? 2 : 5,
        steps: 1,
        bevelSize: 0.055,
        bevelThickness: 0.055,
        curveSegments: renderer.software ? 12 : 24,
      });
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, metal);
      group.add(mesh);
    }
    const a = new THREE.Shape();
    a.moveTo(-1.8, -0.78);
    a.lineTo(-1.8, 0.6);
    a.quadraticCurveTo(-1.8, 1.02, -1.38, 1.02);
    a.lineTo(-0.35, 1.02);
    a.quadraticCurveTo(0.04, 1.02, 0.04, 0.6);
    a.lineTo(0.04, -0.78);
    a.lineTo(-0.3, -0.78);
    a.lineTo(-0.3, -0.02);
    a.lineTo(-1.37, -0.02);
    a.lineTo(-1.37, 0.3);
    a.lineTo(-0.3, 0.3);
    a.lineTo(-0.3, 0.58);
    a.quadraticCurveTo(-0.3, 0.7, -0.44, 0.7);
    a.lineTo(-1.32, 0.7);
    a.quadraticCurveTo(-1.46, 0.7, -1.46, 0.56);
    a.lineTo(-1.46, -0.4);
    a.quadraticCurveTo(-1.46, -0.75, -1.8, -0.78);
    extrude(a);
    const t = new THREE.Shape();
    t.moveTo(0.32, 0.68);
    t.quadraticCurveTo(0.4, 1.02, 0.76, 1.02);
    t.lineTo(1.7, 1.02);
    t.quadraticCurveTo(2.06, 1.02, 2.14, 0.68);
    t.lineTo(1.78, 0.68);
    t.lineTo(1.78, 0.69);
    t.lineTo(1.4, 0.69);
    t.lineTo(1.4, -0.38);
    t.quadraticCurveTo(1.4, -0.7, 1.06, -0.78);
    t.lineTo(1.06, 0.69);
    t.lineTo(0.68, 0.69);
    t.lineTo(0.68, 0.68);
    t.closePath();
    extrude(t);
    group.position.set(-0.12, -0.02, 0);
    group.rotation.set(-0.15, -0.4, -0.08);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0x7e9fff, 2.4));
    const key = new THREE.DirectionalLight(0xb9d9ff, 6);
    key.position.set(-2, 4, 5);
    scene.add(key);
    const edge = new THREE.PointLight(0x2266ff, 65);
    edge.position.set(2, -1, 2);
    scene.add(edge);
    const white = new THREE.DirectionalLight(0xffffff, 3);
    white.position.set(3, 2, -2);
    scene.add(white);
    let frame = 0,
      visible = true,
      disposed = false;
    let x = 0,
      y = 0,
      targetX = 0,
      targetY = 0;
    const start = performance.now();
    let elapsed = 0;
    let lastTime = 0;
    let lastRender = 0;
    function draw(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const running = !reduced.matches && !motionPaused.current;
      if (running && now - lastRender < 1000 / (renderer.software ? 20 : 30)) {
        frame = requestAnimationFrame(draw);
        return;
      }
      if (running && lastTime)
        elapsed += Math.min((now - lastTime) / 1000, 0.065);
      lastTime = now;
      lastRender = now;
      if (!running) {
        x = targetX;
        y = targetY;
      }
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      const enter = reduced.matches ? 1 : Math.min(1, (now - start) / 1500);
      const ease = 1 - Math.pow(1 - enter, 4);
      group.rotation.y =
        -0.4 + x * 0.25 + (1 - ease) * 0.7 + Math.sin(elapsed * 0.32) * 0.18;
      group.rotation.x = -0.15 + y * 0.18 + Math.sin(elapsed * 0.27) * 0.06;
      group.position.y = -0.02 - (1 - ease) * 0.32;
      edge.position.x = 2 + x * 2;
      if (running) {
        group.rotation.z = -0.08 + Math.sin(elapsed * 0.28) * 0.025;
        white.intensity = 3.2 + Math.sin(elapsed * 0.45) * 0.4;
      }
      renderer.render(scene, camera);
      if (
        running ||
        enter < 1 ||
        Math.abs(targetX - x) > 0.001 ||
        Math.abs(targetY - y) > 0.001
      )
        schedule();
    }
    function schedule() {
      if (!frame && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    resume.current = schedule;
    renderer.onChange = schedule;
    const resize = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      schedule();
    });
    resize.observe(el);
    function move(e: PointerEvent) {
      if (reduced.matches || motionPaused.current) return;
      const b = el!.getBoundingClientRect();
      targetX = Math.max(
        -0.5,
        Math.min(0.5, (e.clientX - b.left) / b.width - 0.5),
      );
      targetY = Math.max(
        -0.5,
        Math.min(0.5, (e.clientY - b.top) / b.height - 0.5),
      );
      schedule();
    }
    function leave() {
      targetX = 0;
      targetY = 0;
      schedule();
    }
    const unbindPointer = observeHeroPointer(
      el.closest<HTMLElement>(".hero-art") || el,
      move,
      leave,
    );
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(el);
    reduced.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      unbindPointer();
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", schedule);
      geometries.forEach((g) => g.dispose());
      metal.dispose();
      resume.current = () => {};
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div className="hero-object" ref={host} aria-hidden="true" />;
}
