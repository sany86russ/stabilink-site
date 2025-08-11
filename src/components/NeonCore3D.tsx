import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NeonCore3D() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;

    const W = el.clientWidth || 600, H = el.clientHeight || 360;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:"high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 0);
    el.innerHTML = ""; el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W/H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // мягкий фон
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(8, 5),
      new THREE.MeshBasicMaterial({ color:0x061c2e, transparent:true, opacity:.22 }));
    bg.position.z = -3; scene.add(bg);

    // свет
    scene.add(new THREE.AmbientLight(0xffffff, .55));
    const dir = new THREE.DirectionalLight(0xffffff, .9); dir.position.set(3,4,2); scene.add(dir);

    // ==== СФЕРА-КАРКАС =====================================================
    const sphereWire = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 48, 48),
      new THREE.MeshBasicMaterial({ color:0x59d8ff, wireframe:true, transparent:true, opacity:.25 })
    );
    scene.add(sphereWire);

    // экваторы / меридианы (несколько аккуратных колец)
    const rings: THREE.Line[] = [];
    const ringMat = new THREE.LineBasicMaterial({ color:0x7fe6ff, transparent:true, opacity:.45 });
    const makeRing = (rx=0, ry=0) => {
      const curve = new THREE.EllipseCurve(0,0,1.05,1.05, 0, Math.PI*2, false, 0);
      const pts = curve.getSpacedPoints(220).map(p=> new THREE.Vector3(p.x,0,p.y));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, ringMat);
      line.rotation.set(rx, ry, 0); scene.add(line); rings.push(line);
    };
    makeRing(0,0); makeRing(Math.PI/2,0); makeRing(Math.PI/3, Math.PI/7);

    // logo «S» в центре (минимально, аккуратно)
    const sCanvas = document.createElement("canvas"); sCanvas.width = sCanvas.height = 256;
    const ctx = sCanvas.getContext("2d")!;
    const g = ctx.createRadialGradient(110,110,10,128,128,120);
    g.addColorStop(0,"#0aa1ce"); g.addColorStop(1,"#0b3a57");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(128,128,98,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(127,230,255,.7)"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(128,128,98,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = "#e9fbff"; ctx.font = "bold 120px Inter, Arial, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("S",128,136);
    const sTex = new THREE.CanvasTexture(sCanvas);
    const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:sTex, transparent:true, depthWrite:false, depthTest:false, opacity:.9 }));
    sSprite.scale.set(0.9,0.9,1); scene.add(sSprite);
    const sGlow = new THREE.Mesh(new THREE.SphereGeometry(0.9,32,32),
      new THREE.MeshBasicMaterial({color:0x7fe6ff, transparent:true, opacity:.12}));
    scene.add(sGlow);

    // ==== УЗЛЫ =============================================================
    const nodeGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color:0xbff1ff });
    const nodes: THREE.Mesh[] = [];
    const NODE_COUNT = 60;
    for (let i=0;i<NODE_COUNT;i++){
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.05);
      const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(v); scene.add(m); nodes.push(m);
    }

    // ==== ДУГИ-МАРШРУТЫ ====================================================
    const arcMat = new THREE.LineBasicMaterial({ color:0x6fe3ff, transparent:true, opacity:.55 });
    const arcs: THREE.Line[] = [];
    function addArc(){
      const a1 = Math.random()*Math.PI*2, a2 = Math.random()*Math.PI*2;
      const p1 = new THREE.Vector3(Math.cos(a1), Math.sin(a1*0.7)*0.7, Math.sin(a1)).normalize().multiplyScalar(1.05);
      const p2 = new THREE.Vector3(Math.cos(a2), Math.sin(a2*0.7)*0.7, Math.sin(a2)).normalize().multiplyScalar(1.05);
      const mid = p1.clone().add(p2).multiplyScalar(.5).normalize().multiplyScalar(1.35);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getSpacedPoints(140);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, arcMat); scene.add(line); arcs.push(line);
      if (arcs.length>8){ const old = arcs.shift()!; scene.remove(old); old.geometry.dispose(); }
    }
    for(let i=0;i<6;i++) addArc();
    let arcTimer = 0;

    // ==== интерактив/анимация =============================================
    let isDown=false, lx=0, ly=0, auto=true;
    const onDown=(e:PointerEvent)=>{ isDown=true; auto=false; lx=e.clientX; ly=e.clientY; };
    const onUp=()=>{ isDown=false; };
    const onMove=(e:PointerEvent)=>{ if(!isDown) return;
      const dx=(e.clientX-lx)*0.006, dy=(e.clientY-ly)*0.006;
      sphereWire.rotation.y+=dx; sphereWire.rotation.x+=dy*0.8;
      rings.forEach(r=>{ r.rotation.y+=dx; r.rotation.x+=dy*0.6; });
      lx=e.clientX; ly=e.clientY; };
    const onWheel=(e:WheelEvent)=>{ camera.position.z=THREE.MathUtils.clamp(camera.position.z+(e.deltaY>0?0.25:-0.25),2.4,5); };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, {passive:true});

    let t=0, raf=0;
    const animate=()=>{
      t+=0.016;
      if(auto){ sphereWire.rotation.y+=0.006; rings.forEach((r,i)=>r.rotation.y+=0.004+i*0.001); sSprite.rotation.z+=0.002; }
      sGlow.rotation.y+=0.001;

      // лёгкий «пульс» узлов
      const pulse = 0.9 + Math.sin(t*2.2)*0.1;
      nodes.forEach((n,i)=>{ n.scale.setScalar(pulse); });

      // периодически добавляем новую дугу
      arcTimer += 0.016; if (arcTimer>1.4){ addArc(); arcTimer=0; }

      renderer.render(scene, camera);
      raf=requestAnimationFrame(animate);
    }; animate();

    const onResize=()=>{ if(!ref.current) return;
      const w=ref.current.clientWidth||W, h=ref.current.clientHeight||H;
      renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);

    return ()=>{ cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose(); el.innerHTML=""; };
  }, []);

  return (
    <div ref={ref} style={{
      width:"100%", height:"100%",
      background:"radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.10), rgba(0,0,0,0))"
    }}/>
  );
}
