import { useEffect, useRef } from 'react'
import './ChatWindow.css'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null)

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <main className="chat-window" role="log" aria-live="polite" aria-label="Conversation">
      <div className="chat-divider">Today</div>

      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && (
        <div className="typing-indicator" aria-label="Assistant is typing">
          <div className="typing-bubble" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </main>
  )
}
