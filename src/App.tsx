import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BackgroundFX from './components/BackgroundFX'
import CompareSlider from './components/CompareSlider'
import { GlobeIllustration, IconRocket, IconBrain, IconShield, IconServers, IconUpdate } from './components/Illustrations'
import NeonCore3D from './components/NeonCore3D'

function useTypewriter(text: string, speed = 90){
  const [out, setOut] = useState('')
  useEffect(()=>{
    let i = 0; const id = setInterval(()=>{ setOut(text.slice(0, i+1)); i++; if(i>=text.length) clearInterval(id) }, speed)
    return ()=>clearInterval(id)
  }, [text, speed])
  return out
}

function Section({ id, title, children, alt }: {id?:string, title:string, children:React.ReactNode, alt?:boolean}){
  return (
    <section id={id} data-reveal style={{position:'relative', padding:'64px 0', background: alt?'rgba(10,16,33,0.7)':'rgba(8,13,26,0.7)', borderTop:'1px solid rgba(255,255,255,.06)', zIndex:2}}>
      <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px', position:'relative'}}>
        <h2 className='h2' style={{margin:0}}>{title}</h2>
        <div style={{marginTop:16, color:'#a9b7d0', lineHeight:1.7}}>{children}</div>
      </div>
    </section>
  )
}

/** i18n */
const M = {
  ru: {
    nav: { about: 'О проекте', advantages: 'Преимущества', how: 'Как пользоваться', pricing: 'Прайс', faq: 'FAQ' },
    hero_sub: 'стабильный доступ в интернет без ограничений!',
    free_now: 'Проект сейчас ',
    free: 'бесплатный',
    cta_download: 'Скачать для Windows',
    cta_benefits: 'Преимущества',
    badges: ['Discord','Telegram Web','YouTube'],
    about_t: 'О проекте',
    about_p1: 'StabiLink — настольное приложение для Windows, которое помогает обеспечить стабильную работу популярных онлайн-сервисов при проблемах с доступом. Вы запускаете программу, нажимаете START, а дальше система автоматически подбирает оптимальные параметры подключения под вашего провайдера и ОС.',
    about_l1: 'Поддерживаются мессенджеры, видеоплатформы и стрим-сервисы (полный список — внутри приложения).',
    about_l2: 'Алгоритмы адаптируются под сетевые условия — никаких сложных настроек.',
    about_l3: 'Коммуникация юридически нейтральна: мы не популяризируем способы доступа к ресурсам с ограничениями и не рекламируем VPN.',
    about_p2: 'Если у вас были сложности с доступом к сервисам вроде Discord, Telegram Web или YouTube, StabiLink стремится вернуть комфорт пользования и стабильность соединения, соблюдая требования законодательства РФ.',
    adv_t: 'Преимущества',
    think_t: 'Ты всё ещё думаешь?',
    think_p: 'Начинай скорее пользоваться интернетом как в старые добрые времена — без забот!',
    think_cta: 'Скачать сейчас',
    how_t: 'Как начать пользоваться?',
    how_s1: '1 — Перейди в Telegram',
    how_s1d: 'Подпишись на официальный канал.',
    how_s2: '2 — Скачай приложение',
    how_s2d: 'Установи StabiLink для Windows.',
    how_s3: '3 — Нажми START',
    how_s3d: 'И пользуйся как обычно.',
    demo_t: 'Демонстрация',
    demo_p: 'Перетащи ползунок и сравни работу популярных сайтов до/после запуска приложения.',
    pricing_t: 'Прайс',
    faq_t: 'FAQ',
    contacts_t: 'Контакты',
    contacts_p: 'Официальный канал с новостями и ссылками на загрузку.',
    open_tg: 'Открыть Telegram',
    footer_rights: 'Все права защищены.',
    privacy: 'Политика конфиденциальности'
  },
  en: {
    nav: { about: 'About', advantages: 'Benefits', how: 'How to use', pricing: 'Pricing', faq: 'FAQ' },
    hero_sub: 'stable access to the internet without limits!',
    free_now: 'The project is currently ',
    free: 'free',
    cta_download: 'Download for Windows',
    cta_benefits: 'See benefits',
    badges: ['Discord','Telegram Web','YouTube'],
    about_t: 'About',
    about_p1: 'StabiLink is a Windows desktop app that keeps popular online services stable when access is problematic. Launch the app, press START — the system auto-tunes connection parameters for your ISP and OS.',
    about_l1: 'Supports messengers, video platforms and streaming (full list inside the app).',
    about_l2: 'Algorithms adapt to network conditions — no complex setup.',
    about_l3: 'Communication is legally neutral: we do not promote methods of accessing restricted resources and do not advertise VPN.',
    about_p2: 'If you had issues reaching services like Discord, Telegram Web or YouTube, StabiLink aims to restore comfortable usage and connection stability while complying with local law.',
    adv_t: 'Benefits',
    think_t: 'Still thinking?',
    think_p: 'Start using the internet like the good old days — worry-free!',
    think_cta: 'Download now',
    how_t: 'How to start?',
    how_s1: '1 — Join Telegram',
    how_s1d: 'Subscribe to the official channel.',
    how_s2: '2 — Download the app',
    how_s2d: 'Install StabiLink for Windows.',
    how_s3: '3 — Press START',
    how_s3d: 'Use it as usual.',
    demo_t: 'Demo',
    demo_p: 'Drag the slider to compare sites before/after enabling the app.',
    pricing_t: 'Pricing',
    faq_t: 'FAQ',
    contacts_t: 'Contacts',
    contacts_p: 'Official channel with news and download links.',
    open_tg: 'Open Telegram',
    footer_rights: 'All rights reserved.',
    privacy: 'Privacy policy'
  }
} as const;


/* Custom raster icon helper for consistent sizing */
const RasterIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', ...props }) => (
  <img
    loading="lazy"
    draggable={false}
    className={['icon-24', className].filter(Boolean).join(' ')}
    {...props}
  />
);export default function App(){
  const title = useTypewriter('STABILINK', 85)
  const [active, setActive] = useState('about')
  const [lang, setLang] = useState<'ru'|'en'>(()=> (localStorage.getItem('lang') as any) || 'ru')
  useEffect(()=>{ localStorage.setItem('lang', lang) }, [lang])

  useEffect(()=>{
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ setActive((en.target as HTMLElement).id) } })
    },{threshold:0.4})
    ;['about','advantages','how','pricing','faq','contacts'].forEach(id=>{ const el = document.getElementById(id); if(el) io.observe(el) })
    return ()=>io.disconnect()
  },[])

  useEffect(()=>{
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ (e.target as HTMLElement).classList.add('reveal-in'); io.unobserve(e.target as Element) } }) },{threshold:0.12})
    els.forEach(el=>io.observe(el))
    return ()=>io.disconnect()
  },[])

  return (
    <div>
      <BackgroundFX/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet"/>

      {/* NAV */}
      <header style={{position:'sticky', top:0, zIndex:3, background:'rgba(7,11,21,.65)', backdropFilter:'blur(8px)', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#00d1ff,#0066ff)', display:'grid', placeItems:'center', fontWeight:900, color:'#09111f'}}>S</div>
            <span style={{fontFamily:'Space Grotesk', fontWeight:700, letterSpacing:1}}>StabiLink</span>
          </div>
          <nav className='navbar' style={{display:'flex', alignItems:'center', gap:14, fontWeight:600, fontSize:14}}>
            {[
              {id:'about', label:M[lang].nav.about},
              {id:'advantages', label:M[lang].nav.advantages},
              {id:'how', label:M[lang].nav.how},
              {id:'pricing', label:M[lang].nav.pricing},
              {id:'faq', label:M[lang].nav.faq},
            ].map(i=> (<a key={i.id} href={`#${i.id}`} className={active===i.id? 'active':''}>{i.label}</a>))}
          </nav>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <button className='btn-ghost' style={{padding:'8px 10px', borderRadius:8}} onClick={()=>setLang(lang==='ru'?'en':'ru')}>{lang.toUpperCase()}</button>
            <button onClick={()=>window.open('https://t.me/stabilink','_blank')} className='btn'>Скачать</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section data-reveal style={{position:'relative', padding:'90px 0 56px', borderBottom:'1px solid rgba(255,255,255,.08)', zIndex:2}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:24}}>
          <div>
            <motion.h1 initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:.6}} className='h1' style={{margin:'0 0 12px'}}>
              <span style={{display:'block'}}>{title}<span style={{color:'#6fe3ff'}}>|</span></span>
              <span style={{display:'block', color:'#e6f0ff', fontFamily:'Inter'}}>{M[lang].hero_sub}</span>
            </motion.h1>
            <p style={{margin:'8px 0 0', maxWidth:640}}>{M[lang].free_now}<b style={{color:'#75e7ff'}}>{M[lang].free}</b>.</p>
            <div style={{marginTop:18}}>
              <button className='btn' onClick={()=>window.open('https://t.me/stabilink','_blank')}>{M[lang].cta_download}</button>
              <button className='btn btn-ghost' onClick={()=>document.getElementById('advantages')?.scrollIntoView({behavior:'smooth'})}>{M[lang].cta_benefits}</button>
            </div>
            <div style={{marginTop:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
              {M[lang].badges.map((b,i)=> <span key={i} className={'badge'+(i===2?' badge-cyan':'')}>{b}</span>)}
            </div>
          </div>

    <div style={{ height: 360, display: 'grid' }}>
      <NeonCore3D />
    </div>
  </div> {/* ← закрыли grid */}
      </section>

      {/* ABOUT */}
      <Section id='about' title={M[lang].about_t}>
        <div style={{display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:20, alignItems:'center'}}>
          <div>
            <p>{M[lang].about_p1}</p>
            <ul style={{marginTop:12, lineHeight:1.8}}>
              <li>{M[lang].about_l1}</li>
              <li>{M[lang].about_l2}</li>
              <li>{M[lang].about_l3}</li>
            </ul>
            <p style={{marginTop:12}}>{M[lang].about_p2}</p>
          </div>
          <div className='card' style={{height:260, borderRadius:16, display:'grid', placeItems:'center'}}>
            <GlobeIllustration/>
          </div>
        </div>
      </Section>

      {/* ADVANTAGES */}
      <Section id='advantages' title={M[lang].adv_t} alt>
        <ul style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, padding:0, listStyle:'none', margin:0}}>
          {[
            {icon:<RasterIcon className="icon-24" src="/icons/start.webp" alt="START" />, t:'Быстрый запуск — одна кнопка START'},
            {icon:<RasterIcon className="icon-24" src="/icons/brain.webp" alt="AI Brain" />, t:'Много алгоритмов и автоадаптация'},
            {icon:<RasterIcon className="icon-24" src="/icons/passthrough-shield.webp" alt="Passthrough shield" />, t:'Автовыбор лучшей стратегии'},
            {icon:<RasterIcon src="/icons/free.webp" alt="FREE" />, t:'Абсолютно бесплатно'},
            {icon:<RasterIcon src="/icons/best-branch.webp" alt="Best strategy" />, t:'Не вмешивается в ваш реальный трафик'},
          ].map((b,i)=> (
            <li key={i} className='card' style={{borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:10}}>{b.icon}<span>{b.t}</span></li>
          ))}
        </ul>
      </Section>

      {/* THINK CTA */}
      <Section title={M[lang].think_t}>
        {M[lang].think_p}
        <div style={{marginTop:16}}>
          <button className='btn' onClick={()=>window.open('https://t.me/stabilink','_blank')}>{M[lang].think_cta}</button>
        </div>
      </Section>

      {/* HOW TO */}
      <Section id='how' title={M[lang].how_t} alt>
  <ol className="steps" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12 }}>
    <li className="card" style={{ borderRadius:16, padding:'16px 18px' }}>
      <span className="num">1</span>
      <b>{M[lang].how_s1}</b><br/>
      Нет сложных настроек в браузере
    </li>
    <li className="card" style={{ borderRadius:16, padding:'16px 18px' }}>
      <span className="num">2</span>
      <b>{M[lang].how_s2}</b><br/>
      Выбираете режим, запускаете — и всё!
    </li>
    <li className="card" style={{ borderRadius:16, padding:'16px 18px' }}>
      <span className="num">3</span>
      <b>{M[lang].how_s3}</b><br/>
      Откроется удобная веб‑панель с подсказками
    </li>
  </ol>
</Section>

      {/* DEMO */}
      <Section title={M[lang].demo_t}>
        <p>{M[lang].demo_p}</p>
        <div style={{marginTop:16}}><CompareSlider/></div>
      </Section>

      {/* PRICING */}
      <Section id='pricing' title={M[lang].pricing_t} >
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
          <div className='card' style={{borderRadius:16, padding:20}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <h3 className='h3' style={{margin:0}}>BASIC</h3>
              <span className='pill'>Рекомендуем</span>
            </div>
            <div className='price' style={{marginTop:10}}>₽ 0</div>
            <div className='note'>Бесплатная версия</div>
            <ul style={{listStyle:'none', padding:0, marginTop:12}}>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><RasterIcon src="/icons/free.webp" alt="FREE" />Большое кол-во сервисов</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><img src="/icons/dot.webp" alt="" className="bullet-dot" />Автоматический поиск стратегий</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><img src="/icons/dot.webp" alt="" className="bullet-dot" />Автообновления</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><RasterIcon src="/icons/passthrough-shield.webp" alt="Passthrough shield" />Техподдержка 24/7</li>
            </ul>
            <button className='btn' style={{marginTop:16, width:'100%'}} onClick={()=>window.open('https://t.me/stabilink','_blank')}>Скачать бесплатно</button>
          </div>
          <div className='card' style={{borderRadius:16, padding:20, opacity:.85}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <h3 className='h3' style={{margin:0}}>PRO</h3>
            </div>
            <div className='price' style={{marginTop:10}}>Скоро</div>
            <div className='note'>Платная версия</div>
            <ul style={{listStyle:'none', padding:0, marginTop:12}}>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><RasterIcon className="icon-24" src="/icons/passthrough-shield.webp" alt="Passthrough shield" />Все преимущества BASIC</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><img src="/icons/dot.webp" alt="" className="bullet-dot" />ИИ на борту (автоадаптация)</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><RasterIcon src="/icons/free.webp" alt="FREE" />Расширенное кол-во сервисов</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><img src="/icons/dot.webp" alt="" className="bullet-dot" />Реконнект при сбоях</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><RasterIcon src="/icons/free.webp" alt="FREE" />Без ограничений по сессии</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconRocket/>Улучшенные стратегии</li>
            </ul>
            <button className='btn btn-disabled' style={{marginTop:16, width:'100%'}} disabled>Скоро доступно</button>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id='faq' title={M[lang].faq_t} alt>
        <details className='card' style={{borderRadius:14, padding:16, marginBottom:12}}>
          <summary><b>Вы обычное стандартное VPN?</b></summary>
          <div style={{marginTop:8}}>Нет. Мы не используем VPN. Публичная версия сайта и приложения не содержит упоминаний и функциональности рекламы VPN.</div>
        </details>
        <details className='card' style={{borderRadius:14, padding:16, marginBottom:12}}>
          <summary><b>Ваше приложение платное?</b></summary>
          <div style={{marginTop:8}}>Сейчас сервис полностью бесплатный. В будущем появится версия PRO с расширенными возможностями.</div>
        </details>
        <details className='card' style={{borderRadius:14, padding:16, marginBottom:12}}>
          <summary><b>Какие ОС поддерживаются?</b></summary>
          <div style={{marginTop:8}}>Windows 7–11.</div>
        </details>
        <details className='card' style={{borderRadius:14, padding:16, marginBottom:12}}>
          <summary><b>Есть ли версия для телефона?</b></summary>
          <div style={{marginTop:8}}>Пока нет. Планируем iOS и Android в будущем.</div>
        </details>
        <details className='card' style={{borderRadius:14, padding:16}}>
          <summary><b>Планируется ли версия для macOS?</b></summary>
          <div style={{marginTop:8}}>В ближайшее время не планируем.</div>
        </details>
      </Section>

      {/* CONTACTS */}
      <Section id='contacts' title={M[lang].contacts_t}>
        <p>{M[lang].contacts_p}</p>
        <button className='btn btn-ghost' onClick={()=>window.open('https://t.me/stabilink','_blank')}>{M[lang].open_tg}</button>
      </Section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,.08)', padding:'28px 0', background:'rgba(10,15,29,.85)', position:'relative', zIndex:2}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, alignItems:'center', fontSize:14, color:'#9fb0d1'}}>
          <div>
            <div style={{color:'#e6f0ff', fontWeight:600}}>StabiLink</div>
            <div style={{marginTop:6}}>© {new Date().getFullYear()} {M[lang].footer_rights}</div>
          </div>
          <div style={{textAlign:'center'}}>
            {['about','advantages','how','pricing','faq','contacts'].map(id=> (
              <a key={id} href={`#${id}`} onClick={(e)=>{e.preventDefault(); document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}} style={{marginRight:10, color:'#9fb0d1'}}>
                {id==='about'?M[lang].nav.about:id==='advantages'?M[lang].nav.advantages:id==='how'?M[lang].nav.how:id==='pricing'?M[lang].nav.pricing:id==='faq'?M[lang].nav.faq:M[lang].contacts_t}
              </a>
            ))}
          </div>
          <div style={{textAlign:'right'}}>
            <a href="/privacy.html" style={{color:'#9fb0d1'}}>{M[lang].privacy}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
