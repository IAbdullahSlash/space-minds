import './BackgroundBlobs.css'

/**
 * BackgroundBlobs - Subtle animated ambient gradient orbs in dark emerald & forest tones.
 * Uses GPU-accelerated CSS transforms for smooth 60fps rendering without CPU overhead.
 */
export default function BackgroundBlobs() {
  return (
    <div className="ambient-bg-container" aria-hidden="true">
      <div className="ambient-bg-base" />
      <div className="ambient-blob ambient-blob--1" />
      <div className="ambient-blob ambient-blob--2" />
      <div className="ambient-blob ambient-blob--3" />
      <div className="ambient-blob ambient-blob--4" />
      <div className="ambient-grid-overlay" />
      <div className="ambient-noise" />
    </div>
  )
}
