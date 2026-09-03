import { useState, useRef, useCallback } from 'react'
import {
  ArrowUp,
  Image as ImageIcon,
  Globe,
  Mic,
  MicOff,
  Sparkles,
  Clock,
} from 'lucide-react'
import './InputBar.css'
import ImagePreview from './ImagePreview'

const MAX_IMAGES = 6
const MAX_TEMPORAL_IMAGES = 2

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ dataUrl: reader.result, name: file.name })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * InputBar - Sleek chat input with image staging, drag-and-drop, and glowing send trigger.
 */
export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [images, setImages] = useState([])
  const [webSearchActive, setWebSearchActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisMode, setAnalysisMode] = useState('single') // 'single' | 'temporal'

  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const autoGrow = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    autoGrow(e.target)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFilePick = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      const maxAllowed = analysisMode === 'temporal' ? MAX_TEMPORAL_IMAGES : MAX_IMAGES
      const remaining = maxAllowed - images.length
      const toProcess = files.slice(0, remaining)

      const loaded = await Promise.all(
        toProcess.filter((f) => f.type.startsWith('image/')).map(readAsDataUrl)
      )
      setImages((prev) => [...prev, ...loaded])
      e.target.value = ''
    },
    [images.length, analysisMode]
  )

  const handleRemoveImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Drag and Drop Handling
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (!files.length) return

    const maxAllowed = analysisMode === 'temporal' ? MAX_TEMPORAL_IMAGES : MAX_IMAGES
    const remaining = maxAllowed - images.length
    const toProcess = files.slice(0, remaining)

    const loaded = await Promise.all(
      toProcess.filter((f) => f.type.startsWith('image/')).map(readAsDataUrl)
    )
    setImages((prev) => [...prev, ...loaded])
  }

  const handleSend = useCallback(() => {
    if (disabled) return
    if (!text.trim() && images.length === 0) return

    onSend({
      text: text.trim(),
      images,
      webSearch: webSearchActive,
      analysisMode,
    })

    setText('')
    setImages([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    textareaRef.current?.focus()
  }, [disabled, text, images, webSearchActive, analysisMode, onSend])

  // Validation: temporal mode requires exactly 2 images
  const canSend =
    !disabled &&
    (text.trim().length > 0 || images.length > 0) &&
    (analysisMode === 'single' || images.length === MAX_TEMPORAL_IMAGES)

  return (
    <div className="input-bar-container">
      <div
        className={`input-glass-frame ${isDragging ? 'input-glass-frame--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Thumbnail Preview Strip */}
        <ImagePreview
          images={images}
          onRemove={handleRemoveImage}
          analysisMode={analysisMode}
        />

        <div className="input-main-row">
          {/* Hidden File Picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden-file-input"
            onChange={handleFilePick}
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* Attach Images Button */}
          <button
            type="button"
            className="input-action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || (analysisMode === 'temporal' ? images.length >= MAX_TEMPORAL_IMAGES : images.length >= MAX_IMAGES)}
            title={
              analysisMode === 'temporal'
                ? `Attach images (${images.length}/${MAX_TEMPORAL_IMAGES})`
                : `Attach images (${images.length}/${MAX_IMAGES})`
            }
            aria-label="Attach images"
          >
            <ImageIcon size={18} />
          </button>

          {/* Temporal Analysis Mode Toggle */}
          <button
            type="button"
            className={`input-action-btn ${analysisMode === 'temporal' ? 'input-action-btn--active' : ''}`}
            onClick={() => {
              setAnalysisMode(analysisMode === 'temporal' ? 'single' : 'temporal')
              // Clear images when switching modes
              setImages([])
            }}
            title={analysisMode === 'temporal' ? 'Temporal comparison enabled (2 images)' : 'Enable temporal comparison'}
            aria-label="Toggle temporal comparison mode"
          >
            <Clock size={18} />
          </button>

          {/* Web Search Mode Toggle */}
          <button
            type="button"
            className={`input-action-btn ${webSearchActive ? 'input-action-btn--active' : ''}`}
            onClick={() => setWebSearchActive(!webSearchActive)}
            title={webSearchActive ? 'Web search enabled' : 'Enable web search'}
            aria-label="Toggle web search"
          >
            <Globe size={18} />
          </button>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            className="input-textarea"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              analysisMode === 'temporal'
                ? 'Ask about the changes between the two images... (Shift+Enter for newline)'
                : images.length > 0
                ? 'Add context or instructions for attached image(s)...'
                : 'Ask SatQuery anything... (Shift+Enter for newline)'
            }
            rows={1}
            disabled={disabled}
            aria-label="Message prompt"
          />

          {/* Voice Input Simulation Toggle */}
          <button
            type="button"
            className={`input-action-btn ${isRecording ? 'input-action-btn--active' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
            title={isRecording ? 'Stop voice input' : 'Dictate message'}
            aria-label="Voice input"
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            type="button"
            className="input-send-btn"
            onClick={handleSend}
            disabled={!canSend}
            title="Send message"
            aria-label="Send message"
          >
            <ArrowUp size={17} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="input-footer-bar">
        <div className="input-footer-hint">
          <Sparkles size={11} color="var(--accent-mint)" />
          <span>
            {analysisMode === 'temporal'
              ? 'Temporal comparison: Upload before & after images for change analysis.'
              : 'SatQuery can analyze code, text & images.'}
          </span>
          <span className="desktop-only">• Drag & drop images directly.</span>
        </div>
        {text.length > 0 && <span className="input-char-count">{text.length} chars</span>}
      </div>
    </div>
  )
}
