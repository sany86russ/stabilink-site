import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

// рисуем текстуру-лейбл на лету (круг + буква)
function makeLabelTexture(letter: string, bg = "#0a6c98", fg = "#e9fbff") {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  // фон-круг с градиентом
  const g = ctx.createRadialGradient(s*0.35, s*0.35, 10, s*0.5, s*0.5, s*0.6);
  g.addColorStop(0, bg);
  g.addColorStop(1, "#0b3a57");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(s/2, s/2, s*0.48, 0, Math.PI*2); ctx.fill();

  // обводка
  ctx.strokeStyle = "rgba(127,230,255,0.6)";
  ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.46, 0, Math.PI*2); ctx.stroke();

  // буква
  ctx.fillStyle = fg;
  ctx.font = "bold 72px Inter, Arial, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(letter, s/2, s/2 + 4);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export default function NeonCore3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!hasWebGL()) { el.innerHTML = "<div style='color:#9bdfff'>WebGL недоступен</div>"; return; }

    const W = el.clientWidth || 600, H = el.clientHeight || 360;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:"high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a1529, 0);
    el.innerHTML = ""; el.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
    camera.position.set(0,0,3.1);

    // освещение
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3,4,2);
    scene.add(dir);

    // subtle background
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(8,5),
      new THREE.MeshBasicMaterial({ color:0x062034, transparent:true, opacity:0.22 })
    ); bg.position.z = -3; scene.add(bg);

    // ======== ядро S (Sprite с неон-обводкой) =========
    // круглая «табличка» с буквой S
    const sTex = makeLabelTexture("S", "#0aa1ce", "#e9fbff");
    const sMat = new THREE.SpriteMaterial({ map: sTex, transparent:true });
    const sSprite = new THREE.Sprite(sMat);
    sSprite.scale.set(1.2, 1.2, 1);
    scene.add(sSprite);

    // лёгкое неоновое свечение ядра
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshBasicMaterial({ color:0x7fe6ff, transparent:true, opacity:0.18 })
    );
    scene.add(glow);

    // ======== орбиты (3 кольца под углами) =========
    const ringMat = new THREE.MeshBasicMaterial({ color:0x7fe6ff, transparent:true, opacity:0.65 });
    const rings: THREE.Mesh[] = [];
    const ringR = 1.55;
    const ringT = 0.035;
    const angles = [
      { x: Math.PI*0.45, y: Math.PI*0.12 },
      { x: Math.PI*-0.25, y: Math.PI*0.55 },
      { x: Math.PI*0.10, y: Math.PI*1.00 },
    ];
    angles.forEach(a => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(ringR, ringT, 16, 220), ringMat);
      r.rotation.x = a.x; r.rotation.y = a.y; scene.add(r); rings.push(r);
    });

    // ======== электроны на орбитах =========
    // Y / D / T (YouTube / Discord / Telegram)
    const labels = [
      { ch:"Y", color:"#ff4d4d" },
      { ch:"D", color:"#5865f2" },
      { ch:"T", color:"#2aa2f0" },
    ];
    type Electron = { sprite: THREE.Sprite; r: number; speed: number; axis: THREE.Vector3; tilt: number; t: number };
    const electrons: Electron[] = [];
    labels.forEach((l, i) => {
      const tex = makeLabelTexture(l.ch, l.color, "#ffffff");
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true }));
      spr.scale.set(0.45, 0.45, 1);
      scene.add(spr);
      electrons.push({
        sprite: spr,
        r: ringR,
        speed: 0.6 + i*0.12,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        tilt: Math.PI/6 + i*0.25,
        t: Math.random()*Math.PI*2
      });
    });

    // ======== декоративные линии «сети» ========
    const netMat = new THREE.LineBasicMaterial({ color:"#6fe3ff", transparent:true, opacity:0.42 });
    const nets: THREE.Line[] = [];
    for (let i=0;i<7;i++){
      const a1 = Math.random()*Math.PI*2, a2 = Math.random()*Math.PI*2;
      const p1 = new THREE.Vector3(Math.cos(a1)*0.9, Math.sin(a1*0.7)*0.6, Math.sin(a1)*0.9);
      const p2 = new THREE.Vector3(Math.cos(a2)*0.9, Math.sin(a2*0.7)*0.6, Math.sin(a2)*0.9);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.15);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getSpacedPoints(80);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, netMat);
      scene.add(line); nets.push(line);
    }

    // ======== звёзды (два слоя) ========
    function makeStars(count:number, radius:number, size:number, opacity:number) {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(count*3);
      for(let i=0;i<count;i++){
        const v = new THREE.Vector3().randomDirection().multiplyScalar(radius + Math.random()*0.5);
        arr[i*3+0]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(arr,3));
      const mat = new THREE.PointsMaterial({ color:0xbff1ff, size, sizeAttenuation:true, transparent:true, opacity });
      return new THREE.Points(geo, mat);
    }
    const starsFar = makeStars(260, 3.1, 0.012, 0.85);
    const starsNear = makeStars(140, 2.3, 0.018, 0.55);
    scene.add(starsFar, starsNear);

    // ======== интерактив / анимация ========
    let isDown=false, lx=0, ly=0;
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    const minZ=2.4, maxZ=4.8;

    const onDown = (e:PointerEvent)=>{ isDown=true; lx=e.clientX; ly=e.clientY; };
    const onUp = ()=>{ isDown=false; };
    const onMove = (e:PointerEvent)=>{
      if(!isDown || mobile) return;
      const dx=(e.clientX-lx)*0.006, dy=(e.clientY-ly)*0.006;
      sSprite.rotation.z += dx*0.5;
      rings.forEach((r,i)=>{ r.rotation.y += dx*0.8; r.rotation.x += dy*0.4; });
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

      if (mobile){
        rings.forEach((r,i)=> r.rotation.y += 0.006 + i*0.001);
        sSprite.rotation.z += 0.003;
      }
      glow.rotation.y += 0.002;
      starsFar.rotation.y += 0.0009;
      starsNear.rotation.y += 0.0016;

      // движение электронов по наклонённым орбитам
      electrons.forEach((e,i)=>{
        e.t += 0.018*e.speed;
        const pos = new THREE.Vector3(Math.cos(e.t)*e.r, 0, Math.sin(e.t)*e.r)
          .applyAxisAngle(e.axis, e.t*0.05 + e.tilt);
        e.sprite.position.copy(pos);
        // небольшой «пульс» масштаба
        const s = 0.45 + Math.sin(e.t*2.0)*0.02;
        e.sprite.scale.set(s, s, 1);
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = ()=>{
      if(!ref.current) return;
      const w = ref.current.clientWidth||W, h = ref.current.clientHeight||H;
      renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
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
