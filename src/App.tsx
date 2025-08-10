
import React, { useEffect, useState } from 'react'
import BackgroundFX from './components/BackgroundFX'
import CompareSlider from './components/CompareSlider'
import { GlobeIllustration, IconRocket, IconBrain, IconShield, IconServers, IconUpdate } from './components/Illustrations'
import Globe3D from './components/Globe3D'

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

export default function App(){
  const title = useTypewriter('STABILINK', 85)
  const [active, setActive] = useState('about')

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

      <header style={{position:'sticky', top:0, zIndex:3, background:'rgba(7,11,21,.65)', backdropFilter:'blur(8px)', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#00d1ff,#0066ff)', display:'grid', placeItems:'center', fontWeight:900, color:'#09111f'}}>S</div>
            <span style={{fontFamily:'Space Grotesk', fontWeight:700, letterSpacing:1}}>StabiLink</span>
          </div>
          <nav className='navbar' style={{display:'flex', alignItems:'center', gap:14, fontWeight:600, fontSize:14}}>
            {[
              {id:'about', label:'О проекте'},
              {id:'advantages', label:'Преимущества'},
              {id:'how', label:'Как пользоваться'},
              {id:'pricing', label:'Прайс'},
              {id:'faq', label:'FAQ'},
            ].map(i=> (<a key={i.id} href={`#${i.id}`} className={active===i.id? 'active':''}>{i.label}</a>))}
          </nav>
          <div>
            <button onClick={()=>document.getElementById('contacts')?.scrollIntoView({behavior:'smooth'})} className='btn btn-ghost' style={{marginRight:12}}>Telegram</button>
            <button onClick={()=>window.open('https://t.me/stabilink','_blank')} className='btn'>Скачать</button>
          </div>
        </div>
      </header>

      <section data-reveal style={{position:'relative', padding:'90px 0 56px', borderBottom:'1px solid rgba(255,255,255,.08)', zIndex:2}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:24}}>
          <div>
            <h1 className='h1' style={{margin:'0 0 12px'}}>
              <span style={{display:'block'}}>{title}<span style={{color:'#6fe3ff'}}>|</span></span>
              <span style={{display:'block', color:'#e6f0ff', fontFamily:'Inter'}}>стабильный доступ в интернет без ограничений!</span>
            </h1>
            <p style={{margin:'8px 0 0', maxWidth:640}}>Проект сейчас <b style={{color:'#75e7ff'}}>бесплатный</b>. Скачивайте и начинайте пользоваться за пару кликов.</p>
            <div style={{marginTop:18}}>
              <button className='btn' onClick={()=>window.open('https://t.me/stabilink','_blank')}>Скачать для Windows</button>
              <button className='btn btn-ghost' onClick={()=>document.getElementById('advantages')?.scrollIntoView({behavior:'smooth'})}>Преимущества</button>
            </div>
            <div style={{marginTop:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
              <span className='badge'>Discord</span>
              <span className='badge'>Telegram Web</span>
              <span className='badge badge-cyan'>YouTube</span>
            </div>
          </div>
          <div className='card' style={{height:360, borderRadius:16, display:'grid', placeItems:'center', overflow:'hidden'}}>
            
          </div>
        </div>
      </section>

      <Section id='about' title='О проекте'>
        <div style={{display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:20, alignItems:'center'}}>
          <div>
            <p>StabiLink — настольное приложение для Windows, которое помогает обеспечить стабильную работу популярных онлайн‑сервисов при проблемах с доступом. Вы запускаете программу, нажимаете <b>START</b>, а дальше система автоматически подбирает оптимальные параметры подключения под вашего провайдера и ОС.</p>
            <ul style={{marginTop:12, lineHeight:1.8}}>
              <li>Поддерживаются мессенджеры, видеоплатформы и стрим‑сервисы (полный список — внутри приложения).</li>
              <li>Алгоритмы адаптируются под сетевые условия — никаких сложных настроек.</li>
              <li>Коммуникация юридически нейтральна: мы не популяризируем способы доступа к ресурсам с ограничениями и не рекламируем VPN.</li>
            </ul>
            <p style={{marginTop:12}}>Если у вас были сложности с доступом к сервисам вроде <b>Discord</b>, <b>Telegram Web</b> или <b>YouTube</b>, StabiLink стремится вернуть комфорт пользования и стабильность соединения, соблюдая требования законодательства РФ.</p>
          </div>
          <div className='card' style={{height:260, borderRadius:16, display:'grid', placeItems:'center'}}>
            <GlobeIllustration/>
          </div>
        </div>
      </Section>

      <Section id='advantages' title='Преимущества' alt>
        <ul style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, padding:0, listStyle:'none', margin:0}}>
          {[
            {icon:<IconRocket/>, t:'Быстрый запуск — одна кнопка START'},
            {icon:<IconBrain/>, t:'Много алгоритмов и автоадаптация'},
            {icon:<IconShield/>, t:'Автовыбор лучшей стратегии'},
            {icon:<IconServers/>, t:'Абсолютно бесплатно'},
            {icon:<IconShield/>, t:'Не вмешивается в ваш реальный трафик'},
          ].map((b,i)=> (
            <li key={i} className='card' style={{borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:10}}>{b.icon}<span>{b.t}</span></li>
          ))}
        </ul>
      </Section>

      <Section title='Ты всё ещё думаешь?'>
        Начинай скорее пользоваться интернетом как в старые добрые времена — без забот!
        <div style={{marginTop:16}}>
          <button className='btn' onClick={()=>window.open('https://t.me/stabilink','_blank')}>Скачать сейчас</button>
        </div>
      </Section>

      <Section id='how' title='Как начать пользоваться?' alt>
        <ol style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16}}>
          <li className='card' style={{borderRadius:14, padding:16}}><b>1 — Перейди в Telegram</b><br/>Подпишись на официальный канал.</li>
          <li className='card' style={{borderRadius:14, padding:16}}><b>2 — Скачай приложение</b><br/>Установи StabiLink для Windows.</li>
          <li className='card' style={{borderRadius:14, padding:16}}><b>3 — Нажми START</b><br/>И пользуйся как обычно.</li>
        </ol>
      </Section>

      <Section title='Демонстрация'>
        <p>Перетащи ползунок и сравни работу популярных сайтов до/после запуска приложения.</p>
        <div style={{marginTop:16}}><CompareSlider/></div>
      </Section>

      <Section id='pricing' title='Прайс' >
        {/* embed pricing component inline to keep file small */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
          <div className='card' style={{borderRadius:16, padding:20}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <h3 className='h3' style={{margin:0}}>BASIC</h3>
              <span className='pill'>Рекомендуем</span>
            </div>
            <div className='price' style={{marginTop:10}}>₽ 0</div>
            <div className='note'>Бесплатная версия</div>
            <ul style={{listStyle:'none', padding:0, marginTop:12}}>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconServers/>Большое кол-во сервисов</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconBrain/>Автоматический поиск стратегий</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconUpdate/>Автообновления</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconShield/>Техподдержка 24/7</li>
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
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconShield/>Все преимущества BASIC</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconBrain/>ИИ на борту (автоадаптация)</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconServers/>Расширенное кол-во сервисов</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconUpdate/>Реконнект при сбоях</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconServers/>Без ограничений по сессии</li>
              <li style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}><IconRocket/>Улучшенные стратегии</li>
            </ul>
            <button className='btn btn-disabled' style={{marginTop:16, width:'100%'}} disabled>Скоро доступно</button>
          </div>
        </div>
      </Section>

      <Section id='faq' title='FAQ' alt>
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

      <Section id='contacts' title='Контакты'>
        <p>Официальный канал с новостями и ссылками на загрузку.</p>
        <button className='btn btn-ghost' onClick={()=>window.open('https://t.me/stabilink','_blank')}>Открыть Telegram</button>
      </Section>

      <footer style={{borderTop:'1px solid rgba(255,255,255,.08)', padding:'28px 0', background:'rgba(10,15,29,.85)', position:'relative', zIndex:2}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, alignItems:'center', fontSize:14, color:'#9fb0d1'}}>
          <div>
            <div style={{color:'#e6f0ff', fontWeight:600}}>StabiLink</div>
            <div style={{marginTop:6}}>© {new Date().getFullYear()} Все права защищены.</div>
          </div>
          <div style={{textAlign:'center'}}>
            {['about','advantages','how','pricing','faq','contacts'].map(id=> (
              <a key={id} href={`#${id}`} onClick={(e)=>{e.preventDefault(); document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}} style={{marginRight:10, color:'#9fb0d1'}}>
                {id==='about'?'О проекте':id==='advantages'?'Преимущества':id==='how'?'Как пользоваться':id==='pricing'?'Прайс':id==='faq'?'FAQ':'Контакты'}
              </a>
            ))}
          </div>
          <div style={{textAlign:'right'}}>
            <a href="#" onClick={(e)=>{e.preventDefault(); alert('Покажем политику конфиденциальности позже')}} style={{color:'#9fb0d1'}}>Политика конфиденциальности</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
