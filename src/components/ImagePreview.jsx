import { X } from 'lucide-react'
import './ImagePreview.css'

/**
 * ImagePreview - Staging strip of uploaded images before sending.
 * In temporal mode, shows role labels (Before/After).
 */
export default function ImagePreview({ images, onRemove, analysisMode }) {
  if (!images || images.length === 0) return null

  // Determine image roles for temporal mode
  const getRoleLabel = (index) => {
    if (analysisMode === 'temporal') {
      return index === 0 ? 'Before' : index === 1 ? 'After' : null
    }
    return null
  }

  return (
    <div className="image-preview-strip" role="region" aria-label="Attached images preview">
      {images.map((img, index) => {
        const roleLabel = getRoleLabel(index)
        return (
          <div key={index} className="thumb-card" title={img.name}>
            <img src={img.dataUrl} alt={img.name || `Staged image ${index + 1}`} />
            {roleLabel && <span className="thumb-role-badge">{roleLabel}</span>}
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
        )
      })}
      <span className="thumb-count-pill">
        {analysisMode === 'temporal' ? `${images.length}/2 images` : `${images.length} attached`}
      </span>
    </div>
  )
}
