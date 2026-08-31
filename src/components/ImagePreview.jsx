import { X } from 'lucide-react'
import './ImagePreview.css'

/**
 * ImagePreview - Staging strip of uploaded images before sending.
 */
export default function ImagePreview({ images, onRemove }) {
  if (!images || images.length === 0) return null

  return (
    <div className="image-preview-strip" role="region" aria-label="Attached images preview">
      {images.map((img, index) => (
        <div key={index} className="thumb-card" title={img.name}>
          <img src={img.dataUrl} alt={img.name || `Staged image ${index + 1}`} />
          <span className="thumb-name-tooltip">{img.name}</span>
          <button
            type="button"
            className="thumb-remove-badge"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${img.name || `image ${index + 1}`}`}
            title="Remove image"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </div>
      ))}
      <span className="thumb-count-pill">{images.length} attached</span>
    </div>
  )
}
