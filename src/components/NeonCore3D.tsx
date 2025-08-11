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

export default function NeonCore3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // fallback
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
    renderer.setClearColor(0x0a1529, 1);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W0 / H0, 0.1, 100);
    camera.position.set(0, 0, 2.9);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 4, 2);
    scene.add(amb, dir);

    // background glow plane (very subtle)
    const bgGeo = new THREE.PlaneGeometry(8, 4);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x062034, transparent: true, opacity: 0.25 });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.set(0, 0, -2);
    scene.add(bg);

    // ——— Core (torus knot)
    const coreGeo = new THREE.TorusKnotGeometry(0.7, 0.18, 240, 36);
    const coreMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.75,
      thickness: 0.6,
      color: new THREE.Color("#0cd3ff"),
      emissive: new THREE.Color("#0cd3ff"),
      emissiveIntensity: 0.62,
      transparent: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // ——— Orbits (lines)
    const orbitMat = new THREE.LineBasicMaterial({ color: "#6fe3ff", transparent: true, opacity: 0.5 });
    const orbits: THREE.Line[] = [];
    for (let i = 0; i < 7; i++) {
      const r = 1.25 + (i % 2) * 0.1;
      const curve = new THREE.EllipseCurve(0, 0, r, r * 0.55, 0, Math.PI * 2, false, 0);
      const pts2 = curve.getSpacedPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const angle = (Math.PI / 6) * (i / 2 + 0.5);
      pts2.forEach((v) => v.applyAxisAngle(axis, angle));
      const geo = new THREE.BufferGeometry().setFromPoints(pts2);
      const line = new THREE.Line(geo, orbitMat);
      scene.add(line);
      orbits.push(line);
    }

    // ——— Particles (small glowing nodes)
    const pGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: "#bff1ff" });
    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < 180; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.35);
      const m = new THREE.Mesh(pGeo, pMat);
      m.position.copy(v);
      scene.add(m);
      particles.push(m);
    }

    // Interaction: drag to rotate (desktop), wheel to zoom; mobile — autorotate
    let isPointerDown = false;
    let lastX = 0, lastY = 0;
    let autoRotate = /Mobi|Android/i.test(navigator.userAgent);
    const minZ = 2.2, maxZ = 4.5;

    const onDown = (e: PointerEvent) => { isPointerDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { isPointerDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!isPointerDown || autoRotate) return;
      const dx = (e.clientX - lastX) * 0.006;
      const dy = (e.clientY - lastY) * 0.006;
      core.rotation.y += dx; core.rotation.x += dy;
      lastX = e.clientX; lastY = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      if (autoRotate) return;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.2 : -0.2), minZ, maxZ);
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    let t = 0, raf = 0;
    const animate = () => {
      t += 0.016;
      // subtle motion
      if (autoRotate) { core.rotation.y += 0.01; core.rotation.x += 0.004; }
      orbits.forEach((o, i) => { o.rotation.y = t * (0.02 + i * 0.002); });
      particles.forEach((p, i) => { p.rotation.y = t * 0.02; (p.material as THREE.Material).needsUpdate = false; });

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
      coreGeo.dispose(); (coreMat as any).dispose?.();
      orbitMat.dispose(); pGeo.dispose(); (pMat as any).dispose?.();
      el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.08), rgba(0,0,0,0))",
      }}
    />
  );
}
