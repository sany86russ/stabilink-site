import React from 'react'

export const GlobeIllustration = () => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="glb" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d1ff" stopOpacity=".5"/><stop offset="100%" stopColor="#001129" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="300" cy="170" r="90" fill="url(#glb)" stroke="#2a3f66"/>
    <g stroke="#6fe3ff" strokeOpacity=".35">
      {Array.from({length:10}).map((_,i)=> (<circle key={i} cx="300" cy="170" r={20+i*7} fill="none"/>))}
      {Array.from({length:8}).map((_,i)=> (<path key={i} d={`M220 ${150+i*5} Q 300 90, 380 ${150+i*5}`} fill="none"/>))}
    </g>
    <circle cx="140" cy="200" r="26" fill="#1d2b45" stroke="#2a3f66"/>
    <rect x="120" y="220" width="50" height="40" rx="10" fill="#152034" stroke="#2a3f66"/>
  </svg>
)
