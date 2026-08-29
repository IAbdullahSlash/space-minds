import { useState, useCallback } from 'react'
import './App.css'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'

/* Seed conversation so the UI looks lively on first load */
const SEED_MESSAGES = [
  {
    id: 'seed-1',
    role: 'assistant',
    text: 'Hello! I\'m your AI assistant. Ask me anything or attach images to your query.',
    images: [],
    timestamp: new Date(Date.now() - 60_000),
  },
]

let idCounter = 1
const uid = () => `msg-${Date.now()}-${idCounter++}`

export default function App() {
  const [messages, setMessages] = useState(SEED_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = useCallback(({ text, images }) => {
    if (!text.trim() && images.length === 0) return

    /* User message */
    const userMsg = {
      id: uid(),
      role: 'user',
      text: text.trim(),
      images,            /* array of { dataUrl, name } */
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    /* Simulate assistant "typing" then responding */
    setIsTyping(true)
    setTimeout(() => {
      const botMsg = {
        id: uid(),
        role: 'assistant',
        text: images.length > 0
          ? `Got it — I can see ${images.length} image${images.length > 1 ? 's' : ''} you attached${text.trim() ? ` along with your message: "${text.trim()}"` : ''}. (Backend not connected yet — this is a UI demo.)`
          : `You said: "${text.trim()}". (Backend not connected yet — this is a UI demo.)`,
        images: [],
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1200)
  }, [])

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__icon" aria-hidden="true">✦</div>
        <div>
          <div className="app-header__title">SpaceMinds</div>
          <div className="app-header__subtitle">AI Assistant</div>
        </div>
        <div className="app-header__status">
          <span className="status-dot" aria-hidden="true" />
          Online
        </div>
      </header>

      {/* ── Chat history ── */}
      <ChatWindow messages={messages} isTyping={isTyping} />

      {/* ── Input bar ── */}
      <InputBar onSend={handleSend} disabled={isTyping} />
    </div>
  )
}
