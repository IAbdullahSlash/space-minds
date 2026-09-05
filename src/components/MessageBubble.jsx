import { useState, useCallback } from 'react'
import {
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  X,
} from 'lucide-react'
import './MessageBubble.css'
import ReferenceScenesSection from './ReferenceScenesSection'

/**
 * Format timestamp nicely
 */
const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Parses the small Markdown subset used by model responses.
 */
function FormattedMessageText({ text }) {
  if (!text) return null

  return (
    <div className="message-text">
      {renderBlocks(text)}
    </div>
  )
}

function renderBlocks(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = []
  let codeLines = null
  let codeLanguage = ''

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={`paragraph-${blocks.length}`}>{renderInlineFormatting(paragraph.join('\n'))}</p>)
      paragraph = []
    }
  }

  const flushList = () => {
    if (list.length) {
      const ordered = list[0].ordered
      const ListTag = ordered ? 'ol' : 'ul'
      blocks.push(
        <ListTag key={`list-${blocks.length}`}>
          {list.map((item, index) => <li key={index}>{renderInlineFormatting(item.text)}</li>)}
        </ListTag>
      )
      list = []
    }
  }

  lines.forEach((line) => {
    const codeFence = line.match(/^```(.*)$/)
    if (codeFence) {
      if (codeLines) {
        blocks.push(<CodeBlock key={`code-${blocks.length}`} language={codeLanguage || 'code'} code={codeLines.join('\n')} />)
        codeLines = null
        codeLanguage = ''
      } else {
        flushParagraph()
        flushList()
        codeLines = []
        codeLanguage = codeFence[1].trim()
      }
      return
    }

    if (codeLines) {
      codeLines.push(line)
      return
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/)
    const listItem = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      const HeadingTag = `h${heading[1].length}`
      blocks.push(<HeadingTag key={`heading-${blocks.length}`}>{renderInlineFormatting(heading[2])}</HeadingTag>)
    } else if (listItem) {
      flushParagraph()
      const ordered = /^\d/.test(listItem[1])
      if (list.length && list[0].ordered !== ordered) flushList()
      list.push({ ordered, text: listItem[2] })
    } else if (!line.trim()) {
      flushParagraph()
      flushList()
    } else {
      paragraph.push(line)
    }
  })

  if (codeLines) {
    blocks.push(<CodeBlock key={`code-${blocks.length}`} language={codeLanguage || 'code'} code={codeLines.join('\n')} />)
  } else {
    flushParagraph()
    flushList()
  }

  return blocks
}

function renderInlineFormatting(str) {
  const tokens = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g)
  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="inline-code">
          {token.slice(1, -1)}
        </code>
      )
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i}>{token.slice(2, -2)}</strong>
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={i}>{token.slice(1, -1)}</em>
    }
    if (token.includes('\n')) {
      return token.split('\n').map((line, lineIndex) => (
        <span key={`${i}-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {line}
        </span>
      ))
    }
    return token
  })
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span>{language}</span>
        <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Lightbox({ src, alt, onClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      onKeyDown={handleKey}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
      tabIndex={-1}
    >
      <div className="lightbox-content-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close-btn" onClick={onClose} aria-label="Close image">
          <X size={18} />
        </button>
        <img src={src} alt={alt} className="lightbox-image" />
      </div>
    </div>
  )
}

/**
 * MessageBubble - High-polish chat message item with action toolbar and avatar.
 */
export default function MessageBubble({ message, onRegenerate }) {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const [reaction, setReaction] = useState(null) // 'like' | 'dislike' | null
  const [isSpeaking, setIsSpeaking] = useState(false)

  const { 
    role, 
    text, 
    images, 
    timestamp, 
    visualDescription, 
    beforeDescription, 
    afterDescription, 
    changeDetected, 
    changes, 
    environmentalConsiderations,
    similarScenes, 
    analysisMode 
  } = message
  const isUser = role === 'user'
  const isTemporalAnalysis = analysisMode === 'temporal' && (beforeDescription || afterDescription)
  const hasStructuredChanges = analysisMode === 'temporal' && (changes || []).length > 0

  const handleCopyMessage = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      <div className={`message-row message-row--${role}`}>
        {/* Avatar */}
        <div className={`message-avatar message-avatar--${role}`} aria-hidden="true">
          {isUser ? <User size={15} /> : <Sparkles size={15} />}
        </div>

        {/* Content Body */}
        <div className="message-content-wrap">
          <div className="message-header-info">
            <span className="message-sender-name">{isUser ? 'You' : 'SatQuery AI'}</span>
            <span>•</span>
            <span>{formatTime(timestamp)}</span>
          </div>

          <div className={`message-bubble message-bubble--${role}`}>
            {/* Main Answer Text */}
            <FormattedMessageText text={text} />

            {/* Temporal Analysis Section (Before/After) */}
            {!isUser && isTemporalAnalysis && (
              <div className="temporal-analysis-section">
                <h4 className="temporal-analysis-title">Temporal Analysis</h4>
                <div className="temporal-analysis-grid">
                  {beforeDescription && (
                    <div className="temporal-analysis-card">
                      <h5 className="temporal-stage-label">Before</h5>
                      <div className="temporal-stage-content">
                        <FormattedMessageText text={beforeDescription} />
                      </div>
                    </div>
                  )}
                  {afterDescription && (
                    <div className="temporal-analysis-card">
                      <h5 className="temporal-stage-label">After</h5>
                      <div className="temporal-stage-content">
                        <FormattedMessageText text={afterDescription} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual Analysis Section (Single Image Mode) */}
            {!isUser && visualDescription && !isTemporalAnalysis && (
              <div className="visual-analysis-section">
                <h4 className="visual-analysis-title">Visual Analysis</h4>
                <div className="visual-analysis-content">
                  <FormattedMessageText text={visualDescription} />
                </div>
              </div>
            )}

            {/* Similar Reference Scenes Section */}
            {!isUser && similarScenes && similarScenes.length > 0 && (
              <ReferenceScenesSection scenes={similarScenes} />
            )}

            {/* Uploaded Images */}
            {images && images.length > 0 && (
              <div className="message-images-grid">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="message-image-card"
                    onClick={() => setLightboxSrc(img.dataUrl)}
                    title="Click to zoom image"
                  >
                    <img src={img.dataUrl} alt={img.name || `Attachment ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Toolbar for Assistant */}
          {!isUser && (
            <div className="message-actions-toolbar">
              <button
                className="action-tool-btn"
                onClick={handleCopyMessage}
                title="Copy entire response"
              >
                {isCopied ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  className="action-tool-btn"
                  onClick={() => onRegenerate(message.id)}
                  title="Regenerate this response"
                >
                  <RotateCcw size={13} />
                  <span>Retry</span>
                </button>
              )}

              <button
                className={`action-tool-btn ${reaction === 'like' ? 'action-tool-btn--active' : ''}`}
                onClick={() => setReaction(reaction === 'like' ? null : 'like')}
                title="Helpful response"
              >
                <ThumbsUp size={13} />
              </button>

              <button
                className={`action-tool-btn ${reaction === 'dislike' ? 'action-tool-btn--active' : ''}`}
                onClick={() => setReaction(reaction === 'dislike' ? null : 'dislike')}
                title="Not helpful"
              >
                <ThumbsDown size={13} />
              </button>

              <button
                className={`action-tool-btn ${isSpeaking ? 'action-tool-btn--active' : ''}`}
                onClick={handleSpeech}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                <Volume2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt="Full resolution attachment" onClose={() => setLightboxSrc(null)} />
      )}
    </>
  )
}
