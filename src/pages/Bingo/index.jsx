import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import BackButton from '../../components/BackButton'
import { phrases } from '../../data/bingoPhrases'

const ROWS = 5
const COLS = 5
const CELLS = ROWS * COLS
const STORAGE_KEY = 'bingoCardStateV3'

function freshState() {
  return {
    order: [...phrases].sort(() => Math.random() - 0.5).slice(0, CELLS),
    marks: Array(CELLS).fill(false),
    rowCount: Array(ROWS).fill(0),
    colCount: Array(COLS).fill(0),
    rowCelebrated: false,
    colCelebrated: false,
    cardCelebrated: false,
  }
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function blastConfetti() {
  confetti({ particleCount: 320, spread: 200, startVelocity: 60, ticks: 600, origin: { y: 0.55 } })
}

// ── Bingo Overlay ────────────────────────────────────────────────────────────
function BingoOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 6000)
    return () => clearTimeout(t)
  }, [onDone])

  const items = Array.from({ length: 100 }, (_, i) => i)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none"
      style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)', animation: 'overlay-fade 0.9s ease 5.4s forwards' }}
    >
      {/* Central chancha image */}
      <img
        src="/assets/Chancha.png"
        alt="Chancha"
        className="absolute"
        style={{
          width: 'clamp(300px,80vw,700px)',
          filter: 'drop-shadow(0 0 28px rgba(0,0,0,.55))',
          animation: 'bingo-pop .9s cubic-bezier(.16,1.03,.62,.1) forwards, heartbeat 1.6s ease-in-out 1s infinite',
        }}
      />
      {/* BINGO text */}
      <div
        style={{
          fontFamily: 'Poppins,sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(3rem,11vw,9.5rem)',
          color: '#ffd700',
          whiteSpace: 'nowrap',
          textShadow: '0 0 22px rgba(255,215,0,.9),0 0 12px rgba(255,215,0,.7)',
          WebkitTextStroke: '2px rgba(0,0,0,.45)',
          animation: 'bingo-pop .9s cubic-bezier(.16,1.03,.62,1) forwards, heartbeat 1.6s ease-in-out 1s infinite',
        }}
      >
        B &nbsp;I &nbsp;N &nbsp;G &nbsp;O !
      </div>

      {/* Chancha rain */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
        {items.map(i => (
          <img
            key={i}
            src="/assets/Chancha.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}vw`,
              top: `-${170 + Math.random() * 150}px`,
              width: `${60 + Math.random() * 60}px`,
              filter: 'drop-shadow(0 4px 9px rgba(0,0,0,.45))',
              animation: `chancha-fall ${3 + Math.random() * 2}s linear ${Math.random()}s forwards`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Bingo Cell ───────────────────────────────────────────────────────────────
function BingoCell({ text, marked, onClick }) {
  const cellRef = useRef(null)

  // fitText: shrink font until content fits the cell
  useLayoutEffect(() => {
    const el = cellRef.current
    if (!el) return
    let f = 18
    el.style.fontSize = f + 'px'
    while (f > 8 && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) {
      el.style.fontSize = --f + 'px'
    }
  })

  return (
    <div
      ref={cellRef}
      onClick={onClick}
      className={`relative flex items-center justify-center aspect-square p-[6px] border-2 rounded-lg cursor-pointer select-none overflow-hidden font-semibold leading-snug break-words text-center transition-transform duration-150 ${
        marked
          ? 'border-bingo-primary bingo-marked'
          : 'border-[#e1e5ee] bg-white hover:bg-[#fafbff] active:scale-95'
      }`}
      style={{ fontSize: '16px', wordBreak: 'break-word' }}
    >
      {text}
    </div>
  )
}

// ── Main Bingo Page ──────────────────────────────────────────────────────────
export default function Bingo() {
  const [state, setState] = useState(() => {
    let s = loadState() || freshState()
    s.rowCount    ??= Array(ROWS).fill(0)
    s.colCount    ??= Array(COLS).fill(0)
    s.rowCelebrated ??= false
    s.colCelebrated ??= false
    s.cardCelebrated ??= false
    // recompute counts from marks
    s.marks.forEach((m, i) => {
      if (m) { s.rowCount[Math.floor(i / COLS)]++; s.colCount[i % COLS]++ }
    })
    saveState(s)
    return s
  })
  const [showOverlay, setShowOverlay] = useState(false)

  const toggleMark = useCallback((idx) => {
    setState(prev => {
      const s = structuredClone(prev)
      const r = Math.floor(idx / COLS)
      const c = idx % COLS
      s.marks[idx] = !s.marks[idx]
      s.rowCount[r] += s.marks[idx] ? 1 : -1
      s.colCount[c] += s.marks[idx] ? 1 : -1

      if (!s.rowCelebrated && s.rowCount[r] === COLS) { s.rowCelebrated = true; blastConfetti() }
      if (!s.colCelebrated && s.colCount[c] === ROWS) { s.colCelebrated = true; blastConfetti() }
      if (!s.cardCelebrated && s.marks.every(m => m)) {
        s.cardCelebrated = true
        blastConfetti()
        setShowOverlay(true)
      }

      saveState(s)
      return s
    })
  }, [])

  const newCard = () => {
    const s = freshState()
    saveState(s)
    setState(s)
    setShowOverlay(false)
  }

  return (
    <div className="flex items-center justify-center min-h-dvh py-5 bg-bingo-bg font-[Poppins,sans-serif] text-center" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <div
        className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,.10)]"
        style={{ width: 'min(95vw, calc((100dvh - 11rem) * 5 / 6))' }}
      >
        {/* B I N G O header */}
        <div className="flex justify-between gap-2 px-2">
          {['B','I','N','G','O'].map((letter, i) => (
            <div
              key={letter}
              className="bingo-chip grid place-items-center rounded-full font-bold text-white"
              style={{
                width: 'clamp(2.4rem,9vw,3.6rem)',
                height: 'clamp(2.4rem,9vw,3.6rem)',
                fontSize: 'calc(clamp(2.4rem,9vw,3.6rem) * 0.65)',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.45), inset 0 4px 8px rgba(0,0,0,.15), 0 0 6px rgba(0,0,0,.12)',
                opacity: 0,
                animation: `chip-drop 0.65s cubic-bezier(0.22, 1.38, 0.43, 1.06) forwards`,
                animationDelay: `${0.15 + i * 0.1}s`,
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-[7px] flex-1" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          {state.order.map((text, i) => (
            <BingoCell
              key={i}
              text={text}
              marked={state.marks[i]}
              onClick={() => toggleMark(i)}
            />
          ))}
        </div>

        {/* New card button */}
        <button
          onClick={newCard}
          className="self-center font-semibold text-white bg-bingo-primary rounded-lg px-4 py-2 shadow-[0_4px_18px_rgba(0,0,0,.10)] cursor-pointer border-0 transition-transform duration-150 hover:bg-bingo-primary-2 hover:scale-[1.04] active:scale-[.96]"
          style={{ font: '600 .95rem/1 Poppins,sans-serif' }}
        >
          🔄 Novo Cartão
        </button>
      </div>

      {showOverlay && <BingoOverlay onDone={() => setShowOverlay(false)} />}
      <BackButton />
    </div>
  )
}
