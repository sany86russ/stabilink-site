
import React, { Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function useIsMobile(){
  const [m,setM] = React.useState(false)
  React.useEffect(()=>{
    const mq = window.matchMedia('(max-width: 768px)')
    const set = ()=> setM(mq.matches)
    set(); mq.addEventListener?.('change', set); return ()=> mq.removeEventListener?.('change', set)
  },[])
  return m
}

function NetSphere(){
  const geo = useMemo(()=> new THREE.SphereGeometry(1, 32, 32), [])
  const mat = useMemo(()=> new THREE.MeshBasicMaterial({ wireframe: true, color: new THREE.Color('#39d8ff'), transparent:true, opacity:0.35 }), [])
  const mesh = React.useRef<THREE.Mesh>(null!)
  useFrame((_, dt)=>{ mesh.current.rotation.y += dt * 0.1 })
  return <mesh ref={mesh} geometry={geo} material={mat} />
}

function GlowOrbs(){
  const g = new THREE.SphereGeometry(0.02, 8, 8)
  const m = new THREE.MeshBasicMaterial({ color:'#bff1ff'})
  const group = React.useRef<THREE.Group>(null!)
  const pts = React.useMemo(()=> Array.from({length:80}).map(()=>{
    const theta = Math.random()*Math.PI*2
    const phi = Math.acos(2*Math.random()-1)
    const r = 1.0
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    )
  }),[])
  useFrame((_,dt)=>{ group.current.rotation.y += dt * 0.05 })
  return (
    <group ref={group}>
      {pts.map((p,i)=> <mesh key={i} position={p.toArray()} geometry={g} material={m} />)}
    </group>
  )
}

function Arcs(){
  const mat = new THREE.LineBasicMaterial({ color:'#6fe3ff', transparent:true, opacity:.35 })
  const curves = React.useMemo(()=>{
    const arr: THREE.Vector3[][] = []
    for(let i=0;i<18;i++){
      const a1 = Math.random()*Math.PI*2, a2 = Math.random()*Math.PI*2
      const p1 = new THREE.Vector3(Math.cos(a1), Math.sin(a1)*0.3, Math.sin(a1)).normalize()
      const p2 = new THREE.Vector3(Math.cos(a2), Math.sin(a2)*0.3, Math.sin(a2)).normalize()
      arr.push([p1.multiplyScalar(1.0), p2.multiplyScalar(1.0)])
    }
    return arr
  },[])
  return <group>
      {curves.map((pair, i)=>{
        const mid = pair[0].clone().add(pair[1]).multiplyScalar(0.5).normalize().multiplyScalar(1.3)
        const curve = new THREE.QuadraticBezierCurve3(pair[0], mid, pair[1])
        const pts = curve.getPoints(40)
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const line = new THREE.Line(geo, mat)
        return <primitive key={i} object={line} />
      })}
    </group>
}

export default function Globe3D(){
  const isMobile = useIsMobile()
  return (
    <Canvas camera={{ position: [0,0,3] }} gl={{ antialias:true, alpha:true }} style={{ width:'100%', height:'100%' }}>
      <ambientLight intensity={0.4}/>
      <Suspense fallback={null}>
        <group position={[0,0,0]}>
          <NetSphere/>
          <GlowOrbs/>
          <Arcs/>
        </group>
      </Suspense>
      <OrbitControls enableZoom={!isMobile} enablePan={false} enableRotate={!isMobile} autoRotate={isMobile} autoRotateSpeed={0.8} />
    </Canvas>
  )
}
