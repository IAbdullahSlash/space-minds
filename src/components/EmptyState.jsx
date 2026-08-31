import {
  Sparkles,
  Code2,
  Image as ImageIcon,
  Compass,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react'
import './EmptyState.css'

const SUGGESTIONS = [
  {
    title: 'Multimodal Vision & Image Analysis',
    desc: 'Attach screenshots or diagrams to inspect architecture & bugs',
    prompt: 'Can you analyze the structure and visual hierarchy of an image if I attach it?',
    icon: ImageIcon,
  },
  {
    title: 'Modern React Architecture',
    desc: 'Design high-performance scalable frontends with custom hooks',
    prompt: 'How do I architect a high-performance React application with clean state separation?',
    icon: Code2,
  },
  {
    title: 'UI Design System & Tokens',
    desc: 'Craft dark emerald glassmorphism themes with smooth micro-interactions',
    prompt: 'Explain best practices for designing dark-mode design token systems with fluid typography.',
    icon: Lightbulb,
  },
  {
    title: 'Algorithmic Problem Solving',
    desc: 'Optimize complex data pipelines and asynchronous streams',
    prompt: 'Explain how to implement an efficient debounced requestAnimationFrame loop in JavaScript.',
    icon: Compass,
  },
]

/**
 * EmptyState - Landing view when chat has no messages.
 */
export default function EmptyState({ onSelectPrompt }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-badge">
        <Sparkles size={13} />
        <span>SpaceMinds 4.0 Emerald Edition</span>
      </div>

      <div className="empty-state-icon-wrap">
        <Sparkles size={32} strokeWidth={2.2} />
      </div>

      <h1 className="empty-state-title">
        Where will your curiosity <span>take you?</span>
      </h1>
      <p className="empty-state-subtitle">
        Ask complex engineering questions, brainstorm design systems, or attach images for deep visual analysis.
      </p>

      <div className="empty-suggestions-grid">
        {SUGGESTIONS.map((item, index) => {
          const IconComponent = item.icon
          return (
            <button
              key={index}
              className="suggestion-card"
              onClick={() => onSelectPrompt(item.prompt)}
              title={`Use prompt: ${item.prompt}`}
            >
              <div className="suggestion-card-header">
                <div className="suggestion-icon">
                  <IconComponent size={16} />
                </div>
                <ArrowUpRight size={15} color="var(--text-muted)" />
              </div>
              <div className="suggestion-card-title">{item.title}</div>
              <div className="suggestion-card-desc">{item.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
