import { useState, useRef, useCallback } from 'react'
import './InputBar.css'
import ImagePreview from './ImagePreview'

const MAX_IMAGES = 5   /* cap to avoid accidental overload */

/* Read a File as a data URL, returning { dataUrl, name } */
const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve({ dataUrl: reader.result, name: file.name })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * InputBar — text + image compose area.
 * @param {{ onSend: (payload: {text: string, images: Array}) => void, disabled: boolean }} props
 */
export default function InputBar({ onSend, disabled }) {
  const [text, setText]     = useState('')
  const [images, setImages] = useState([])
  const fileInputRef = useRef(null)
  const textareaRef  = useRef(null)

  /* Auto-grow textarea height */
  const autoGrow = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    autoGrow(e.target)
  }

  /* Handle keyboard shortcut: Enter sends, Shift+Enter = newline */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* File picker callback */
  const handleFilePick = useCallback(async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    const toProcess = files.slice(0, remaining)

    const loaded = await Promise.all(
      toProcess
        .filter(f => f.type.startsWith('image/'))
        .map(readAsDataUrl)
    )
    setImages(prev => [...prev, ...loaded])

    /* Reset the input so re-picking the same file triggers onChange */
    e.target.value = ''
  }, [images.length])

  /* Remove a staged image by index */
  const handleRemoveImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  /* Submit */
  const handleSend = useCallback(() => {
    if (disabled) return
    if (!text.trim() && images.length === 0) return

    onSend({ text, images })
    setText('')
    setImages([])
    /* Reset textarea height */
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    textareaRef.current?.focus()
  }, [disabled, text, images, onSend])

  const canSend = !disabled && (text.trim().length > 0 || images.length > 0)

  return (
    <div className="input-bar">
      {/* Thumbnail preview strip */}
      <ImagePreview images={images} onRemove={handleRemoveImage} />

      <div className="input-row">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="file-input-hidden"
          onChange={handleFilePick}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Image attach button */}
        <button
          type="button"
          className="input-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || images.length >= MAX_IMAGES}
          aria-label={`Attach images (${images.length}/${MAX_IMAGES} attached)`}
          title="Attach images"
        >
          {/* Inline SVG — paperclip / image icon */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message SpaceMinds… (Enter to send)"
          rows={1}
          disabled={disabled}
          aria-label="Message input"
          aria-multiline="true"
        />

        {/* Send button */}
        <button
          type="button"
          className="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send"
        >
          {/* Arrow-up icon */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>

      <p className="input-hint">
        Shift + Enter for a new line · max {MAX_IMAGES} images
      </p>
    </div>
  )
}
