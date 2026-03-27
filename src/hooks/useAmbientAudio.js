import { useEffect, useRef, useState } from 'react'

export function useAmbientAudio(src) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    const tryPlay = () => {
      audio.play().catch(() => {
        // Autoplay blocked — wait for first gesture
        const unlock = () => {
          audio.play().catch(() => {})
          document.removeEventListener('pointerdown', unlock)
        }
        document.addEventListener('pointerdown', unlock, { once: true })
      })
    }
    tryPlay()

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
      setMuted(false)
    } else {
      audio.muted = !audio.muted
      setMuted(audio.muted)
    }
  }

  return { muted, toggle }
}
