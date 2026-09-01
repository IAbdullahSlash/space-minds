import { useState } from 'react'
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Sparkles,
  Settings,
  Flame,
} from 'lucide-react'
import './Sidebar.css'

/**
 * Sidebar - Claude & ChatGPT inspired conversation navigation panel.
 */
export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggleSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group sessions by period
  const todaySessions = filteredSessions.filter(s => s.group === 'today')
  const previousSessions = filteredSessions.filter(s => s.group !== 'today')

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onToggleSidebar}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`sidebar ${!isOpen ? 'sidebar--collapsed' : 'sidebar--open'}`}>
        {/* Top brand header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
            <span>SatQuery</span>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleSidebar}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="sidebar-action-wrap">
          <button className="new-chat-btn" onClick={onNewChat} title="Start a new conversation">
            <div className="new-chat-btn-left">
              <Plus size={16} strokeWidth={2.5} color="var(--accent-mint)" />
              <span>New Chat</span>
            </div>
            <span className="new-chat-shortcut">⌘N</span>
          </button>
        </div>

        {/* Search Chat Input */}
        <div className="sidebar-search-box">
          <Search size={14} className="sidebar-search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversation history"
          />
        </div>

        {/* Scrollable history list */}
        <div className="sidebar-scroll">
          {/* Today Group */}
          {todaySessions.length > 0 && (
            <div>
              <div className="sidebar-group-title">Today</div>
              <ul className="sidebar-session-list">
                {todaySessions.map(session => (
                  <li
                    key={session.id}
                    className={`sidebar-session-item ${session.id === activeSessionId ? 'sidebar-session-item--active' : ''}`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="sidebar-session-title-wrap">
                      <MessageSquare size={14} />
                      <span className="sidebar-session-title">{session.title}</span>
                    </div>
                    <button
                      className="sidebar-session-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous Chats Group */}
          {previousSessions.length > 0 && (
            <div>
              <div className="sidebar-group-title">Previous Chats</div>
              <ul className="sidebar-session-list">
                {previousSessions.map(session => (
                  <li
                    key={session.id}
                    className={`sidebar-session-item ${session.id === activeSessionId ? 'sidebar-session-item--active' : ''}`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="sidebar-session-title-wrap">
                      <MessageSquare size={14} />
                      <span className="sidebar-session-title">{session.title}</span>
                    </div>
                    <button
                      className="sidebar-session-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="sidebar-empty-state">
              {searchQuery ? 'No matching chats found' : 'No previous conversations'}
            </div>
          )}
        </div>

        {/* User Account / Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card" title="Account settings">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">SM</div>
              <div className="sidebar-user-text">
                <span className="sidebar-user-name">SpaceMinds</span>
                <span className="sidebar-user-tier">
                  <Flame size={11} fill="currentColor" /> Emerald Pro
                </span>
              </div>
            </div>
            <Settings size={15} color="var(--text-muted)" />
          </div>
        </div>
      </aside>
    </>
  )
}
