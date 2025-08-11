import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Box() {
  const ref = useRef<any>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.8;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0cd3ff" />
    </mesh>
  );
}

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl")||c.getContext("experimental-webgl")); }
  catch { return false; }
}

export default function NeonCore3D() {
  if (!hasWebGL()) return <div style={{display:'grid',placeItems:'center',height:'100%'}}>WebGL недоступен</div>;
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%", background: "#0a1529" }}
      onCreated={(state)=>{ console.log("R3F OK", state.gl.capabilities); }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3,4,2]} />
      <Box />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
