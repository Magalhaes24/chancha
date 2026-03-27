import { useCallback, useEffect, useRef } from 'react'

const PALETTE = ['#ffec99', '#ff9b4a', '#ff4e4e']

class Particle {
  constructor(x, y, colour) {
    const ang   = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 2.5
    this.x      = x
    this.y      = y
    this.vx     = Math.cos(ang) * speed
    this.vy     = Math.sin(ang) * speed
    this.r      = Math.random() * 3 + 3
    this.alpha  = 1
    this.decay  = Math.random() * 0.012 + 0.005
    this.colour = colour
  }
  update() {
    this.x    += this.vx
    this.y    += this.vy
    this.vy   += 0.03
    this.alpha -= this.decay
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha  = this.alpha
    ctx.fillStyle    = this.colour
    ctx.shadowBlur   = 10
    ctx.shadowColor  = this.colour
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export function useFireworks() {
  const canvasRef    = useRef(null)
  const particlesRef = useRef([])
  const rafRef       = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'lighter'

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => {
        p.update()
        p.draw(ctx)
        return p.alpha > 0
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const burst = useCallback((x, y) => {
    const count = window.innerWidth < 500 ? 45 : 70
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(
        new Particle(x, y, PALETTE[Math.floor(Math.random() * PALETTE.length)])
      )
    }
  }, [])

  const burstRandom = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * canvas.width  * 0.8 + canvas.width  * 0.1
      const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.1
      burst(x, y)
    }
  }, [burst])

  return { canvasRef, burstRandom }
}
