import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebaseClient'
import ChanchaImg from '../../assets/Chancha.png'

const AVATAR       = { Chancha: ChanchaImg }
const STEP_OPTIONS = [10, 50, 100]

const RANK_STYLE = {
  1: { label: '#1', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  2: { label: '#2', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
  3: { label: '#3', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
}
const RANK_DEFAULT = { label: '', color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' }

// Derive { [id]: rank } from a live { [id]: points } map
function computeRanks(pointsMap) {
  return Object.entries(pointsMap)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [id], i) => { acc[id] = i + 1; return acc }, {})
}

function AuraCard({ id, name, points, rank, enterDelay, onPointsChange }) {
  const [step, setStep]     = useState(10)
  const [pressing, setPressing] = useState(null)

  const rc         = RANK_STYLE[rank] ?? RANK_DEFAULT
  const isPositive = points >= 0
  const auraClass  = points >= 5000 ? 'aura-gold' : points >= 1000 ? 'aura-blue' : ''
  const imgSrc     = AVATAR[name] ?? `/assets/${name}.png`

  const update = async (next) => {
    onPointsChange(id, next)                                    // update parent → rank recalculates
    await updateDoc(doc(db, 'aura', id), { aura_points: next }) // persist
  }

  return (
    <article
      className="aura-card-enter"
      style={{
        animationDelay: `${enterDelay}ms`,
        background: '#FFFFFF',
        border: '1px solid #E5E5EA',
        borderRadius: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)',
        width: '260px',
        padding: '20px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Rank chip */}
      <span style={{
        alignSelf: 'flex-start',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'Space Grotesk, sans-serif',
        letterSpacing: '0.05em',
        color: rc.color,
        background: rc.bg,
        border: `1px solid ${rc.border}`,
        borderRadius: '999px',
        padding: '2px 8px',
        marginBottom: '12px',
        transition: 'color 300ms ease, background 300ms ease, border-color 300ms ease',
        visibility: rc.label ? 'visible' : 'hidden',
      }}>
        {rc.label || '#'}
      </span>

      {/* Avatar + aura glow */}
      <div style={{
        position: 'relative',
        display: 'inline-block',
        marginBottom: '14px',
        animation: 'sway 5s ease-in-out infinite',
      }}>
        <div className={`aura-ring ${auraClass}`} />
        <img
          src={imgSrc}
          alt={name}
          style={{
            display: 'block',
            width: '140px',
            aspectRatio: '9 / 16',
            objectFit: 'cover',
            borderRadius: '6px',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Name */}
      <p style={{
        fontSize: '17px',
        fontWeight: 600,
        fontFamily: 'Space Grotesk, sans-serif',
        color: '#1C1C1E',
        letterSpacing: '-0.01em',
        margin: '0 0 4px',
      }}>
        {name}
      </p>

      {/* Points */}
      <p style={{
        fontSize: '52px',
        fontWeight: 700,
        fontFamily: 'Space Grotesk, sans-serif',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        margin: '0 0 20px',
        color: isPositive ? '#34C759' : '#FF3B30',
        transition: 'color 200ms ease',
      }}>
        {isPositive && points !== 0 ? '+' : ''}
        {points.toLocaleString('pt-PT')}
      </p>

      {/* Step selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignSelf: 'stretch' }}>
        {STEP_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              border: step === s ? '1px solid rgba(0,122,255,0.35)' : '1px solid #E5E5EA',
              background: step === s ? 'rgba(0,122,255,0.08)' : '#F9FAFB',
              color: step === s ? '#007AFF' : '#8E8E93',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Dec / Inc buttons */}
      <div style={{ display: 'flex', gap: '8px', alignSelf: 'stretch' }}>
        {[
          { key: 'dec', label: `−${step}`, bg: '#FFF1F0', border: '#FECACA', color: '#FF3B30', activeBg: '#FFE4E1' },
          { key: 'inc', label: `+${step}`, bg: '#F0FDF4', border: '#BBF7D0', color: '#34C759', activeBg: '#DCFCE7' },
        ].map(({ key, label, bg, border, color, activeBg }) => (
          <button
            key={key}
            onPointerDown={() => setPressing(key)}
            onPointerUp={() => {
              setPressing(null)
              update(key === 'inc' ? points + step : points - step)
            }}
            onPointerLeave={() => setPressing(null)}
            style={{
              flex: 1,
              height: '56px',
              borderRadius: '14px',
              border: `1px solid ${border}`,
              background: pressing === key ? activeBg : bg,
              color,
              fontSize: '17px',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transform: pressing === key ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 100ms ease, background 120ms ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </article>
  )
}

export default function Aura() {
  const [players, setPlayers]   = useState([])   // stable order (load order)
  const [pointsMap, setPointsMap] = useState({}) // { [id]: currentPoints }
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // onSnapshot keeps every client in sync in real-time
    const unsub = onSnapshot(collection(db, 'aura'), snap => {
      const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      entries.sort((a, b) => b.aura_points - a.aura_points)
      setPlayers(prev => {
        // preserve card order after first load; only add new players
        if (prev.length === 0) return entries
        const existingIds = new Set(prev.map(p => p.id))
        const newEntries  = entries.filter(e => !existingIds.has(e.id))
        return [...prev, ...newEntries]
      })
      setPointsMap(Object.fromEntries(entries.map(e => [e.id, e.aura_points])))
      setLoading(false)
    })
    return unsub // unsubscribe when component unmounts
  }, [])

  const handlePointsChange = (id, next) => {
    setPointsMap(prev => ({ ...prev, [id]: next }))
  }

  // Recompute ranks from live pointsMap on every render
  const rankMap = computeRanks(pointsMap)

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{
        textAlign: 'center',
        padding: '48px 24px 28px',
        background: 'rgba(242,242,247,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(22px, 4vw, 30px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#1C1C1E',
          lineHeight: 1.2,
        }}>
          Contador de Aura
        </h1>
        <p style={{
          marginTop: '6px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
        }}>
          Chancha
        </p>
      </header>

      {/* Cards */}
      <main style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px',
        padding: '36px 20px 120px',
      }}>
        {loading ? (
          <p style={{ fontSize: '15px', color: '#9CA3AF', marginTop: '32px' }}>A carregar…</p>
        ) : (
          [...players]
            .sort((a, b) => (pointsMap[b.id] ?? 0) - (pointsMap[a.id] ?? 0))
            .map((p, i) => (
            <AuraCard
              key={p.id}
              id={p.id}
              name={p.name}
              points={pointsMap[p.id] ?? p.aura_points}
              rank={rankMap[p.id]}
              enterDelay={i * 70}
              onPointsChange={handlePointsChange}
            />
          ))
        )}
      </main>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        aria-label="Voltar para página principal"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 22px',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#1C1C1E',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'box-shadow 200ms ease, transform 120ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)'
          e.currentTarget.style.transform = 'translateX(-50%) translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'
          e.currentTarget.style.transform = 'translateX(-50%)'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(0.97)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateX(-50%) translateY(-1px)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Voltar
      </button>
    </div>
  )
}
