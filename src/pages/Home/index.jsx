import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAmbientAudio } from '../../hooks/useAmbientAudio'
import { useFireworks }    from '../../hooks/useFireworks'

const TILES = [
  { to: '/bingo',      icon: '🎉', label: 'Bingo Online em Trieste' },
  { to: '/guess-song', icon: '🎶', label: 'Adivinhe a Música' },
  { to: '/aura',       icon: '🔮', label: 'Contador de Aura' },
]

export default function Home() {
  const { muted, toggle } = useAmbientAudio('/assets/waves.mp3')
  const { canvasRef, burstRandom } = useFireworks()
  const navigate   = useNavigate()
  const overlayRef = useRef(null)
  const [leaving, setLeaving] = useState(false)

  const handleTileClick = (to, e) => {
    // Ripple
    const tile = e.currentTarget
    const rect = tile.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const rip  = document.createElement('span')
    rip.style.cssText = `
      position:absolute;border-radius:50%;background:rgba(255,255,255,.45);
      transform:scale(0);animation:ripple .7s ease-out forwards;pointer-events:none;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top  - size / 2}px;
    `
    tile.appendChild(rip)
    rip.addEventListener('animationend', () => rip.remove())

    // Swipe overlay then navigate
    setLeaving(true)
    setTimeout(() => navigate(to), 700)
  }

  const handleTileMove = (e) => {
    const tile = e.currentTarget
    const rect = tile.getBoundingClientRect()
    const x = e.clientX - rect.left  - rect.width  / 2
    const y = e.clientY - rect.top   - rect.height / 2
    tile.style.transform = `rotateX(${(y / rect.height) * 9}deg) rotateY(${-(x / rect.width) * 9}deg) translateY(-8px)`
  }

  const handleTileLeave = (e) => {
    e.currentTarget.style.transform = ''
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white font-[Poppins,sans-serif]">

      {/* ── Flag backdrop ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img
          src="/assets/trieste_flag.jpg"
          alt=""
          aria-hidden="true"
          className="absolute object-cover"
          style={{ inset: 0, width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      </div>

      {/* ── Logo ── */}
      <header>
        <h1 className="text-center font-black tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,.5)] my-6"
            style={{ fontSize: 'clamp(2.8rem,7vw,5rem)' }}>
          <span style={{ color: '#f7f5f1' }}>CHANCHA</span>
          <span style={{ color: '#ffbd5d' }}>.it</span>
        </h1>
      </header>

      {/* ── Tiles grid ── */}
      <main className="px-[6vw] pb-24">
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))' }}>
          {TILES.map(({ to, icon, label }) => (
            <button
              key={to}
              className="tile-shimmer relative aspect-square flex flex-col items-center justify-center gap-2 text-white rounded-[20px] cursor-pointer border-0 transition-transform duration-[450ms] [transform-style:preserve-3d]"
              style={{
                background: 'linear-gradient(145deg,#ffbd5d,#ff945a 40%,#0478b7)',
                boxShadow: '0 8px 26px rgba(0,0,0,.25)',
              }}
              onClick={(e) => handleTileClick(to, e)}
              onPointerMove={handleTileMove}
              onPointerLeave={handleTileLeave}
            >
              <span className="text-[clamp(2.6rem,8vw,3.5rem)] drop-shadow-[0_3px_6px_rgba(0,0,0,.3)]" aria-hidden="true">{icon}</span>
              <h2 className="text-[clamp(1.1rem,3.5vw,1.6rem)] font-semibold m-0">{label}</h2>
            </button>
          ))}
        </div>
      </main>

      {/* ── Control dock ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-[10001]">
        <button
          onClick={burstRandom}
          title="Fireworks!"
          className="flex items-center justify-center rounded-full border-0 cursor-pointer transition-colors duration-300 active:scale-95"
          style={{ width: 'clamp(46px,14vw,60px)', height: 'clamp(46px,14vw,60px)', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
        >
          <img src="/assets/firework.png" alt="Fogos de artifício" className="w-[70%] h-[70%] object-contain pointer-events-none" />
        </button>
        <button
          onClick={toggle}
          title="Silenciar / ativar som"
          className="flex items-center justify-center rounded-full border-0 cursor-pointer transition-colors duration-300 active:scale-95"
          style={{ width: 'clamp(46px,14vw,60px)', height: 'clamp(46px,14vw,60px)', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
        >
          <img
            src="/assets/sound.png"
            alt="Som liga/desliga"
            className="w-[70%] h-[70%] object-contain pointer-events-none"
            style={{ opacity: muted ? 0.35 : 1 }}
          />
        </button>
      </div>

      {/* ── Fireworks canvas ── */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[10000]" aria-hidden="true" />

      {/* ── Page swipe overlay ── */}
      <div
        ref={overlayRef}
        className={leaving ? 'animate-swipe' : ''}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(180deg,#015c8f,#0478b7)',
          transform: 'translateY(100%)',
          pointerEvents: leaving ? 'all' : 'none',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
