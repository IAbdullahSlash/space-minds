# SpaceMinds Project - Complete Installation Guide for New Laptop

Complete step-by-step instructions to set up SpaceMinds (React Frontend + FastAPI RAG Backend) on a new laptop.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have these installed on your new laptop:

### Required Software:
- [ ] **Python 3.8+** (check: `python --version`)
- [ ] **Node.js 16.0+** (check: `node --version`)
- [ ] **npm 7.0+** (check: `npm --version`)
- [ ] **Git** (check: `git --version`) - optional but recommended
- [ ] **Text Editor/IDE** - VS Code recommended (https://code.visualstudio.com/)

### Installation Links:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/ (includes npm)
- Git: https://git-scm.com/downloads
- VS Code: https://code.visualstudio.com/

---

## 🚀 Step 1: Clone/Copy Project Files

### Option A: Using Git (Recommended)
```bash
git clone <repository-url>
cd space-minds
```

### Option B: Manual Copy
1. Copy the entire `space-minds` folder to your new laptop
2. Navigate to the folder in terminal/PowerShell

---

## 🔧 Step 2: Backend Setup

### 2.1: Navigate to Backend Directory
```bash
cd backend
```

### 2.2: Create Python Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

✅ You should see `(venv)` in your terminal prompt after activation.

### 2.3: Install Backend Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `chromadb` - Vector database (pre-loaded with data)
- `sentence-transformers` - Embedding model
- `google-genai` - Gemini API client
- `python-dotenv` - Environment configuration
- `pandas` - Data processing
- `pyarrow` - Parquet file support
- `python-multipart` - File upload support

### 2.4: Setup Backend Environment Variables

Create `.env` file in the `backend/` directory:

**Windows:**
```powershell
New-Item -ItemType File -Name ".env"
```

**macOS/Linux:**
```bash
touch .env
```

Add the following content to `backend/.env`:
```env
# Gemini API Key (required for RAG answer generation)
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Customize database paths
DB_PATH=./demo_data/chroma_db
DB_PATH_EXPANDED=./demo_data/chroma_db_expanded
```

**Get your Gemini API Key:**
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env`

### 2.5: Verify Backend Setup

```bash
# Test imports
python -c "import fastapi; import chromadb; import sentence_transformers; print('✓ All imports successful')"

# Check if data files exist
ls demo_data/chroma_db
ls demo_data/chroma_db_expanded
```

---

## 🎨 Step 3: Frontend Setup

### 3.1: Navigate Back to Project Root

```bash
cd ..
```

You should now be in the `space-minds/` directory (parent of `backend/`).

### 3.2: Install Node Dependencies

```bash
npm install
```

This installs:
- `react` - React library
- `react-dom` - DOM rendering
- `vite` - Build tool & dev server
- `lucide-react` - Icon library
- Dev tools (TypeScript, ESLint, etc.)

### 3.3: Setup Frontend Environment Variables

Create `.env` file in the project root:

**Windows:**
```powershell
New-Item -ItemType File -Name ".env"
```

**macOS/Linux:**
```bash
touch .env
```

Add the following content to `.env`:
```env
# FastAPI backend URL (must match backend server location)
VITE_API_URL=http://127.0.0.1:8000
```

**Note:** If running backend on a different machine:
- Local network: `http://192.168.x.x:8000` (use machine IP)
- Remote server: `https://your-domain.com:8000`

### 3.4: Verify Frontend Setup

```bash
# Check if node_modules installed
ls node_modules

# Verify npm scripts
npm run dev --dry-run
```

---

## 🎯 Step 4: Running the Application

### 4.1: Start Backend Server

**In one terminal, from `backend/` directory (with venv activated):**

```bash
python main.py
```

Expected output:
```
Loading embedding model...
✓ Expanded collection loaded: 5000 documents
Connecting to Gemini...
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Keep this terminal running.**

### 4.2: Start Frontend Development Server

**In another terminal, from project root:**

```bash
npm run dev
```

Expected output:
```
VITE v8.2.2 ready in 3965 ms
➜  Local:   http://localhost:5173/
```

### 4.3: Open in Browser

1. Open your browser
2. Navigate to: `http://localhost:5173/`
3. You should see the SpaceMinds UI

✅ **Setup Complete!**

---

## 📊 Project Structure After Setup

```
space-minds/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── InputBar.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── ReferenceScenesSection.jsx    [NEW - displays similar scenes]
│   │   └── *.css
│   ├── App.jsx                          [MODIFIED - calls backend APIs]
│   ├── api.js                           [API layer]
│   └── main.jsx
├── backend/
│   ├── venv/                            [Python virtual environment]
│   ├── main.py                          [FastAPI server]
│   ├── rag.py                           [RAG logic]
│   ├── requirements.txt
│   ├── .env                             [YOUR API KEYS HERE]
│   └── demo_data/
│       ├── chroma_db/                   [Vector database - existing docs]
│       ├── chroma_db_expanded/          [Vector database - 5000 patches]
│       ├── rag_documents.json
│       └── demo_subset.parquet
├── package.json
├── .env                                 [Frontend config]
├── vite.config.js
└── SETUP_GUIDE.md

```

---

## 🔌 Backend API Endpoints

The backend provides these endpoints:

### POST `/ask`
**Text-only questions**
```bash
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What types of land cover are visible in satellite images?"}'
```

Response:
```json
{
  "answer": "Satellite images can show various land covers...",
  "visual_description": null,
  "similar_scenes": []
}
```

### POST `/analyze`
**Image analysis with questions**
```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -F "image=@path/to/image.jpg" \
  -F "question=Describe the land cover types visible here"
```

Response:
```json
{
  "answer": "This satellite image shows...",
  "visual_description": "The image contains urban areas, agricultural fields...",
  "similar_scenes": [
    {
      "id": "patch_id_123",
      "distance": 0.15,
      "text": "Description of similar scene",
      "metadata": {
        "country": "India",
        "season": "Summer",
        "climate_zone": "Tropical",
        "latitude": 28.5,
        "longitude": 77.2,
        "patch_id": "S2A_MSIL2A_..."
      }
    }
  ]
}
```

### GET `/`
**Health check**
```bash
curl http://127.0.0.1:8000/
```

---

## 🛠️ Troubleshooting

### Backend Issues

#### Error: `ModuleNotFoundError: No module named 'fastapi'`
**Solution:** Make sure virtual environment is activated
```bash
# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

#### Error: `GOOGLE_API_KEY not found`
**Solution:** Add your Gemini API key to `backend/.env`
```env
GOOGLE_API_KEY=your_key_here
```

#### Error: `Connecting to ChromaDB failed`
**Solution:** Verify data files exist in `backend/demo_data/`
```bash
ls backend/demo_data/chroma_db_expanded
```

#### Port 8000 already in use
**Solution:** Use a different port
```bash
# Modify backend/main.py:
uvicorn.run(app, host="127.0.0.1", port=8001)
```

### Frontend Issues

#### Error: `Cannot find module 'react'`
**Solution:** Reinstall dependencies
```bash
npm install
# or clean install
rm -rf node_modules package-lock.json
npm install
```

#### Error: `VITE_API_URL not found`
**Solution:** Create `.env` file in project root with:
```env
VITE_API_URL=http://127.0.0.1:8000
```

#### Frontend can't reach backend (ERR_CONNECTION_REFUSED)
**Solution:** 
1. Ensure backend is running (`python main.py`)
2. Check `.env` has correct API URL
3. On Windows, check firewall settings

### General Issues

#### Python not found after installation
**Solution:** Restart terminal/computer after installing Python

#### npm not found after installing Node.js
**Solution:** Restart terminal. Node.js installer should add npm to PATH

#### Permission denied errors on macOS/Linux
**Solution:** Use `python3` and `pip3` instead of `python` and `pip`

---

## 📦 Data Files Information

The project includes pre-built vector databases:

### `demo_data/chroma_db/`
- **Purpose:** Original demo vector database
- **Size:** ~100MB
- **Contains:** Subset of BigEarthNet satellite patches
- **Status:** Optional, included for reference

### `demo_data/chroma_db_expanded/`
- **Purpose:** Main vector database with 5,000 expanded patches
- **Size:** ~500MB+
- **Contains:** 5,000 BigEarthNet satellite patches with embeddings
- **Status:** **REQUIRED** - Used by the backend for RAG

### `demo_data/rag_documents.json`
- RAG document corpus
- Descriptions of satellite scenes for context

### `demo_data/demo_subset.parquet`
- Demo dataset in Parquet format
- Optional for analysis/exploration

---

## 🧪 Quick Test

After everything is set up, test the full integration:

### 1. Backend Test
```bash
# Terminal 1 (backend directory with venv)
python main.py
```

### 2. Frontend Test
```bash
# Terminal 2 (project root)
npm run dev
```

### 3. Browser Test
1. Open http://localhost:5173/
2. Type: "What are the main land cover types?"
3. Click Send
4. Should see AI response with similar scenes

✅ If you see the response with scene cards → **Success!**

---

## 📝 Additional Commands

### Build Frontend for Production
```bash
npm run build
# Output: dist/ folder ready for deployment
```

### Lint Frontend Code
```bash
npm run lint
```

### Stop Backend
Press `Ctrl+C` in backend terminal

### Deactivate Virtual Environment
```bash
deactivate
```

### View Installed Packages
```bash
pip list
```

---

## 🌐 Network Configuration

### Running on Same Machine (Default)
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

### Running on Different Machines
1. On backend machine, find IP address:
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # macOS/Linux
   ifconfig | grep "inet "
   ```

2. Update frontend `.env`:
   ```env
   VITE_API_URL=http://192.168.1.100:8000
   ```

3. Update backend `main.py` (if needed):
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

---

## 📚 File Dependencies Summary

| File | Purpose | Setup |
|------|---------|-------|
| `package.json` | Frontend packages | `npm install` |
| `backend/requirements.txt` | Backend packages | `pip install -r requirements.txt` |
| `backend/.env` | Backend config (API keys) | Create manually ⭐ |
| `.env` | Frontend config (API URL) | Create manually ⭐ |
| `backend/demo_data/chroma_db_expanded/` | Vector database | ⚠️ Must exist (included in repo) |
| `backend/main.py` | Backend entry point | Run: `python main.py` |
| `src/main.jsx` | Frontend entry point | Run: `npm run dev` |

⭐ = **Must create/configure manually**
⚠️ = **Must be present in repository**

---

## ✅ Final Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `backend/.env` created with `GOOGLE_API_KEY`
- [ ] `.env` created with `VITE_API_URL`
- [ ] Vector database files present in `backend/demo_data/`
- [ ] Backend starts successfully (`python main.py`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Backend accessible at `http://127.0.0.1:8000`
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] Can send message and get response with similar scenes

---

## 🆘 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Verify all steps in **Prerequisites Checklist**
3. Ensure both terminals are running (backend + frontend)
4. Check `.env` files are created correctly
5. Verify API key is set in `backend/.env`

---

**Last Updated:** 2026-09-02
**Project:** SpaceMinds v1.0
**Status:** Ready for local development ✅
