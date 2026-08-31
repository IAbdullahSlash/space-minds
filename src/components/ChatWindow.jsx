import { useEffect, useRef, useState } from 'react'
import { Sparkles, ArrowDown } from 'lucide-react'
import './ChatWindow.css'
import MessageBubble from './MessageBubble'
import EmptyState from './EmptyState'

/**
 * ChatWindow - Renders empty state or message history with auto-scroll logic.
 */
export default function ChatWindow({
  messages,
  isTyping,
  onSelectPrompt,
  onRegenerate,
}) {
  const scrollRef = useRef(null)
  const bottomAnchorRef = useRef(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  // Auto-scroll when new messages arrive or while typing
  useEffect(() => {
    if (!showScrollBottom) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, showScrollBottom])

  // Track scroll position to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180
    setShowScrollBottom(isScrolledUp)
  }

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBottom(false)
  }

  if (messages.length === 0) {
    return (
      <main className="chat-window" ref={scrollRef}>
        <EmptyState onSelectPrompt={onSelectPrompt} />
      </main>
    )
  }

  return (
    <main className="chat-window" ref={scrollRef} onScroll={handleScroll} role="log" aria-live="polite">
      <div className="chat-time-divider">Conversation</div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onRegenerate={onRegenerate} />
      ))}

      {isTyping && (
        <div className="typing-row" aria-label="SpaceMinds is thinking">
          <div className="typing-avatar">
            <Sparkles size={15} />
          </div>
          <div className="typing-bubble">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <div ref={bottomAnchorRef} style={{ height: '1px' }} />

      {showScrollBottom && (
        <button className="scroll-bottom-pill" onClick={scrollToBottom} title="Scroll to bottom">
          <ArrowDown size={14} />
          <span>Latest message</span>
        </button>
      )}
    </main>
  )
}
