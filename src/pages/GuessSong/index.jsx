import { useRef, useState } from 'react'
import BackButton from '../../components/BackButton'

const SC_CLIENT_ID = import.meta.env.VITE_SC_CLIENT_ID ?? ''

const SNIPPET_LEN = 1.05 // seconds

function extractTrackInput(raw) {
  const s = raw.trim()
  if (!s) return null
  try { new URL(s); return s } catch { return null }
}

async function fetchTrack(input) {
  const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(input)}&client_id=${SC_CLIENT_ID}`
  const res = await fetch(resolveUrl)
  if (!res.ok) throw new Error('Não foi possível resolver a faixa do SoundCloud')
  const data = await res.json()
  if (!data.streamable) throw new Error('Esta faixa não está disponível para streaming')
  return {
    id:           data.id,
    title:        data.title,
    artist:       data.user.username,
    art:          data.artwork_url || data.user.avatar_url || '',
    streamUrl:    `${data.stream_url}?client_id=${SC_CLIENT_ID}`,
    duration:     data.duration / 1000,
    permalinkUrl: data.permalink_url,
  }
}

// ── Reusable UI primitives ────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[18px] border border-white/8 ${className}`}
      style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02))', boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}
    >
      {children}
    </div>
  )
}

function Btn({ children, variant = 'primary', disabled, onClick, className = '' }) {
  const styles = {
    primary:   { background: '#ff8800', color: '#0b0f14', boxShadow: '0 6px 16px rgba(255,136,0,.35)' },
    secondary: { background: '#1f2937', color: '#d7e3f8' },
    ghost:     { background: 'transparent', border: '1px solid rgba(255,255,255,.14)', color: '#d7e3f8' },
    warning:   { background: '#f59e0b', color: '#111827', boxShadow: '0 6px 16px rgba(245,158,11,.35)' },
    success:   { background: '#ff8800', color: '#03120a', boxShadow: '0 6px 16px rgba(34,197,94,.35)' },
    danger:    { background: '#ef4444', color: '#fff',    boxShadow: '0 6px 16px rgba(239,68,68,.35)' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-3.5 py-3 font-bold text-sm cursor-pointer border-0 transition-all duration-75 active:translate-y-px disabled:grayscale-50 disabled:brightness-75 disabled:cursor-not-allowed ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GuessSong() {
  const audioRef   = useRef(null)
  const [trackUrl, setTrackUrl]     = useState('')
  const [track, setTrack]           = useState(null)
  const [loading, setLoading]       = useState(false)
  const [trackInfo, setTrackInfo]   = useState('Nenhuma faixa carregada')
  const [audioReady, setAudioReady] = useState(false)
  const [snippetStart, setSnippetStart] = useState(0)
  const [revealed, setRevealed]     = useState(false)
  const [guessTitle, setGuessTitle] = useState('')
  const [guessArtist, setGuessArtist] = useState('')
  const [feedback, setFeedback]     = useState(null) // { text, ok }
  const [round, setRound]           = useState(0)
  const [score, setScore]           = useState(0)

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.crossOrigin = 'anonymous'
    return audioRef.current
  }

  const handleLoad = async () => {
    const input = extractTrackInput(trackUrl)
    if (!input) { alert('Insere um URL do SoundCloud válido'); return }
    setLoading(true)
    setTrackInfo('A carregar faixa…')
    try {
      const t = await fetchTrack(input)
      setTrack(t)
      setTrackInfo('1 faixa carregada')
      setupRound()
    } catch (e) {
      setTrackInfo('Erro ao carregar faixa')
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const setupRound = () => {
    setRevealed(false)
    setFeedback(null)
    setGuessTitle('')
    setGuessArtist('')
    setAudioReady(false)
    setRound(r => r + 1)
  }

  const playSnippet = (fromStart = false) => {
    if (!track) return
    const audio = getAudio()
    if (!fromStart) {
      audio.src = track.streamUrl
      const maxPos    = Math.max(5, track.duration - 5)
      const randomPos = Math.min(Math.random() * maxPos, maxPos - SNIPPET_LEN)
      audio.currentTime = randomPos
      setSnippetStart(randomPos)
    } else {
      audio.currentTime = snippetStart
    }
    audio.play()
      .then(() => {
        setAudioReady(true)
        setTimeout(() => audio.pause(), SNIPPET_LEN * 1000)
      })
      .catch(() => alert('Não foi possível reproduzir esta faixa.'))
  }

  const handleSubmit = () => {
    if (!track) return
    let pts = 0
    if (guessTitle.trim() && track.title.toLowerCase().includes(guessTitle.toLowerCase().trim())) pts++
    if (guessArtist.trim() && track.artist.toLowerCase().includes(guessArtist.toLowerCase().trim())) pts++
    if (pts > 0) {
      setScore(s => s + pts)
      setFeedback({ text: `✅ Correto! +${pts} ponto(s)`, ok: true })
    } else {
      setFeedback({ text: '❌ Não foi dessa vez', ok: false })
    }
  }

  const handleReveal = () => setRevealed(true)

  const muted = '#7c8aa5'

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(1000px 600px at 10% 10%, #182235 0%, #0b0f14 60%)', color: '#e6edf6', fontFamily: 'ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif' }}>
      <div className="max-w-[1100px] mx-auto px-6 py-6 pb-20">

        {/* Header */}
        <header className="flex items-center gap-4 flex-wrap mb-4">
          <div className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(20px,4vw,28px)' }}>🎵 Guess the Song</div>
          <div className="px-2.5 py-1.5 rounded-full text-[12px]" style={{ background: '#1f2937', color: '#cfe3ff' }}>
            SoundCloud Edition – snippets de 1 segundo
          </div>
        </header>

        {/* Track loader */}
        <Card className="p-4 mb-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-[13px] mb-1.5" style={{ color: muted }}>SoundCloud Track URL</label>
              <input
                type="url"
                value={trackUrl}
                onChange={e => setTrackUrl(e.target.value)}
                placeholder="https://soundcloud.com/artist/track"
                className="w-full rounded-xl px-3.5 py-3 border border-white/8 outline-none text-sm"
                style={{ background: '#0f172a', color: '#e6edf6' }}
              />
            </div>
            <Btn onClick={handleLoad} disabled={loading}>{loading ? 'A carregar…' : 'Carregar faixa'}</Btn>
          </div>
          <p className="mt-2 text-[11px]" style={{ color: muted }}>
            Nota: usa a API pública do SoundCloud. Algumas faixas podem não estar disponíveis na tua região.
          </p>
        </Card>

        {/* Main grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>

          {/* Game panel */}
          <Card className="p-4 flex flex-col gap-3">
            {/* Artwork */}
            <div
              className="w-full rounded-2xl border border-white/6 flex items-center justify-center overflow-hidden"
              style={{ aspectRatio: '1/1', background: '#0f172a' }}
            >
              {revealed && track?.art
                ? <img src={track.art} alt="Capa" className="w-full h-full object-cover" />
                : <span className="text-[11px]" style={{ color: muted }}>Arte escondida durante o jogo…</span>
              }
            </div>

            {/* Info chips */}
            <div className="flex gap-2.5 flex-wrap items-center text-[13px]" style={{ color: muted }}>
              <span className="px-2.5 py-1.5 rounded-xl border border-dashed border-white/20">{trackInfo}</span>
              <span className="px-2.5 py-1.5 rounded-xl border border-dashed border-white/20">Snippet: ~1s de posição aleatória</span>
            </div>

            {/* Playback buttons */}
            <div className="flex gap-2 flex-wrap">
              <Btn variant="success" disabled={!track} onClick={() => playSnippet(false)}>▶︎ Play 1 segundo</Btn>
              <Btn variant="secondary" disabled={!audioReady} onClick={() => playSnippet(true)}>↻ Repetir snippet</Btn>
              <Btn variant="warning" disabled={!track} onClick={handleReveal}>Revelar resposta</Btn>
              <Btn variant="ghost" disabled={!track} onClick={setupRound}>Próxima →</Btn>
            </div>

            {/* Guess inputs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Título da música', val: guessTitle, set: setGuessTitle, placeholder: 'Escreve o título…' },
                { label: 'Artista',          val: guessArtist, set: setGuessArtist, placeholder: 'Escreve o artista…' },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-[13px] mb-1" style={{ color: muted }}>{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl px-3.5 py-3 border border-white/8 outline-none text-sm"
                    style={{ background: '#0b1222', color: '#e6edf6' }}
                  />
                </div>
              ))}
            </div>

            {/* Submit + feedback */}
            <div className="flex items-center gap-3 flex-wrap">
              <Btn onClick={handleSubmit} disabled={!track}>Submeter resposta</Btn>
              {feedback && (
                <span
                  className="px-2.5 py-1.5 rounded-full text-[13px] font-bold"
                  style={{ color: feedback.ok ? '#ff8800' : '#fca5a5' }}
                >
                  {feedback.text}
                </span>
              )}
            </div>

            {/* Revealed answer */}
            {revealed && track && (
              <div className="flex flex-col gap-1.5">
                <p className="font-extrabold text-lg">{track.title} — {track.artist}</p>
                {track.permalinkUrl && (
                  <a href={track.permalinkUrl} target="_blank" rel="noopener noreferrer" className="text-[#93c5fd] no-underline text-sm">
                    Abrir no SoundCloud ↗
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* Scoreboard */}
          <Card className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {[['Ronda', round], ['Pontuação', score]].map(([label, val]) => (
                <div key={label} className="rounded-xl p-3.5 border border-white/6" style={{ background: '#0f172a' }}>
                  <div className="text-[11px] mb-1" style={{ color: muted }}>{label}</div>
                  <div className="text-2xl font-bold">{val}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3.5 border border-white/6" style={{ background: '#0f172a' }}>
              <div className="text-[11px] mb-2" style={{ color: muted }}>Regras</div>
              <ul className="text-sm pl-4 flex flex-col gap-1" style={{ color: '#e6edf6' }}>
                <li>+1 ponto pelo <strong>título correto</strong></li>
                <li>+1 ponto pelo <strong>artista correto</strong></li>
                <li>Escreve um ou ambos, depois clica em <strong>Submeter</strong>.</li>
                <li>O snippet é ~1 segundo de uma posição aleatória.</li>
              </ul>
            </div>

            <div className="rounded-xl p-3.5 border border-white/6" style={{ background: '#0f172a' }}>
              <div className="text-[11px] mb-2" style={{ color: muted }}>Dicas</div>
              <ul className="text-sm pl-4 flex flex-col gap-1" style={{ color: '#e6edf6' }}>
                <li>Funciona melhor com faixas populares com streaming completo.</li>
                <li>Algumas faixas podem não reproduzir por restrições regionais.</li>
              </ul>
            </div>
          </Card>
        </div>

        <p className="mt-4 text-[11px]" style={{ color: muted }}>
          Construído com a API do SoundCloud. Sem servidores, sem rastreamento.
        </p>
      </div>

      <BackButton />
    </div>
  )
}
