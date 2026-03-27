import { useEffect, useRef } from 'react'

export function useParallaxFlag() {
  const imgRef = useRef(null)

  useEffect(() => {
    const handleMove = (e) => {
      const img = imgRef.current
      if (!img) return
      const { innerWidth: w, innerHeight: h } = window
      const rx = ((e.clientY - h / 2) / h) * 10
      const ry = ((e.clientX - w / 2) / w) * 10
      img.style.transform = `rotateX(${rx}deg) rotateY(${-ry}deg) scale(1.05)`
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return imgRef
}
