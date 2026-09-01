import { useState, useRef, useEffect } from 'react'
import {
  PanelLeft,
  ChevronDown,
  Check,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  Zap,
  Cpu,
} from 'lucide-react'
import './ChatHeader.css'

const AVAILABLE_MODELS = [
  {
    id: 'emerald-4',
    name: 'SatQuery 4.0 Emerald',
    desc: 'Most capable model for multimodal reasoning & vision',
    icon: Sparkles,
  },
  {
    id: 'flash-2',
    name: 'SatQuery Flash 2.5',
    desc: 'Lightweight & ultra-fast for quick queries',
    icon: Zap,
  },
  {
    id: 'deep-reason',
    name: 'DeepReason 1.0',
    desc: 'Extended chain-of-thought for complex code & math',
    icon: Cpu,
  },
]

/**
 * ChatHeader - Claude / ChatGPT style header with model picker and quick action controls.
 */
export default function ChatHeader({
  onToggleSidebar,
  sidebarOpen,
  onClearChat,
  onExportChat,
  messageCount,
}) {
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>

        {/* Model Selector Dropdown */}
        <div className="model-badge-wrap" ref={dropdownRef}>
          <button
            className="model-badge-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            title="Switch AI model"
          >
            <span className="model-badge-dot" />
            <span>{selectedModel.name}</span>
            <ChevronDown
              size={14}
              className={`model-badge-chevron ${isDropdownOpen ? 'model-badge-chevron--open' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="model-dropdown-menu" role="menu">
              {AVAILABLE_MODELS.map((model) => {
                const IconComponent = model.icon
                const isSelected = model.id === selectedModel.id
                return (
                  <button
                    key={model.id}
                    className={`model-dropdown-item ${isSelected ? 'model-dropdown-item--active' : ''}`}
                    onClick={() => {
                      setSelectedModel(model)
                      setIsDropdownOpen(false)
                    }}
                    role="menuitem"
                  >
                    <div className="model-item-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconComponent size={14} color="var(--accent-mint)" />
                        <span className="model-item-title">{model.name}</span>
                      </div>
                      <span className="model-item-desc">{model.desc}</span>
                    </div>
                    {isSelected && <Check size={15} color="var(--accent-mint)" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="chat-header-right">
        <div className="status-latency-pill" title="Network status">
          <span className="status-latency-dot" />
          <span>24ms</span>
        </div>

        {messageCount > 0 && (
          <>
            <button
              className="header-icon-btn"
              onClick={onClearChat}
              title="Reset current conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="header-icon-btn"
              onClick={onExportChat}
              title="Export chat transcript"
              aria-label="Export chat transcript"
            >
              <Download size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
