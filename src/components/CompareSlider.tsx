
import React, { useState } from 'react'

function clamp01(v:number){ const n = Number.isFinite(+v) ? +v : 0; return n < 0 ? 0 : n > 100 ? 100 : n; }

export default function CompareSlider({ beforeLabel = 'До', afterLabel = 'После' }: {beforeLabel?:string, afterLabel?:string}){
  const [value, setValue] = useState(50)
  const widthPct = clamp01(value)
  return (
    <div className="card" style={{position:'relative', width:'100%', maxWidth:900, margin:'0 auto', aspectRatio:'16/9', borderRadius:16, overflow:'hidden', background:'#0a0f1a'}}>
      <div style={{position:'absolute', inset:0, color:'#93a4c1', display:'grid', placeItems:'center'}}>Скриншот «До» (плейсхолдер)</div>
      <div style={{position:'absolute', inset:0, width:`${widthPct}%`, overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#b5f0ff', background:'linear-gradient(135deg,#073041aa,#0a5666aa)'}}>Скриншот «После» (плейсхолдер)</div>
      </div>
      <div style={{position:'absolute', left:'50%', bottom:16, transform:'translateX(-50%)', width:'70%'}}>
        <input aria-label='Сравнить до/после' type='range' min={0} max={100} value={value} onChange={(e)=>setValue(parseInt((e.target as HTMLInputElement).value))} style={{width:'100%'}}/>
      </div>
      <div className='badge' style={{position:'absolute', top:8, left:12}}>{beforeLabel}</div>
      <div className='badge badge-cyan' style={{position:'absolute', top:8, right:12}}>{afterLabel}</div>
    </div>
  )
}
