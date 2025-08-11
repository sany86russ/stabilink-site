import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// canvas-текстура с буквой S
function makeSTexture() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  // фон градиент
  const g = ctx.createRadialGradient(s * 0.35, s * 0.35, 10, s * 0.5, s * 0.5, s * 0.6);
  g.addColorStop(0, "#0aa1ce");
  g.addColorStop(1, "#0b3a57");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(s/2, s/2, s*0.44, 0, Math.PI*2); ctx.fill();
  // обводка
  ctx.strokeStyle = "rgba(127,230,255,.8)";
  ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.44, 0, Math.PI*2); ctx.stroke();
  // буква
  ctx.fillStyle = "#e9fbff";
  ctx.font = "bold 124px Inter, Arial, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("S", s/2, s/2 + 6);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export default function NeonCore3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;

    const W = el.clientWidth || 600, H = el.clientHeight || 360;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 0);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // свет и фон
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 4, 2); scene.add(dir);
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ color: 0x062034, transparent: true, opacity: 0.2 }));
    bg.position.z = -3; scene.add(bg);

    // ——— логотип S + glow
    const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeSTexture(), transparent: true }));
    sSprite.scale.set(1.2, 1.2, 1); scene.add(sSprite);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), new THREE.MeshBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.15 }));
    scene.add(glow);

    // ——— кольцо из звеньев (цепь)
    type LinkExt = THREE.Mesh & { v?: THREE.Vector3; broken?: boolean };
    const chainGroup = new THREE.Group(); scene.add(chainGroup);
    const linkGeo = new THREE.TorusGeometry(0.18, 0.06, 20, 40);
    const linkMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#7fe6ff"),
      roughness: 0.25, metalness: 0.1, transmission: 0.5, thickness: 0.5,
      transparent: true, emissive: new THREE.Color("#4fd4ff"), emissiveIntensity: 0.35
    });
    const LINKS = 26, R = 1.6;
    const links: LinkExt[] = [];
    for (let i = 0; i < LINKS; i++) {
      const m = new THREE.Mesh(linkGeo, linkMat) as LinkExt;
      const a = (i / LINKS) * Math.PI * 2;
      m.position.set(Math.cos(a) * R, Math.sin(a) * R * 0.35, Math.sin(a) * R);
      m.lookAt(0, 0, 0);
      m.rotateX(Math.PI / 2);
      chainGroup.add(m); links.push(m);
    }

    // ——— «разрыв» цепи через 1.5с
    const brokenIdx = new Set<number>();
    const toBreak = Math.floor(LINKS * 0.35); // треть звеньев разлетится
    setTimeout(() => {
      for (let i = 0; i < toBreak; i++) {
        const idx = Math.floor(Math.random() * LINKS);
        if (brokenIdx.has(idx)) { i--; continue; }
        brokenIdx.add(idx);
        const m = links[idx];
        m.broken = true;
        m.v = new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.8
        );
      }
      // небольшой импульс остальным — «дрожь»
      links.forEach((m, i) => {
        if (m.broken) return;
        m.v = new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.2);
        setTimeout(() => { if (m) m.v = undefined; }, 700);
      });
    }, 1500);

    // ——— интерактив / автоворот
    let isDown = false, lx = 0, ly = 0;
    let auto = true; // auto-rotate всегда включён и на Desktop
    const onDown = (e: PointerEvent) => { isDown = true; auto = false; lx = e.clientX; ly = e.clientY; hintRef.current && (hintRef.current.style.opacity = "0"); };
    const onUp = () => { isDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = (e.clientX - lx) * 0.006, dy = (e.clientY - ly) * 0.006;
      chainGroup.rotation.y += dx; chainGroup.rotation.x += dy;
      sSprite.rotation.z += dx * 0.4;
      lx = e.clientX; ly = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.25 : -0.25), 2.4, 5);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    // ——— анимация
    let t = 0, raf = 0;
    const animate = () => {
      t += 0.016;
      if (auto) {
        chainGroup.rotation.y += 0.006;
        sSprite.rotation.z += 0.0025;
      }
      glow.rotation.y += 0.0015;

      // физика звеньев
      links.forEach((m) => {
        if (!m.v) return;
        m.position.addScaledVector(m.v!, 0.016);
        // затухание скорости
        m.v!.multiplyScalar(0.986);
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // ресайз
    const onResize = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth || W, h = wrapRef.current.clientHeight || H;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // авто-скрытие хинта
    setTimeout(() => { hintRef.current && (hintRef.current.style.opacity = "0"); }, 3000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose(); el.innerHTML = "";
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", position: "relative",
      background: "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.10), rgba(0,0,0,0))" }}>
      <div ref={hintRef}
        style={{
          position: "absolute", right: 10, top: 10, padding: "6px 10px",
          background: "rgba(12, 39, 63, .55)", border: "1px solid rgba(127,230,255,.2)",
          borderRadius: 8, fontSize: 12, color: "#9bdfff", transition: "opacity .6s"
        }}>
        потяни, чтобы покрутить
      </div>
    </div>
  );
}
