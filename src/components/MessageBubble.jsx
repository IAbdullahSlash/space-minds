import { useState, useCallback } from 'react'
import './MessageBubble.css'

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function Lightbox({ src, alt, onClose }) {
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onKeyDown={handleKey}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      tabIndex={-1}
    >
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} />
      <button className="lightbox-close" onClick={onClose} aria-label="Close preview">✕</button>
    </div>
  )
}

export default function MessageBubble({ message }) {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const { role, text, images, timestamp } = message

  return (
    <>
      <div className={`message-row message-row--${role}`}>
        <span className="message-role">{role === 'user' ? 'You' : 'SpaceMinds'}</span>

        <div className={`message-bubble message-bubble--${role}`}>
          {text && <span>{text}</span>}

          {images && images.length > 0 && (
            <div className="message-images">
              {images.map((img, i) => (
                <button
                  key={i}
                  className="message-image-wrap"
                  onClick={() => setLightboxSrc(img.dataUrl)}
                  aria-label={`View image ${img.name || i + 1}`}
                  style={{ background: 'none', padding: 0, border: 'none', cursor: 'zoom-in' }}
                >
                  <img src={img.dataUrl} alt={img.name || `attachment ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="message-time">{formatTime(timestamp)}</span>
      </div>

      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt="Full-size preview"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  )
}
