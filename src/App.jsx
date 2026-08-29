import { useState, useCallback } from 'react'
import './App.css'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import { askQuestion } from './api'

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

    /* If there are images but no text, or if text-only query, call the backend */
    /* Note: For now, only text queries are supported by the backend */
    if (text.trim()) {
      setIsTyping(true)

      askQuestion(text.trim())
        .then(result => {
          const botMsg = {
            id: uid(),
            role: 'assistant',
            text: result.answer || 'No answer received',
            images: [],
            timestamp: new Date(),
            /* Store sources for potential future display */
            sources: result.sources || [],
          }
          setMessages(prev => [...prev, botMsg])
        })
        .catch(error => {
          const errorMsg = {
            id: uid(),
            role: 'assistant',
            text: error.message || 'Unable to connect to the RAG backend. Please make sure the FastAPI server is running.',
            images: [],
            timestamp: new Date(),
            isError: true,
          }
          setMessages(prev => [...prev, errorMsg])
        })
        .finally(() => {
          setIsTyping(false)
        })
    } else if (images.length > 0) {
      /* Images without text: show placeholder (backend will support this later) */
      const botMsg = {
        id: uid(),
        role: 'assistant',
        text: `I can see ${images.length} image${images.length > 1 ? 's' : ''} you attached. Text-based queries are currently supported. Please add a question about your image(s).`,
        images: [],
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    }
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
