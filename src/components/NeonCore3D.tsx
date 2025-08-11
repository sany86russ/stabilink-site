import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function useIsMobile() {
  const [m, setM] = React.useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const fn = () => setM(mq.matches);
    fn();
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return m;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Центральное «неоновое ядро» */
function CoreKnot() {
  const mesh = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.TorusKnotGeometry(0.7, 0.18, 240, 36), []);
  const mat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.75,
      thickness: 0.6,
      color: new THREE.Color("#0cd3ff"),
      emissive: new THREE.Color("#0cd3ff"),
      emissiveIntensity: 0.65,
      transparent: true,
    });
  }, []);

  useFrame((_, dt) => {
    mesh.current.rotation.y += dt * 0.35;
    mesh.current.rotation.x += dt * 0.12;
  });

  return <mesh ref={mesh} geometry={geo} material={mat} />;
}

/** Орбитальные дуги */
function Orbits() {
  const group = useRef<THREE.Group>(null!);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#6fe3ff",
        transparent: true,
        opacity: 0.45,
      }),
    []
  );

  const lines = useMemo(() => {
    const items: THREE.Line[] = [];
    for (let i = 0; i < 7; i++) {
      const radius = 1.25 + (i % 2) * 0.1;
      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.55, 0, Math.PI * 2, false, 0);
      const pts = curve.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y));
      // лёгкий наклон каждой орбиты
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const angle = (Math.PI / 6) * (i / 2 + 0.5);
      pts.forEach((v) => v.applyAxisAngle(axis, angle));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      items.push(new THREE.Line(geo, material));
    }
    return items;
  }, [material]);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.08;
  });

  return (
    <group ref={group}>
      {lines.map((ln, i) => (
        <primitive key={i} object={ln} />
      ))}
    </group>
  );
}

/** Неоновые частицы */
function Particles() {
  const group = useRef<THREE.Group>(null!);
  const geo = useMemo(() => new THREE.SphereGeometry(0.02, 8, 8), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#bff1ff" }), []);
  const pts = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 180; i++) arr.push(new THREE.Vector3().randomDirection().multiplyScalar(1.35));
    return arr;
  }, []);
  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.04;
  });
  return (
    <group ref={group}>
      {pts.map((p, i) => (
        <mesh key={i} position={p.toArray()} geometry={geo} material={mat} />
      ))}
    </group>
  );
}

export default function NeonCore3D() {
  const isMobile = useIsMobile();
  if (!hasWebGL())
    return (
      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#9bdfff" }}>
        WebGL недоступен
      </div>
    );

  return (
    <Canvas
      camera={{ position: [0, 0, 2.9], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(1200px 600px at 50% 30%, rgba(0,210,255,.08), rgba(0,0,0,0))",
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={0.7} />
      <Suspense fallback={null}>
        <group>
          <CoreKnot />
          <Orbits />
          <Particles />
        </group>
      </Suspense>
      <OrbitControls
        enableZoom={!isMobile}
        enablePan={false}
        enableRotate={!isMobile}
        autoRotate={isMobile}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
}
