import './ImagePreview.css'

/**
 * Horizontal strip of thumbnail previews.
 * @param {{ images: Array<{dataUrl, name}>, onRemove: (index: number) => void }} props
 */
export default function ImagePreview({ images, onRemove }) {
  if (!images || images.length === 0) return null

  return (
    <div className="image-preview-strip" role="list" aria-label="Images to send">
      {images.map((img, index) => (
        <div key={index} className="thumb-item" role="listitem">
          <img src={img.dataUrl} alt={img.name || `image ${index + 1}`} />
          <span className="thumb-name" title={img.name}>{img.name}</span>
          <button
            className="thumb-remove"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${img.name || `image ${index + 1}`}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
