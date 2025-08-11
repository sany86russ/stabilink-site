import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// небольшая градиентная текстура для toon-материала
function makeToonGradient(colors: string[]) {
  const size = colors.length;
  const data = new Uint8Array(size * 3);
  for (let i = 0; i < size; i++) {
    const c = new THREE.Color(colors[i]);
    data[i * 3 + 0] = Math.round(c.r * 255);
    data[i * 3 + 1] = Math.round(c.g * 255);
    data[i * 3 + 2] = Math.round(c.b * 255);
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RGBFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

export default function NeonCore3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!hasWebGL()) {
      const c2d = document.createElement("canvas");
      c2d.width = el.clientWidth || 600;
      c2d.height = el.clientHeight || 360;
      const ctx = c2d.getContext("2d")!;
      ctx.fillStyle = "#0a1529";
      ctx.fillRect(0, 0, c2d.width, c2d.height);
      ctx.fillStyle = "#9bdfff";
      ctx.font = "16px Arial";
      ctx.fillText("WebGL недоступен", 16, 32);
      el.innerHTML = "";
      el.appendChild(c2d);
      return;
    }

    const W0 = el.clientWidth || 600;
    const H0 = el.clientHeight || 360;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W0, H0);
    renderer.setClearColor(0x0a1529, 0); // прозрачный, фон задаём css
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W0 / H0, 0.1, 100);
    camera.position.set(0, 0, 3.3);

    // lights (минимум, т.к. toon-материал)
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 4, 2);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    // ——— PLANET (toon)
    const gradient = makeToonGradient(["#0b3a57", "#0a79a6", "#18c9ff"]);
    const planetMat = new THREE.MeshToonMaterial({ color: "#18c9ff", gradientMap: gradient });
    const planetGeo = new THREE.SphereGeometry(0.95, 64, 64);
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.rotation.x = 0.2;
    scene.add(planet);

    // outline (обводка) — второй меш, чуть больше, обратные стороны
    const outlineMat = new THREE.MeshBasicMaterial({ color: "#07243a", side: THREE.BackSide });
    const outline = new THREE.Mesh(planetGeo, outlineMat);
    outline.scale.multiplyScalar(1.05);
    scene.add(outline);

    // ——— RING (кольцо)
    const ringGeo = new THREE.TorusGeometry(1.4, 0.06, 16, 180);
    const ringMat = new THREE.MeshToonMaterial({ color: "#7fe6ff", gradientMap: gradient, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.42;
    ring.rotation.y = Math.PI * 0.18;
    scene.add(ring);

    // ——— SATELLITES (маленькие луны на орбитах)
    const satGroup = new THREE.Group();
    scene.add(satGroup);
    const satGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const satMat = new THREE.MeshToonMaterial({ color: "#ffffff", gradientMap: gradient });
    const SATS = 4;
    for (let i = 0; i < SATS; i++) {
      const s = new THREE.Mesh(satGeo, satMat);
      const r = 1.6 + (i % 2) * 0.2;
      // расставим на разных наклонённых орбитах
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const angle = Math.PI / 6 + i * 0.3;
      s.userData = { r, t: Math.random() * Math.PI * 2, axis, angle };
      satGroup.add(s);
    }

    // ——— PARTICLES (звёздочки)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 250;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(2.2 + Math.random() * 0.8);
      positions[i * 3 + 0] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: "#bff1ff", size: 0.015, sizeAttenuation: true, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ——— Interaction: drag rotate (desktop), wheel zoom; mobile — autorotate
    let isPointerDown = false;
    let lastX = 0, lastY = 0;
    let autorotate = /Mobi|Android/i.test(navigator.userAgent);
    const minZ = 2.4, maxZ = 5.0;

    const onDown = (e: PointerEvent) => { isPointerDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { isPointerDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!isPointerDown || autorotate) return;
      const dx = (e.clientX - lastX) * 0.006;
      const dy = (e.clientY - lastY) * 0.006;
      planet.rotation.y += dx; planet.rotation.x += dy;
      ring.rotation.y += dx; ring.rotation.x += dy * 0.5;
      lastX = e.clientX; lastY = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      if (autorotate) return;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.25 : -0.25), minZ, maxZ);
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    // ——— Animate
    let t = 0, raf = 0;
    const animate = () => {
      t += 0.016;
      if (autorotate) {
        planet.rotation.y += 0.01;
        ring.rotation.y += 0.008;
      }
      // движение спутников по наклонённым орбитам
      satGroup.children.forEach((s, i) => {
        const { r, axis, angle } = s.userData as any;
        const tt = t * (0.6 + i * 0.15);
        const pos = new THREE.Vector3(Math.cos(tt) * r, 0, Math.sin(tt) * r);
        pos.applyAxisAngle(axis, angle);
        (s as THREE.Mesh).position.copy(pos);
      });
      stars.rotation.y += 0.0015;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!ref.current) return;
      const w = ref.current.clientWidth || W0;
      const h = ref.current.clientHeight || H0;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose();
      planetGeo.dispose();
      ringGeo.dispose();
      starGeo.dispose();
      (planet.material as THREE.Material).dispose();
      (ring.material as THREE.Material).dispose();
      (starMat as THREE.Material).dispose?.();
      el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.10), rgba(0,0,0,0))",
      }}
    />
  );
}
