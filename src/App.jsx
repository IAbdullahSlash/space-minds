import { useState, useCallback, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import './App.css'
import BackgroundBlobs from './components/BackgroundBlobs'
import GlowCursor from './components/GlowCursor'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'

// Seed conversation history for multi-chat experience
const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    title: 'SpaceMinds UI & Vision Architecture',
    group: 'today',
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        text: 'Greetings! I am **SpaceMinds**, your multimodal AI assistant powered by the Emerald 4.0 reasoning engine.\n\nYou can ask complex questions, request code refactors, or attach one or more images for in-depth visual analysis.',
        images: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
    ],
  },
  {
    id: 'session-2',
    title: 'Dark Forest Theme Design Tokens',
    group: 'today',
    messages: [
      {
        id: 'msg-s2-1',
        role: 'user',
        text: 'How should I structure dark emerald theme variables for glassmorphism?',
        images: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: 'msg-s2-2',
        role: 'assistant',
        text: 'Here is a clean approach using CSS custom properties with layered opacity:\n\n```css\n:root {\n  --bg-deep: #06110c;\n  --bg-surface: rgba(16, 41, 31, 0.75);\n  --accent-mint: #34d399;\n  --border-glass: rgba(52, 211, 153, 0.15);\n  --glow-mint: 0 0 24px rgba(52, 211, 153, 0.25);\n}\n```\n\nThis ensures high contrast, silky smooth ambient backdrops, and seamless accessibility.',
        images: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 15000),
      },
    ],
  },
  {
    id: 'session-3',
    title: 'High-Performance React Hooks',
    group: 'previous',
    messages: [],
  },
]

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
    if (currentMessages.length === 0) return
    const transcript = currentMessages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'SpaceMinds AI'} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.text}\n${m.images?.length ? `\n*[Attached ${m.images.length} image(s)]*\n` : ''}`)
      .join('\n\n---\n\n')

    const blob = new Blob([transcript], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SpaceMinds-Transcript-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [currentMessages])

  // Send a message
  const handleSend = useCallback(
    ({ text, images, webSearch }) => {
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

      // Simulate Assistant Response
      setIsTyping(true)
      setTimeout(() => {
        let responseText = ''

        if (images.length > 0 && text.trim()) {
          responseText = `### Visual & Multimodal Analysis\n\nI have received and processed **${images.length} attached image${images.length > 1 ? 's' : ''}** alongside your query: \n\n> *"${text.trim()}"*\n\n**Observations:**\n- **Asset Inspection:** Analyzed pixel fidelity and structural layout.\n- **Context Alignment:** Synthesized visual cues with prompt constraints.\n\n\`\`\`javascript\n// Verification summary\nconst analysis = {\n  status: "verified",\n  attachments: ${images.length},\n  mode: "${webSearch ? 'vision + live search' : 'vision standard'}"\n};\n\`\`\`\n\nFeel free to ask specific questions about any region or detail in your uploaded image(s)!`
        } else if (images.length > 0) {
          responseText = `### Image Received\n\nI have inspected the **${images.length} image attachment${images.length > 1 ? 's' : ''}**.\n\nPlease let me know what specific insights or analysis you would like me to extract!`
        } else if (webSearch) {
          responseText = `### Live Web Search Insights\n\nQuerying real-time sources for **"${text.trim()}"**:\n\n1. Found relevant documentation and latest community standards.\n2. Summarized optimal implementation patterns for maximum reliability.\n\nLet me know if you would like me to dive deeper into any aspect!`
        } else {
          responseText = `I have received your request regarding **"${text.trim()}"**.\n\nHere is a structured breakdown:\n\n- **Key Concept:** Modern responsive design with deep emerald and mint accents.\n- **Performance:** Hardware-accelerated CSS keyframe animations and low CPU overhead.\n- **Interactivity:** Glowing cursor spotlight aura and drag-and-drop file upload.\n\n\`\`\`bash\n# SpaceMinds Ready\necho "AI system initialized with Emerald 4.0 engine"\n\`\`\``
        }

        const botMsg = {
          id: uid(),
          role: 'assistant',
          text: responseText,
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
        setIsTyping(false)
      }, 1100)
    },
    [activeSessionId]
  )

  // Regenerate last assistant response
  const handleRegenerate = useCallback(() => {
    setIsTyping(true)
    setTimeout(() => {
      const refreshedMsg = {
        id: uid(),
        role: 'assistant',
        text: `### Refreshed Response (Alternative Formulation)\n\nHere is an alternative perspective with enhanced architectural insights.\n\n\`\`\`javascript\nexport const config = {\n  theme: "dark-emerald",\n  accent: "mint-34d399",\n  glowSpotlight: true,\n  ambientBlobs: "smooth-css"\n};\n\`\`\`\n\nAll components are verified and responsive across all viewports!`,
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
      setIsTyping(false)
    }, 900)
  }, [activeSessionId])

  // Drag overlay listeners
  const handleWindowDragEnter = (e) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      setIsGlobalDragging(true)
    }
  }

  const handleWindowDragLeave = (e) => {
    e.preventDefault()
    if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
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
