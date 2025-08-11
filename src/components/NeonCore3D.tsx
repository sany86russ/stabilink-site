import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Edge = {
  curve: THREE.QuadraticBezierCurve3;
  base: THREE.Mesh;
  glow: THREE.Mesh;
  dot: THREE.Mesh;   // «пакет» на линии
  u: number;         // положение вдоль кривой 0..1
  speed: number;     // скорость движения
};

export default function NeonCore3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const W = el.clientWidth || 600;
    const H = el.clientHeight || 360;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    // Renderer (прозрачный фон)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 4, 2);
    scene.add(dir);

    // Wireframe sphere (каркас)
    const sphereWire = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x59d8ff, wireframe: true, transparent: true, opacity: 0.22 })
    );
    scene.add(sphereWire);

    // Rings (меридианы/экваторы)
    const rings: THREE.Line[] = [];
    const ringMat = new THREE.LineBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.45 });
    function addRing(rx = 0, ry = 0) {
      const curve = new THREE.EllipseCurve(0, 0, 1.05, 1.05, 0, Math.PI * 2);
      const pts = curve.getSpacedPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, ringMat);
      line.rotation.set(rx, ry, 0);
      scene.add(line);
      rings.push(line);
    }
    addRing(0, 0);
    addRing(Math.PI / 2, 0);
    addRing(Math.PI / 3, Math.PI / 7);

    // Center logo "S" (sprite) + subtle glow, с пульсацией
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(110, 110, 10, 128, 128, 120);
    grad.addColorStop(0, "#0aa1ce");
    grad.addColorStop(1, "#0b3a57");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 98, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(127,230,255,.7)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 98, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e9fbff";
    ctx.font = "bold 120px Inter, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", 128, 136);
    const sTex = new THREE.CanvasTexture(c);
    const sSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: sTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 })
    );
    sSprite.scale.set(0.9, 0.9, 1);
    scene.add(sSprite);

    const sGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x7fe6ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(sGlow);

    // Nodes + glow sprites
    const nodeGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xbff1ff });
    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 64;
    const gctx = glowCanvas.getContext("2d")!;
    const g = gctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    g.addColorStop(0, "rgba(191,241,255,1)");
    g.addColorStop(1, "rgba(191,241,255,0)");
    gctx.fillStyle = g;
    gctx.beginPath();
    gctx.arc(32, 32, 30, 0, Math.PI * 2);
    gctx.fill();
    const glowTex = new THREE.CanvasTexture(glowCanvas);

    for (let i = 0; i < 60; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.05);
      const m = new THREE.Mesh(nodeGeo, nodeMat);
      m.position.copy(v);
      scene.add(m);
      nodes.push(m);
      nodePositions.push(v.clone());

      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.18
        })
      );
      s.scale.set(0.18, 0.18, 1);
      s.position.copy(v);
      scene.add(s);
    }

    // Edges (соединительные линии) + «пакеты»
    const edges: Edge[] = [];
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x6fe3ff, transparent: true, opacity: 0.9 });
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x7fe6ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    function addEdge(p1: THREE.Vector3, p2: THREE.Vector3) {
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.3); // приподнимаем дугу
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

      const base = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.006, 8, false), baseMat);
      const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.014, 8, false), glowMat);
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(curve.getPoint(0));

      scene.add(base, glow, dot);
      edges.push({ curve, base, glow, dot, u: Math.random(), speed: 0.35 + Math.random() * 0.5 });

      // ограничиваем количество активных рёбер
      if (edges.length > 24) {
        const e = edges.shift()!;
        [e.base, e.glow, e.dot].forEach((m: THREE.Object3D) => {
          scene.remove(m);
          const geom = (m as any).geometry as THREE.BufferGeometry | undefined;
          const mat = (m as any).material as THREE.Material | THREE.Material[] | undefined;
          geom?.dispose?.();
          if (Array.isArray(mat)) mat.forEach((mm) => mm?.dispose?.());
          else mat?.dispose?.();
        });
      }
    }

    // первичные связи: не всем, чтобы было «воздуха»
    for (let i = 0; i < nodePositions.length; i++) {
      if (Math.random() < 0.45) {
        const j = (i + 3 + Math.floor(Math.random() * 10)) % nodePositions.length;
        addEdge(nodePositions[i], nodePositions[j]);
      }
    }

    // периодически добавляем новые связи
    let edgeTimer = 0;

    // Interaction — только при ховере канваса
    let hovering = false;
    let isDown = false,
      lx = 0,
      ly = 0;
    let velX = 0,
      velY = 0;
    const baseAuto = 0.006,
      damping = 0.94;
    const mouseNorm = { x: 0, y: 0 };
    const camTarget = new THREE.Vector3().copy(camera.position);

    const cvs = renderer.domElement;
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
      isDown = false;
      if (hintRef.current) hintRef.current.style.opacity = "1";
    };
    const onDown = (e: PointerEvent) => {
      if (!hovering) return;
      isDown = true;
      lx = e.clientX;
      ly = e.clientY;
      if (hintRef.current) hintRef.current.style.opacity = "0";
    };
    const onUp = () => {
      isDown = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!hovering) return;

      // параллакс только при ховере
      const rect = cvs.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDown) return;
      const dx = (e.clientX - lx) * 0.006;
      const dy = (e.clientY - ly) * 0.006;
      velX += dx;
      velY += dy;
      lx = e.clientX;
      ly = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      if (!hovering) return; // не реагируем на скролл страницы
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.25 : -0.25), 2.4, 5);
      camTarget.z = camera.position.z;
    };

    cvs.addEventListener("pointerenter", onEnter);
    cvs.addEventListener("pointerleave", onLeave);
    cvs.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    cvs.addEventListener("pointermove", onMove);
    cvs.addEventListener("wheel", onWheel, { passive: true });

    // Loop
    let t = 0,
      raf = 0;
    const animate = () => {
      t += 0.016;

      // авто + инерция
      sphereWire.rotation.y += baseAuto + velX;
      sphereWire.rotation.x += velY * 0.8;
      rings.forEach((r, i) => {
        r.rotation.y += baseAuto * 0.66 + velX * 0.9 + i * 0.0008;
        r.rotation.x += velY * 0.6;
      });
      velX *= damping;
      velY *= damping;

      // пульс логотипа и glow
      const pulse = 0.95 + Math.sin(t * 1.8) * 0.05;
      sSprite.scale.set(0.9 * pulse, 0.9 * pulse, 1);
      (sGlow.material as THREE.Material & { opacity?: number }).opacity =
        0.1 + ((Math.sin(t * 1.6) + 1) * 0.06);

      // «пакеты» бегут по дугам
      edges.forEach((e) => {
        e.u += 0.01 * e.speed;
        if (e.u > 1) e.u -= 1;
        e.dot.position.copy(e.curve.getPoint(e.u));
      });

      // новые связи
      edgeTimer += 0.016;
      if (edgeTimer > 1.6) {
        edgeTimer = 0;
        const i = Math.floor(Math.random() * nodePositions.length);
        const j = (i + 4 + Math.floor(Math.random() * 12)) % nodePositions.length;
        addEdge(nodePositions[i], nodePositions[j]);
      }

      // параллакс камеры (только при ховере)
      const targetX = hovering ? mouseNorm.x * 0.25 : 0;
      const targetY = hovering ? mouseNorm.y * 0.2 : 0;
      camTarget.x = THREE.MathUtils.lerp(camTarget.x, targetX, 0.06);
      camTarget.y = THREE.MathUtils.lerp(camTarget.y, targetY, 0.06);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTarget.x, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTarget.y, 0.08);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth || W;
      const h = wrapRef.current.clientHeight || H;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // автоскрытие хинта
    setTimeout(() => {
      if (hintRef.current) hintRef.current.style.opacity = "0";
    }, 3000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cvs.removeEventListener("pointerenter", onEnter);
      cvs.removeEventListener("pointerleave", onLeave);
      cvs.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cvs.removeEventListener("pointermove", onMove);
      cvs.removeEventListener("wheel", onWheel);

      // безопасный dispose
      scene.traverse((obj: THREE.Object3D) => {
        const g = (obj as any).geometry as THREE.BufferGeometry | undefined;
        const m = (obj as any).material as THREE.Material | THREE.Material[] | undefined;
        g?.dispose?.();
        if (Array.isArray(m)) m.forEach((mm) => mm?.dispose?.());
        else m?.dispose?.();
      });
      renderer.dispose();
      el.innerHTML = "";
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={hintRef}
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          padding: "6px 10px",
          background: "rgba(12, 39, 63, .55)",
          border: "1px solid rgba(127,230,255,.2)",
          borderRadius: 8,
          fontSize: 12,
          color: "#9bdfff",
          transition: "opacity .6s"
        }}
      >
        потяни, чтобы покрутить
      </div>
    </div>
  );
}
