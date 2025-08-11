import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NeonCore3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;

    const W = el.clientWidth || 600, H = el.clientHeight || 360;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    // renderer (прозрачный фон)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 4, 2); scene.add(dir);

    // sphere wireframe
    const sphereWire = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x59d8ff, wireframe: true, transparent: true, opacity: 0.22 })
    );
    scene.add(sphereWire);

    // rings
    const rings: THREE.Line[] = [];
    const ringMat = new THREE.LineBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.45 });
    function addRing(rx = 0, ry = 0) {
      const curve = new THREE.EllipseCurve(0, 0, 1.05, 1.05, 0, Math.PI * 2);
      const pts = curve.getSpacedPoints(220).map(p => new THREE.Vector3(p.x, 0, p.y));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, ringMat);
      line.rotation.set(rx, ry, 0);
      scene.add(line); rings.push(line);
    }
    addRing(0, 0);
    addRing(Math.PI / 2, 0);
    addRing(Math.PI / 3, Math.PI / 7);

    // center "S"
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(110, 110, 10, 128, 128, 120);
    grad.addColorStop(0, "#0aa1ce"); grad.addColorStop(1, "#0b3a57");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(128,128,98,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(127,230,255,.7)"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(128,128,98,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = "#e9fbff"; ctx.font = "bold 120px Inter, Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("S", 128, 136);
    const sTex = new THREE.CanvasTexture(c);
    const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
    sSprite.scale.set(0.9, 0.9, 1); scene.add(sSprite);

    // nodes + glow sprites
    const nodeGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xbff1ff });
    const nodes: THREE.Mesh[] = [];
    const glows: THREE.Sprite[] = [];

    const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 64;
    const gctx = glowCanvas.getContext("2d")!;
    const g = gctx.createRadialGradient(32,32,4,32,32,30);
    g.addColorStop(0,"rgba(191,241,255,1)"); g.addColorStop(1,"rgba(191,241,255,0)");
    gctx.fillStyle = g; gctx.beginPath(); gctx.arc(32,32,30,0,Math.PI*2); gctx.fill();
    const glowTex = new THREE.CanvasTexture(glowCanvas);

    for (let i = 0; i < 60; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.05);
      const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(v); scene.add(m); nodes.push(m);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.2 }));
      s.scale.set(0.18, 0.18, 1); s.position.copy(v); scene.add(s); glows.push(s);
    }

    // arcs (tube + glow tube)
    const arcs: THREE.Mesh[] = [];
    function addArc() {
      const a1 = Math.random() * Math.PI * 2, a2 = Math.random() * Math.PI * 2;
      const p1 = new THREE.Vector3(Math.cos(a1), Math.sin(a1 * 0.7) * 0.7, Math.sin(a1)).normalize().multiplyScalar(1.02);
      const p2 = new THREE.Vector3(Math.cos(a2), Math.sin(a2 * 0.7) * 0.7, Math.sin(a2)).normalize().multiplyScalar(1.02);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

      const base = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 80, 0.008, 8, false),
        new THREE.MeshBasicMaterial({ color: 0x6fe3ff, transparent: true, opacity: 0.9 })
      );
      const glow = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 80, 0.018, 8, false),
        new THREE.MeshBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      scene.add(base, glow); arcs.push(base, glow);
      if (arcs.length > 18) {
        const old = arcs.splice(0, 2);
        old.forEach(m => { scene.remove(m); (m.geometry as THREE.BufferGeometry).dispose(); (m.material as THREE.Material).dispose(); });
      }
    }
    for (let i = 0; i < 6; i++) addArc();
    let arcTimer = 0;

    // interaction — только при ховере канваса
    let hovering = false;
    let isDown = false, lx = 0, ly = 0;
    let velX = 0, velY = 0;
    const baseAuto = 0.006, damping = 0.94;
    const mouseNorm = { x: 0, y: 0 };
    const camTarget = new THREE.Vector3().copy(camera.position);

    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; isDown = false; hintRef.current && (hintRef.current.style.opacity = "1"); };
    const onDown = (e: PointerEvent) => { if (!hovering) return; isDown = true; lx = e.clientX; ly = e.clientY; hintRef.current && (hintRef.current.style.opacity = "0"); };
    const onUp = () => { isDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!hovering) return;
      // параллакс только при ховере
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDown) return;
      const dx = (e.clientX - lx) * 0.006, dy = (e.clientY - ly) * 0.006;
      velX += dx; velY += dy; lx = e.clientX; ly = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      if (!hovering) return; // не реагируем на скролл страницы
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.25 : -0.25), 2.4, 5);
      camTarget.z = camera.position.z;
    };

    // вешаем обработчики ТОЛЬКО на канвас
    const cvs = renderer.domElement;
    cvs.addEventListener("pointerenter", onEnter);
    cvs.addEventListener("pointerleave", onLeave);
    cvs.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    cvs.addEventListener("pointermove", onMove);
    cvs.addEventListener("wheel", onWheel, { passive: true });

    // animation loop
    let t = 0, raf = 0;
    const animate = () => {
      t += 0.016;

      // базовый авторотейт всегда активен
      sphereWire.rotation.y += baseAuto + velX;
      sphereWire.rotation.x += velY * 0.8;
      rings.forEach((r, i) => {
        r.rotation.y += baseAuto * 0.66 + velX * 0.9 + i * 0.0008;
        r.rotation.x += velY * 0.6;
      });
      velX *= damping; velY *= damping;

      // пульс узлов + glow
      const pulse = 0.96 + Math.sin(t * 2.1) * 0.06;
      nodes.forEach(n => n.scale.setScalar(pulse));
      glows.forEach(s => { (s.material as THREE.SpriteMaterial).opacity = 0.16 + (Math.sin(t * 1.9) + 1) * 0.07; });

      // новые дуги периодически
      arcTimer += 0.016; if (arcTimer > 1.4) { addArc(); arcTimer = 0; }

      // параллакс камеры — только при ховере (очень мягкий)
      const targetX = hovering ? mouseNorm.x * 0.25 : 0;
      const targetY = hovering ? mouseNorm.y * 0.20 : 0;
      camTarget.x = THREE.MathUtils.lerp(camTarget.x, targetX, 0.06);
      camTarget.y = THREE.MathUtils.lerp(camTarget.y, targetY, 0.06);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTarget.x, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTarget.y, 0.08);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth || W, h = wrapRef.current.clientHeight || H;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // автоскрытие хинта
    setTimeout(() => { if (hintRef.current) hintRef.current.style.opacity = "0"; }, 3000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cvs.removeEventListener("pointerenter", onEnter);
      cvs.removeEventListener("pointerleave", onLeave);
      cvs.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cvs.removeEventListener("pointermove", onMove);
      cvs.removeEventListener("wheel", onWheel);
      renderer.dispose(); el.innerHTML = "";
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={hintRef}
        style={{
          position: "absolute", right: 10, top: 10, padding: "6px 10px",
          background: "rgba(12, 39, 63, .55)", border: "1px solid rgba(127,230,255,.2)",
          borderRadius: 8, fontSize: 12, color: "#9bdfff", transition: "opacity .6s"
        }}
      >
        потяни, чтобы покрутить
      </div>
    </div>
  );
}
