import { useEffect, useRef } from 'react'

export function useLanterns() {
  const fieldRef = useRef(null)

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return

    const spawn = () => {
      const s = document.createElement('span')
      s.style.cssText = `
        position: absolute;
        left: 50%;
        top: 100%;
        width: 8px;
        height: 12px;
        border-radius: 2px;
        background: rgba(255,200,120,.8);
        box-shadow: 0 0 12px 2px rgba(255,200,120,.5);
        animation: float 12s linear forwards;
        --start-x: ${Math.random() * 140 - 70}vw;
        --end-x: ${Math.random() * 140 - 70}vw;
      `
      s.style.animationDuration = `${10 + Math.random() * 10}s`
      field.appendChild(s)
      setTimeout(() => s.remove(), 12_000)
    }

    const id = setInterval(spawn, 1_200)
    return () => clearInterval(id)
  }, [])

  return fieldRef
}
