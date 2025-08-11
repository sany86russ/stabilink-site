import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

// простая градиентная текстура для toon
function makeToonGradient(colors: string[]) {
  const n = colors.length, data = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) {
    const c = new THREE.Color(colors[i]);
    data[i*3+0] = (c.r*255)|0; data[i*3+1] = (c.g*255)|0; data[i*3+2] = (c.b*255)|0;
  }
  const tex = new THREE.DataTexture(data, n, 1, THREE.RGBFormat);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.needsUpdate = true;
  return tex;
}

export default function NeonCore3D(){
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if(!el) return;
    if (!hasWebGL()) { el.innerHTML = "<div style='color:#9bdfff'>WebGL недоступен</div>"; return; }

    const W = el.clientWidth || 600, H = el.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:"high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 0);
    el.innerHTML = ""; el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
    camera.position.set(0,0,3.2);

    // свет
    scene.add(new THREE.AmbientLight(0xffffff, .45));
    const dir = new THREE.DirectionalLight(0xffffff, .95); dir.position.set(3,4,2); scene.add(dir);

    // фоновой мягкий градиент
    const bgGeo = new THREE.PlaneGeometry(8, 5);
    const bgMat = new THREE.MeshBasicMaterial({ color:0x062034, transparent:true, opacity:.22 });
    const bg = new THREE.Mesh(bgGeo, bgMat); bg.position.z = -3; scene.add(bg);

    // === PLANET ============================================================
    const gradient = makeToonGradient(["#08324d","#0a6c98","#12b9ea","#7fe6ff"]);
    const planetMat = new THREE.MeshToonMaterial({ color:"#18c9ff", gradientMap:gradient });
    const planetGeo = new THREE.SphereGeometry(0.95, 96, 96);
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.rotation.x = 0.25;
    scene.add(planet);

    // «ночная» полусфера — лёгкое затемнение с противоположной стороны
    const nightMat = new THREE.MeshBasicMaterial({ color:"#062944", transparent:true, opacity:.45, side:THREE.FrontSide });
    const night = new THREE.Mesh(planetGeo, nightMat);
    night.rotation.y = Math.PI; // противоположная сторона света
    planet.add(night);

    // rim glow — тонкая обводка
    const rimMat = new THREE.MeshBasicMaterial({ color:"#7fe6ff", side:THREE.BackSide, transparent:true, opacity:.25 });
    const rim = new THREE.Mesh(planetGeo, rimMat);
    rim.scale.setScalar(1.04);
    scene.add(rim);

    // === RINGS (двойное кольцо) ===========================================
    const ringMat1 = new THREE.MeshToonMaterial({ color:"#7fe6ff", gradientMap:gradient, transparent:true, opacity:.9 });
    const ringMat2 = new THREE.MeshToonMaterial({ color:"#22b8ff", gradientMap:gradient, transparent:true, opacity:.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.06, 16, 200), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.11, 16, 200), ringMat2);
    [ring1, ring2].forEach(r => { r.rotation.x = Math.PI*.42; r.rotation.y = Math.PI*.18; scene.add(r); });

    // === SATELLITES with trails ===========================================
    const sats = new THREE.Group(); scene.add(sats);
    const satGeo = new THREE.SphereGeometry(0.085, 16, 16);
    const satMat = new THREE.MeshToonMaterial({ color:"#ffffff", gradientMap:gradient });
    const TRAIL_LEN = 24;
    const trails: { line: THREE.Line, points: THREE.Vector3[] }[] = [];
    for (let i=0;i<4;i++){
      const m = new THREE.Mesh(satGeo, satMat);
      const r = 1.65 + (i%2)*0.22;
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const angle = Math.PI/6 + i*0.35;
      (m as any).userData = { r, axis, angle, speed: .6 + i*.15, t: Math.random()*Math.PI*2 };
      sats.add(m);
      // trail
      const pts = Array.from({length:TRAIL_LEN}, ()=> new THREE.Vector3());
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color:"#bff1ff", transparent:true, opacity:.4 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      trails.push({ line, points: pts });
    }

    // === NETWORK ARCS on planet ===========================================
    const arcMat = new THREE.LineBasicMaterial({ color:"#6fe3ff", transparent:true, opacity:.45 });
    const arcs: THREE.Line[] = [];
    const arcCount = 8;
    for (let i=0;i<arcCount;i++){
      const a1 = Math.random()*Math.PI*2, a2 = Math.random()*Math.PI*2;
      const p1 = new THREE.Vector3(Math.cos(a1)*.95, Math.sin(a1*.7)*.6, Math.sin(a1)*.95);
      const p2 = new THREE.Vector3(Math.cos(a2)*.95, Math.sin(a2*.7)*.6, Math.sin(a2)*.95);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.25);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getSpacedPoints(80);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, arcMat); planet.add(line); arcs.push(line);
    }

    // === STARS parallax (2 слоя) ==========================================
    function makeStars(count:number, radius:number, size:number, opacity:number){
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(count*3);
      for (let i=0;i<count;i++){
        const v = new THREE.Vector3().randomDirection().multiplyScalar(radius + Math.random()*0.5);
        arr[i*3+0]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(arr,3));
      const mat = new THREE.PointsMaterial({ color:"#bff1ff", size, sizeAttenuation:true, transparent:true, opacity });
      const points = new THREE.Points(geo, mat);
      return points;
    }
    const starsFar = makeStars(280, 3.2, 0.012, .8);
    const starsNear = makeStars(140, 2.4, 0.018, .55);
    scene.add(starsFar, starsNear);

    // === INTERACTION / ANIMATION ==========================================
    let isDown = false, lx=0, ly=0;
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    const minZ=2.5, maxZ=5.0;

    const onDown = (e:PointerEvent)=>{ isDown = true; lx=e.clientX; ly=e.clientY; };
    const onUp = ()=>{ isDown=false; };
    const onMove = (e:PointerEvent)=>{
      if(!isDown || mobile) return;
      const dx=(e.clientX-lx)*0.006, dy=(e.clientY-ly)*0.006;
      planet.rotation.y += dx; planet.rotation.x += dy*0.8;
      ring1.rotation.y += dx; ring1.rotation.x += dy*0.4;
      ring2.rotation.y += dx; ring2.rotation.x += dy*0.4;
      lx=e.clientX; ly=e.clientY;
    };
    const onWheel = (e:WheelEvent)=>{
      if(mobile) return;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY>0?0.25:-0.25), minZ, maxZ);
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive:true });

    let t=0, raf=0;
    const animate = ()=>{
      t += 0.016;
      if (mobile){ planet.rotation.y += 0.008; ring1.rotation.y += 0.006; ring2.rotation.y += 0.006; }
      starsFar.rotation.y += 0.0009;
      starsNear.rotation.y += 0.0016;

      // спутники и их хвосты
      sats.children.forEach((s, i)=>{
        const d = (s as THREE.Mesh).userData as any;
        const tt = t * d.speed;
        const pos = new THREE.Vector3(Math.cos(tt)*d.r, 0, Math.sin(tt)*d.r).applyAxisAngle(d.axis, d.angle);
        (s as THREE.Mesh).position.copy(pos);
        // trail
        const seg = trails[i];
        seg.points.pop();
        seg.points.unshift(pos.clone());
        seg.line.geometry.setFromPoints(seg.points);
        (seg.line.material as THREE.LineBasicMaterial).opacity = .28 + Math.abs(Math.sin(tt))*0.15;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = ()=>{
      if(!ref.current) return;
      const w = ref.current.clientWidth||W, h = ref.current.clientHeight||H;
      renderer.setSize(w,h); camera.aspect = w/h; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      // dispose
      [planetGeo, ring1.geometry, ring2.geometry].forEach(g=>g.dispose());
      [planetMat, nightMat, rimMat, ringMat1, ringMat2, arcMat].forEach(m=>(m as THREE.Material).dispose());
      (starsFar.geometry as THREE.BufferGeometry).dispose(); (starsNear.geometry as THREE.BufferGeometry).dispose();
      ((starsFar.material) as THREE.Material).dispose(); ((starsNear.material) as THREE.Material).dispose();
      trails.forEach(tl=>{ tl.line.geometry.dispose(); (tl.line.material as THREE.Material).dispose(); });
      renderer.dispose(); el.innerHTML="";
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
