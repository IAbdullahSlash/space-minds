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
    title: 'Remote Sensing & Satellite Analysis',
    desc: 'Analyze satellite imagery and geospatial data for Earth observation insights',
    prompt: 'Can you analyze satellite imagery and extract insights about geographical features and changes?',
    icon: ImageIcon,
  },
  {
    title: 'Land Cover & Vegetation Analysis',
    desc: 'Monitor forest coverage, crop health, and ecosystem changes with satellite data',
    prompt: 'How can I use satellite imagery to analyze vegetation patterns and land cover changes?',
    icon: Code2,
  },
  {
    title: 'Climate & Environmental Monitoring',
    desc: 'Track atmospheric changes, weather patterns, and environmental indicators from space',
    prompt: 'Explain how satellite data can be used to monitor climate change and environmental conditions.',
    icon: Lightbulb,
  },
  {
    title: 'Geographical Problem Solving',
    desc: 'Analyze complex geographical data and spatial analysis workflows',
    prompt: 'How do I analyze geographical data patterns and solve complex spatial problems?',
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
        <span>SatQuery 4.0 Emerald Edition</span>
      </div>

      <div className="empty-state-icon-wrap">
        <Sparkles size={32} strokeWidth={2.2} />
      </div>

      <h1 className="empty-state-title">
        TAKE A LOOK FROM THE <span>SPACE</span>
      </h1>
      <p className="empty-state-subtitle">
        Explore our planet earth with a closeup look.
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
