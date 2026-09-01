import { useState, useCallback, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import './App.css'
import BackgroundBlobs from './components/BackgroundBlobs'
import GlowCursor from './components/GlowCursor'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import { askQuestion, analyzeImage } from './api'

// Fresh, empty initial session — no hardcoded demo history
const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    title: 'New Conversation',
    group: 'today',
    messages: [],
  },
]

// Standard fallback response until backend API is connected
const FALLBACK_NO_BACKEND_RESPONSE =
  'No backend connected yet. Connect your backend API to receive live responses.'

let idCounter = 100
const uid = (prefix = 'msg') => `${prefix}-${Date.now()}-${idCounter++}`

export default function App() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState('session-1')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isGlobalDragging, setIsGlobalDragging] = useState(false)

  // Current active conversation
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0]
  const currentMessages = activeSession ? activeSession.messages : []

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Create a new empty chat session
  const handleNewChat = useCallback(() => {
    const newSession = {
      id: uid('session'),
      title: 'New Conversation',
      group: 'today',
      messages: [],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // Select existing session
  const handleSelectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // Delete a session
  const handleDeleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId)
        if (next.length === 0) {
          const fresh = {
            id: uid('session'),
            title: 'New Conversation',
            group: 'today',
            messages: [],
          }
          return [fresh]
        }
        return next
      })
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id)
        }
      }
    },
    [activeSessionId, sessions]
  )

  // Clear current active conversation
  const handleClearChat = useCallback(() => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [] } : s
      )
    )
  }, [activeSessionId])

  // Export current chat transcript as markdown file
  const handleExportChat = useCallback(() => {
    const activeSession =
      sessions.find((s) => s.id === activeSessionId) || sessions[0]
    const messagesToExport = activeSession ? activeSession.messages : []
    
    if (messagesToExport.length === 0) return
    const transcript = messagesToExport
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'SpaceMinds AI'} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.text}\n${m.images?.length ? `\n*[Attached ${m.images.length} image(s)]*\n` : ''}`
      )
      .join('\n\n---\n\n')

    const blob = new Blob([transcript], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SatQuery-Transcript-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeSessionId, sessions])

  // Send a message
  const handleSend = useCallback(
    ({ text, images }) => {
      if (!text.trim() && images.length === 0) return

      const userMsg = {
        id: uid(),
        role: 'user',
        text: text.trim(),
        images,
        timestamp: new Date(),
      }

      // Update current session title if it was "New Conversation"
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            const isFirst = s.messages.length === 0
            const updatedTitle =
              isFirst && text.trim()
                ? text.trim().slice(0, 30) + (text.trim().length > 30 ? '...' : '')
                : isFirst && images.length > 0
                ? `Image Analysis (${images.length} files)`
                : s.title

            return {
              ...s,
              title: updatedTitle,
              messages: [...s.messages, userMsg],
            }
          }
          return s
        })
      )

      // Fetch response from backend
      setIsTyping(true)
      
      const fetchResponse = async () => {
        try {
          let apiResponse
          
          // Route to appropriate endpoint
          if (images.length > 0) {
            // Image analysis: use /analyze endpoint with first image
            apiResponse = await analyzeImage(images[0], text.trim())
          } else {
            // Text-only: use /ask endpoint
            apiResponse = await askQuestion(text.trim())
          }

          // Create assistant message with response data
          const botMsg = {
            id: uid(),
            role: 'assistant',
            text: apiResponse.answer || 'No response received',
            visualDescription: apiResponse.visual_description || null,
            similarScenes: apiResponse.similar_scenes || [],
            images: [],
            timestamp: new Date(),
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, botMsg] }
                : s
            )
          )
        } catch (error) {
          console.error('Backend error:', error)
          const errorMsg = {
            id: uid(),
            role: 'assistant',
            text: `Error: ${error.message}`,
            images: [],
            timestamp: new Date(),
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, errorMsg] }
                : s
            )
          )
        } finally {
          setIsTyping(false)
        }
      }

      fetchResponse()
    },
    [activeSessionId]
  )

  // Regenerate last assistant response
  const handleRegenerate = useCallback(() => {
    // Find the last user message to regenerate response from
    const lastUserMsg = [...currentMessages]
      .reverse()
      .find((m) => m.role === 'user')
    
    if (!lastUserMsg) return

    setIsTyping(true)

    const fetchResponse = async () => {
      try {
        let apiResponse

        // Route to appropriate endpoint based on whether user message had images
        if (lastUserMsg.images && lastUserMsg.images.length > 0) {
          apiResponse = await analyzeImage(lastUserMsg.images[0], lastUserMsg.text)
        } else {
          apiResponse = await askQuestion(lastUserMsg.text)
        }

        const refreshedMsg = {
          id: uid(),
          role: 'assistant',
          text: apiResponse.answer || 'No response received',
          visualDescription: apiResponse.visual_description || null,
          similarScenes: apiResponse.similar_scenes || [],
          images: [],
          timestamp: new Date(),
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages.slice(0, -1), refreshedMsg] }
              : s
          )
        )
      } catch (error) {
        console.error('Regenerate error:', error)
        const errorMsg = {
          id: uid(),
          role: 'assistant',
          text: `Error: ${error.message}`,
          images: [],
          timestamp: new Date(),
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages.slice(0, -1), errorMsg] }
              : s
          )
        )
      } finally {
        setIsTyping(false)
      }
    }

    fetchResponse()
  }, [activeSessionId, currentMessages])

  // Drag overlay listeners
  const handleWindowDragEnter = (e) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      setIsGlobalDragging(true)
    }
  }

  const handleWindowDragLeave = (e) => {
    e.preventDefault()
    if (
      e.clientY <= 0 ||
      e.clientX <= 0 ||
      e.clientX >= window.innerWidth ||
      e.clientY >= window.innerHeight
    ) {
      setIsGlobalDragging(false)
    }
  }


  return (
    <div
      className="app-container"
      onDragEnter={handleWindowDragEnter}
      onDragLeave={handleWindowDragLeave}
    >
      {/* ── Ambient Animated Drifting Green Blobs ── */}
      <BackgroundBlobs />

      {/* ── Mouse-following Green Spotlight Glow Effect ── */}
      <GlowCursor />

      {/* ── Global File Drag Drop Overlay ── */}
      {isGlobalDragging && (
        <div className="global-drag-overlay">
          <div className="global-drag-icon">
            <ImageIcon size={42} />
          </div>
          <div className="global-drag-text">Drop images here to attach</div>
          <div className="global-drag-subtext">Supports PNG, JPG, WebP, GIF up to 6 images</div>
        </div>
      )}

      {/* ── Left Navigation Sidebar (Claude / ChatGPT Style) ── */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ── Main Chat Area ── */}
      <div className="main-chat-panel">
        {/* Header with Model Picker and Sidebar Trigger */}
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
          messageCount={currentMessages.length}
        />

        {/* Scrollable Conversation Canvas / Empty State */}
        <ChatWindow
          messages={currentMessages}
          isTyping={isTyping}
          onSelectPrompt={(prompt) => handleSend({ text: prompt, images: [] })}
          onRegenerate={handleRegenerate}
        />

        {/* Bottom Floating Glass Input Bar */}
        <InputBar onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
}
