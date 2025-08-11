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
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // 1) Если WebGL недоступен — рисуем 2D, чтобы проверить размер контейнера
    if (!hasWebGL()) {
      const c2d = document.createElement("canvas");
      c2d.width = el.clientWidth || 600;
      c2d.height = el.clientHeight || 360;
      const ctx = c2d.getContext("2d")!;
      ctx.fillStyle = "#ff3355";
      ctx.fillRect(0, 0, c2d.width, c2d.height);
      ctx.fillStyle = "#fff";
      ctx.font = "20px Arial";
      ctx.fillText("WebGL недоступен", 20, 40);
      el.innerHTML = "";
      el.appendChild(c2d);
      return;
    }

    // 2) Инициализация three.js
    const W = el.clientWidth || 600;
    const H = el.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 1);

    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // Диагностика
    const gl = renderer.getContext();
    console.log("THREE renderer info:", {
      isContextLost: gl.isContextLost?.(),
      webglVersion: gl.getParameter?.(gl.VERSION),
      renderer: gl.getParameter?.(gl.RENDERER),
      vendor: gl.getParameter?.(gl.VENDOR),
      shadingLang: gl.getParameter?.(gl.SHADING_LANGUAGE_VERSION),
      maxTexSize: gl.getParameter?.(gl.MAX_TEXTURE_SIZE),
    });

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(2.5, 2, 3);
    camera.lookAt(0, 0, 0);

    // helpers — должны быть видны при любом раскладе
    const axes = new THREE.AxesHelper(2);
    scene.add(axes);
    const grid = new THREE.GridHelper(6, 12, 0x2277ff, 0x113355);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // куб с материалом, не зависящим от света
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x0cd3ff, wireframe: false });
    const cube = new THREE.Mesh(geom, mat);
    cube.position.set(0, 0.5, 0);
    scene.add(cube);

    // немного света (на всякий) — но cube виден и без него
    const amb = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(amb);

    let raf = 0;
    const tick = () => {
      cube.rotation.y += 0.02;
      cube.rotation.x += 0.01;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth || W;
      const h = wrapRef.current.clientHeight || H;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geom.dispose();
      (mat as any).dispose?.();
      el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        height: "100%", // контейнер у нас 360px в родителе — этого достаточно
        background:
          "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.08), rgba(0,0,0,0))",
      }}
    />
  );
}
