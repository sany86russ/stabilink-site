
import React, { useEffect, useRef } from 'react'

export default function BackgroundFX(){
  const gridRef = useRef<HTMLCanvasElement>(null)
  const linesRef = useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    const c1 = gridRef.current!, g = c1.getContext('2d')!
    const c2 = linesRef.current!, l = c2.getContext('2d')!
    let w = c1.width = c2.width = window.innerWidth
    let h = c1.height = c2.height = window.innerHeight
    const res = ()=>{ w=c1.width=c2.width=window.innerWidth; h=c1.height=c2.height=window.innerHeight; drawGrid() }
    window.addEventListener('resize', res)

    const drawGrid = ()=>{
      g.clearRect(0,0,w,h)
      g.strokeStyle='rgba(120,160,255,.06)'; g.lineWidth=1
      for(let x=0;x<w;x+=64){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke() }
      for(let y=0;y<h;y+=64){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke() }
    }
    drawGrid()

    const nodes = Array.from({length: 16}).map(()=>({ x: Math.random()*w, y: Math.random()*h, a: Math.random()*Math.PI*2, s: .4+.6*Math.random() }))
    let raf:number
    const loop = ()=>{
      raf = requestAnimationFrame(loop)
      l.clearRect(0,0,w,h)
      l.lineWidth = 1.5; l.strokeStyle='rgba(111,227,255,.35)'
      nodes.forEach(n=>{
        n.a += 0.004*n.s
        const x2 = n.x + Math.cos(n.a)*120, y2 = n.y + Math.sin(n.a)*120
        l.beginPath(); l.moveTo(n.x, n.y); l.quadraticCurveTo((n.x+x2)/2, (n.y+y2)/2 - 40, x2, y2); l.stroke()
        const g = l.createRadialGradient(x2,y2,0,x2,y2,60); g.addColorStop(0,'rgba(0,210,255,.12)'); g.addColorStop(1,'rgba(0,0,0,0)'); l.fillStyle=g; l.beginPath(); l.arc(x2,y2,60,0,Math.PI*2); l.fill()
      })
    }
    loop()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', res) }
  },[])

  return (<>
    <canvas ref={gridRef} style={{position:'fixed', inset:0, zIndex:0}}/>
    <canvas ref={linesRef} style={{position:'fixed', inset:0, zIndex:1}}/>
  </>)
}
