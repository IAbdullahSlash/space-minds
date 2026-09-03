import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
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

  // Auto-scroll when new messages arrive or while typing
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (messages.length === 0) {
    return (
      <main className="chat-window" ref={scrollRef}>
        <EmptyState onSelectPrompt={onSelectPrompt} />
      </main>
    )
  }

  return (
    <main className="chat-window" ref={scrollRef} role="log" aria-live="polite">
      <div className="chat-time-divider">Conversation</div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onRegenerate={onRegenerate} />
      ))}

      {isTyping && (
        <div className="typing-row" aria-label="SatQuery is thinking">
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

    </main>
  )
}
