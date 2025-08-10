
import React from 'react'

export const IconRocket = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width="20" height="20" {...props}>
    <defs>
      <linearGradient id="gr" x1="0" x2="1"><stop offset="0" stopColor="#00d1ff"/><stop offset="1" stopColor="#6f88ff"/></linearGradient>
    </defs>
    <path d="M34 6c9 3 17 13 19 22l-9 9c-9-2-19-10-22-19L34 6z" fill="url(#gr)" stroke="#0b1a34" strokeWidth="2"/>
    <path d="M16 48l-4 10 10-4c-2-3-4-5-6-6z" fill="#ffb86b" stroke="#0b1a34" strokeWidth="2"/>
    <circle cx="40" cy="20" r="5" fill="#0b1a34" opacity=".25"/>
  </svg>
)

export const IconBrain = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width="20" height="20" {...props}>
    <path d="M22 18a8 8 0 0 1 16 0 8 8 0 0 1 8 8 8 8 0 0 1-3 6 8 8 0 0 1-9 7 8 8 0 0 1-12-5 8 8 0 0 1-8-8 8 8 0 0 1 8-8z" fill="#7fd1ff" stroke="#0b1a34" strokeWidth="2"/>
    <path d="M20 26h8m8 0h8M24 32h6m8 0h6" stroke="#0b1a34" strokeWidth="2"/>
  </svg>
)

export const IconShield = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width="20" height="20" {...props}>
    <path d="M32 6l18 8v10c0 14-10 26-18 30-8-4-18-16-18-30V14l18-8z" fill="#9fe0ff" stroke="#0b1a34" strokeWidth="2"/>
  </svg>
)

export const IconServers = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width="20" height="20" {...props}>
    <rect x="10" y="12" width="44" height="12" rx="4" fill="#b7c8ff" stroke="#0b1a34" strokeWidth="2"/>
    <rect x="10" y="28" width="44" height="12" rx="4" fill="#9fcaff" stroke="#0b1a34" strokeWidth="2"/>
    <rect x="10" y="44" width="44" height="12" rx="4" fill="#86bcff" stroke="#0b1a34" strokeWidth="2"/>
  </svg>
)

export const IconUpdate = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width="20" height="20" {...props}>
    <path d="M12 36a20 20 0 0 1 34-14" stroke="#6fe3ff" strokeWidth="4" fill="none"/>
    <path d="M42 10l8 10-12 2 4-12z" fill="#6fe3ff"/>
  </svg>
)

export const HeroIllustration = () => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#0066ff" stopOpacity="0.2"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g stroke="#39d8ff" strokeOpacity="0.25">
      {Array.from({length:9}).map((_,i)=> (
        <path key={i} d={`M${40+i*60} 40 C ${80+i*60} 80, ${60+i*60} 140, ${100+i*60} 180`} fill="none"/>
      ))}
    </g>
    <rect x="60" y="260" width="480" height="12" rx="6" fill="#0F1A2F" stroke="#1b2d4d"/>
    <circle cx="150" cy="150" r="28" fill="#1d2b45" stroke="#2a3f66"/>
    <rect x="120" y="175" width="60" height="50" rx="12" fill="#152034" stroke="#2a3f66"/>
    <rect x="250" y="130" width="200" height="120" rx="14" fill="#0F1A2F" stroke="#1b2d4d" filter="url(#glow)"/>
    <rect x="265" y="145" width="170" height="90" rx="10" fill="url(#heroGrad)"/>
    <rect x="310" y="260" width="110" height="10" rx="5" fill="#0F1A2F" stroke="#1b2d4d"/>
  </svg>
)

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
