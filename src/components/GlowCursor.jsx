import { useEffect, useRef, useState } from 'react'
import './GlowCursor.css'

/**
 * GlowCursor - High-performance mouse spotlight with emerald/mint aura
 * Tracks mouse position via requestAnimationFrame with smooth interpolation.
 */
export default function GlowCursor() {
  const spotlightRef = useRef(null)
  const auraRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const posRef = useRef({ targetX: -500, targetY: -500, currentX: -500, currentY: -500 })
  const rafId = useRef(null)

  useEffect(() => {
    // Check if device is touch-primary
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const handleMouseMove = (e) => {
      posRef.current.targetX = e.clientX
      posRef.current.targetY = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Smooth render loop using linear interpolation
    const render = () => {
      const p = posRef.current
      // Lerp smoothing factor
      p.currentX += (p.targetX - p.currentX) * 0.18
      p.currentY += (p.targetY - p.currentY) * 0.18

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${p.currentX}px, ${p.currentY}px, 0)`
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${p.currentX}px, ${p.currentY}px, 0)`
      }

      rafId.current = requestAnimationFrame(render)
    }

    rafId.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isVisible])

  return (
    <div className={`glow-cursor-overlay ${!isVisible ? 'glow-cursor-overlay--hidden' : ''}`} aria-hidden="true">
      <div ref={auraRef} className="glow-cursor-aura" />
      <div ref={spotlightRef} className="glow-cursor-spotlight" />
    </div>
  )
}
