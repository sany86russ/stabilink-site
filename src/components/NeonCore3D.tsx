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
    if (!wrapRef.current) return;

    if (!hasWebGL()) {
      wrapRef.current.innerHTML = "<div style='color:#9bdfff'>WebGL недоступен</div>";
      return;
    }

    // sizes
    const W = wrapRef.current.clientWidth || 600;
    const H = wrapRef.current.clientHeight || 360;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 1);
    wrapRef.current.innerHTML = ""; // clear
    wrapRef.current.appendChild(renderer.domElement);

    // scene
    const scene = new THREE.Scene();

    // camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 3);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 4, 2);
    scene.add(dir);

    // cube
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0cd3ff, metalness: 0.1, roughness: 0.3 });
    const cube = new THREE.Mesh(geom, mat);
    scene.add(cube);

    let raf = 0;
    const tick = () => {
      cube.rotation.y += 0.02;
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
      wrapRef.current && (wrapRef.current.innerHTML = "");
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.08), rgba(0,0,0,0))",
      }}
    />
  );
}
