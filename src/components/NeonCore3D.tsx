import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NeonCore3D() {
  const ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;

    const W = el.clientWidth || 600, H = el.clientHeight || 360;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0); // полностью прозрачный фон
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // параллакс: целевая позиция камеры
    const camTarget = new THREE.Vector3().copy(camera.position);
    const mouseNorm = { x: 0, y: 0 };

    // подсветка сцены
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 4, 2);
    scene.add(dir);

    // ——— каркас сферы
    const sphereWire = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x59d8ff, wireframe: true, transparent: true, opacity: 0.22 })
    );
    scene.add(sphereWire);

    // ——— кольца (меридианы/экваторы)
    const rings: THREE.Line[] = [];
    const ringMat = new THREE.LineBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.45 });
    function addRing(rx = 0, ry = 0) {
      const curve = new THREE.EllipseCurve(0, 0, 1.05, 1.05, 0, Math.PI * 2, false, 0);
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

    // ——— логотип S в центре
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(110, 110, 10, 128, 128, 120);
    g.addColorStop(0, "#0aa1ce");
    g.addColorStop(1, "#0b3a57");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(128, 128, 98, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(127,230,255,.7)"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(128, 128, 98, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#e9fbff"; ctx.font = "bold 120px Inter, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("S", 128, 136);
    const sTex = new THREE.CanvasTexture(c);
    const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
    sSprite.scale.set(0.9, 0.9, 1);
    scene.add(sSprite);

    // ——— узлы с мягким свечением
    const nodeGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xbff1ff });
    const nodes: THREE.Mesh[] = [];
    const glows: THREE.Sprite[] = [];
    const glowTexCanvas = document.createElement("canvas"); // маленькая круглая текстура для свечения
    glowTexCanvas.width = glowTexCanvas.height = 64;
    const gctx = glowTexCanvas.getContext("2d")!;
    const gg = gctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    gg.addColorStop(0, "rgba(191,241,255,1)");
    gg.addColorStop(1, "rgba(191,241,255,0)");
    gctx.fillStyle = gg; gctx.beginPath(); gctx.arc(32, 32, 30, 0, Math.PI * 2); gctx.fill();
    const glowTex = new THREE.CanvasTexture(glowTexCanvas);

    const NODE_COUNT = 60;
    for (let i = 0; i < NODE_COUNT; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.05);
      const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(v); scene.add(m); nodes.push(m);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.scale.set(0.12, 0.12, 1); s.position.copy(v);
      scene.add(s); glows.push(s);
    }

    // ——— дуги-маршруты (теперь «трубки» + свечение)
    const arcs: THREE.Mesh[] = [];
    function addArc() {
      const a1 = Math.random() * Math.PI * 2, a2 = Math.random() * Math.PI * 2;
      const p1 = new THREE.Vector3(Math.cos(a1), Math.sin(a1 * 0.7) * 0.7, Math.sin(a1)).normalize().multiplyScalar(1.02);
      const p2 = new THREE.Vector3(Math.cos(a2), Math.sin(a2 * 0.7) * 0.7, Math.sin(a2)).normalize().multiplyScalar(1.02);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.3);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

      const tubeGeo = new THREE.TubeGeometry(curve, 80, 0.008, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x6fe3ff, transparent: true, opacity: 0.9 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
      arcs.push(tube);

      // glow-дубликат потолще
      const glowGeo = new THREE.TubeGeometry(curve, 80, 0.018, 8, false);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);
      arcs.push(glow);

      // ограничим количество
      if (arcs.length > 18) {
        const old = arcs.splice(0, 2);
        old.forEach((m) => { scene.remove(m); (m.geometry as THREE.BufferGeometry).dispose(); (m.material as THREE.Material).dispose(); });
      }
    }
    for (let i = 0; i < 6; i++) addArc();
    let arcTimer = 0;

    // ——— управление: инерция + авто
    let isDown = false, lx = 0, ly = 0;
    let velX = 0, velY = 0;              // инерция от пользователя
    const baseAuto = 0.006;              // базовый авторотейт (всегда есть)
    const damping = 0.94;                // затухание инерции

    const onDown = (e: PointerEvent) => { isDown = true; lx = e.clientX; ly = e.clientY; hintRef.current && (hintRef.current.style.opacity = "0"); };
    const onUp = () => { isDown = false; };
    const onMove = (e: PointerEvent) => {
      mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNorm.y = (e.clientY / window.innerHeight) * -2 + 1;
      if (!isDown) return;
      const dx = (e.clientX - lx) * 0.006;
      const dy = (e.clientY - ly) * 0.006;
      velX += dx; velY += dy;          // добавляем скорость
      lx = e.clientX; ly = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.25 : -0.25), 2.4, 5);
      camTarget.z = camera.position.z; // «привязываем» цель
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    // ——— анимация
    let t = 0, raf = 0;
    const animate = () => {
      t += 0.016;

      // базовый авторотейт + инерция от пользователя (анимация не останавливается)
      sphereWire.rotation.y += baseAuto + velX;
      sphereWire.rotation.x += velY * 0.8;
      rings.forEach((r, i) => {
        r.rotation.y += baseAuto * 0.66 + velX * 0.9 + i * 0.0008;
        r.rotation.x += velY * 0.6;
      });
      velX *= damping; velY *= damping;

      // пульс узлов + мягкое свечение-пульс
      const pulse = 0.96 + Math.sin(t * 2.1) * 0.06;
      nodes.forEach((n) => n.scale.setScalar(pulse));
      glows.forEach((s) => { const p = 0.18 + (Math.sin(t * 1.9) + 1) * 0.06; (s.material as THREE.SpriteMaterial).opacity = p; });

      // дуги: иногда добавляем новую пару (трубка+glow)
      arcTimer += 0.016; if (arcTimer > 1.4) { addArc(); arcTimer = 0; }

      // параллакс камеры (очень мягкий)
      camTarget.x = THREE.MathUtils.lerp(camTarget.x, mouseNorm.x * 0.25, 0.05);
      camTarget.y = THREE.MathUtils.lerp(camTarget.y, mouseNorm.y * 0.20, 0.05);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTarget.x, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTarget.y, 0.08);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!ref.current) return;
      const w = ref.current.clientWidth || W, h = ref.current.clientHeight || H;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // авто-скрытие хинта
    setTimeout(() => { if (hintRef.current) hintRef.current.style.opacity = "0"; }, 3000);

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
    <div ref={ref} style={{ width: "100%", height: "100%", position: "relative" }}>
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
