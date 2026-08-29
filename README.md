# SpaceMinds — AI Chat Assistant Frontend

A modern, responsive, and minimalist chat application frontend featuring text queries and multiple image uploads, built using React + Vite.

## Theme & Design Guidelines
- **Palette**: A premium charcoal and dark graphite background coupled with vibrant warm amber accents.
- **Typography**: Clean, professional `Inter` sans-serif typeface.
- **Layout**: Dynamic, mobile-first responsive layout that flows naturally on mobile devices, tablets, and desktop displays.
- **Custom Aesthetics**: Designed from scratch to avoid resembling generic chat platforms (like WhatsApp or iMessage).

---

## Core Features
1. **Rich Chat Log**: Displays history with user messages and simulated assistant responses.
2. **Dynamic Input Bar**: 
   - Auto-growing text input box.
   - Enter-to-submit with Shift+Enter multi-line support.
3. **Image Attachments**:
   - Supports selecting one or multiple images at once.
   - Real-time thumbnail preview strip with single-click remove badges before submitting.
4. **Lightbox Viewer**: Clicking on any sent image in the conversation opens a modal screen overlay for close-up viewing.
5. **No Backend Required**: Simulates conversational behavior locally out-of-the-box.

---

## Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Clone the repository
```bash
git clone https://github.com/IAbdullahSlash/space-minds.git
cd space-minds
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
This compiles assets to the `dist/` directory, ready to be deployed to any static host.
