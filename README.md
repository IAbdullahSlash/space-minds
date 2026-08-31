# SpaceMinds — Next-Gen AI Assistant Frontend

A visually striking, modern chat application frontend built with **React** and **Vite**, featuring an ambient dark green / emerald visual theme, drifting background animations, a glowing cursor spotlight, and a Claude / ChatGPT-inspired layout.

---

## Key Features & Visual Design

### 1. Dark Emerald & Mint Palette
- **Deep Forest Canvas**: Rich, near-black forest background (`#06110c`, `#091812`, `#0b1e16`) with layered gradients and glassmorphism (`backdrop-filter: blur(20px)`).
- **Mint & Sage Highlights**: Radiant mint green accents (`#34d399`, `#10b981`, `#6ee7b7`) for interactive triggers, glowing active states, tags, and send buttons.
- **Modern Typography**: Powered by `Plus Jakarta Sans` for clean body typography and `JetBrains Mono` for code blocks.

### 2. Ambient Background Animation
- **Slow Drifting Orbs**: Multiple GPU-accelerated gradient blobs float seamlessly in emerald, mint, and deep forest tones with organic 24s–36s animation cycles.
- **Mesh Grid & Subtle Texture**: Low-opacity ambient grid overlay giving depth without cluttering conversation content.

### 3. Glowing Cursor Spotlight Aura
- **Mouse Spotlight**: Smooth green-tinted radial gradient aura tracking the mouse cursor with `requestAnimationFrame` and linear interpolation (lerp).
- **Responsive & Gentle**: Blends cleanly into the dark background and gracefully disables on touch devices.

### 4. Claude & ChatGPT-Inspired Sidebar
- **Multi-Session History**: Grouped conversation threads ("Today", "Previous Chats") with active session highlights.
- **Search Filtering**: Real-time search bar to quickly filter conversation history.
- **Collapsible & Responsive**: Smooth collapse/expand toggle on desktop and animated slide-out drawer on mobile screens.
- **New Chat & Session Management**: Dedicated `+ New Chat` button and inline chat deletion.

### 5. Rich Chat Experience & Micro-Interactions
- **Multimodal Image Attachments**: Multi-file staging with thumbnail preview strip, single-click removal, and high-resolution lightbox zoom modal.
- **Drag-and-Drop Anywhere**: Drag and drop images directly onto the chat window to stage them automatically.
- **Smart Model Switcher**: Model selector badge dropdown (`SpaceMinds 4.0 Emerald`, `SpaceMinds Flash 2.5`, `DeepReason 1.0`).
- **Markdown & Code Syntax**: Code block cards with one-click **Copy Code** button, inline code highlighting, and bold emphasis.
- **Action Toolbar**: Copy full message, retry/regenerate response, thumbs up/down feedback reactions, and simulated speech synthesis.
- **Typing Indicator**: Glowing pulsing mint dots with translucent card animation.
- **Empty State Hero**: Elegant landing screen with interactive prompt suggestion cards for instant exploration.

---

## Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Clone the repository
```bash
git clone https://github.com/IAbdullahSlash/space-minds.git
cd space-minds
```

### 2. Switch to the `IqraKhan` branch
```bash
git checkout IqraKhan
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.
