# SpaceMinds Complete Setup Guide

Complete step-by-step instructions to set up and run the SpaceMinds React frontend + FastAPI RAG backend application.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)
8. [Summary](#summary)

---

## System Requirements

### Backend Requirements
- **Python**: 3.8 or higher
- **pip**: Python package manager (comes with Python)
- **Terminal/Command Prompt**: For running uvicorn server

### Frontend Requirements
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher (comes with Node.js)
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Terminal/Command Prompt**: For running development server

### Verify Prerequisites

**Check Python:**
```bash
python --version
# or
python3 --version
```
Should show version 3.8 or higher.

**Check pip:**
```bash
pip --version
# or
pip3 --version
```

**Check Node.js:**
```bash
node --version
```
Should show version 16.0 or higher.

**Check npm:**
```bash
npm --version
```
Should show version 7.0 or higher.

If any are missing, download and install:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

---

## Project Structure

After cloning/extracting the project, the structure should be:

```
space-minds/
├── src/                          # React frontend source
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── ChatWindow.css
│   │   ├── InputBar.jsx
│   │   ├── InputBar.css
│   │   ├── MessageBubble.jsx
│   │   ├── MessageBubble.css
│   │   ├── ImagePreview.jsx
│   │   └── ImagePreview.css
│   ├── App.jsx                   # Main React component
│   ├── App.css
│   ├── main.jsx                  # React entry point
│   ├── index.css
│   ├── api.js                    # API layer for backend calls
│   └── assets/
├── public/                        # Static assets
├── backend/                       # FastAPI RAG backend
│   ├── main.py                   # FastAPI entry point (CORS enabled)
│   ├── rag.py                    # RAG pipeline logic
│   ├── create_documents.py       # Document processing
│   ├── create_vector_db.py       # Vector database creation
│   ├── create_subset.py          # Data subsetting
│   └── demo_data/
│       ├── rag_documents.json    # RAG documents
│       └── demo_subset.parquet   # Demo dataset
├── package.json                   # Frontend dependencies
├── vite.config.js                # Vite configuration
├── .env                           # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── README.md
└── SETUP_GUIDE.md               # This file

```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

From the project root, navigate to the backend folder:

```bash
cd backend
```

You should now be in the `space-minds/backend/` directory.

### Step 2: Create a Virtual Environment (Recommended)

It's best practice to use a Python virtual environment to isolate project dependencies.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

After activation, your terminal prompt should show `(venv)` at the beginning.

### Step 3: Verify Virtual Environment (Optional)

Check that you're using the virtual environment's Python:

```bash
where python
# On Windows, should show a path inside your project with /venv/

which python
# On macOS/Linux, should show a path inside your project with /venv/
```

### Step 4: Install Backend Dependencies

With the virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

**If `requirements.txt` doesn't exist**, install the key packages manually:

```bash
pip install fastapi uvicorn pydantic chromadb openai python-dotenv numpy pandas
```

This will install:
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation
- **chromadb**: Vector database
- **openai**: For Gemini/OpenAI integration
- **python-dotenv**: Environment variable management
- **numpy, pandas**: Data processing

### Step 5: Verify Backend Dependencies

Check that installations succeeded:

```bash
pip list
```

You should see all the packages listed above.

### Step 6: Configure Environment Variables

The backend needs API keys and configuration. In the `backend/` directory, create a `.env` file:

```bash
# From backend directory
touch .env
# (on Windows, create it manually or use: copy nul .env)
```

**Add the following to `backend/.env`:**

```env
# Gemini API Key (required for RAG answer generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Adjust ChromaDB or RAG settings
# CHROMA_DB_PATH=./chroma_db
# MODEL_NAME=gemini-pro
```

⚠️ **IMPORTANT**: Replace `your_gemini_api_key_here` with your actual Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)

### Step 7: Verify RAG Data Files

The backend expects demo data files. Check they exist:

```bash
# From backend directory
ls demo_data/
# Should show: rag_documents.json, demo_subset.parquet
```

If files are missing:
1. Check they were included in the project clone
2. Run data generation scripts if needed:
   ```bash
   python create_vector_db.py
   python create_documents.py
   ```

### Step 8: Test Backend Startup

Start the FastAPI backend server:

```bash
# From backend directory with virtual environment activated
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### Step 9: Verify Backend Health

In another terminal, test the health endpoint:

```bash
curl http://127.0.0.1:8000/
```

**Expected response:**
```json
{"status":"online","message":"BigEarthNet RAG API is running"}
```

If you get a connection error, backend is not running. If you get another error, there may be issues with dependencies or API keys.

### Step 10: Keep Backend Running

Leave this terminal open with the backend running. You'll need it for the frontend to communicate with.

---

## Frontend Setup

Open a **new terminal** (keep the backend terminal open) and follow these steps:

### Step 1: Navigate to Project Root

Make sure you're in the `space-minds/` root directory (not in `backend/`):

```bash
cd ..
# Or from a fresh terminal: cd /path/to/space-minds
```

Verify by checking that you can see `package.json`:
```bash
ls package.json
# Should list the file
```

### Step 2: Install Node Dependencies

Install all React and Vite dependencies:

```bash
npm install
```

This will:
1. Read `package.json`
2. Download React, Vite, and other dependencies
3. Create `node_modules/` folder
4. Generate `package-lock.json`

This may take 1-3 minutes depending on internet speed.

**If you get errors**, try:
```bash
npm cache clean --force
npm install
```

### Step 3: Verify Frontend Dependencies

Check installation succeeded:

```bash
npm list
```

Should show `react`, `react-dom`, `vite`, and other packages without error messages.

### Step 4: Configure Frontend Environment

The frontend needs the API URL. Create/verify `.env` in the project root:

```bash
# From project root, should already exist but verify
cat .env
```

**File should contain:**
```env
VITE_API_URL=http://127.0.0.1:8000
```

If not present, create/update it:

**On Windows:**
```bash
echo VITE_API_URL=http://127.0.0.1:8000 > .env
```

**On macOS/Linux:**
```bash
echo 'VITE_API_URL=http://127.0.0.1:8000' > .env
```

### Step 5: Start Frontend Development Server

Start the Vite development server:

```bash
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 6: Open Application in Browser

Open your web browser and navigate to:

```
http://localhost:5173/
```

You should see the SpaceMinds chat interface with:
- Header: "SpaceMinds AI Assistant" with online status
- Chat window showing initial greeting
- Input bar with text field and send button
- Image attachment button

### Step 7: Keep Frontend Running

Leave this terminal open with the development server running.

---

## Running the Application

Now that both backend and frontend are set up, here's how to run them:

### Daily Startup Process

**Terminal 1 - Backend:**
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start server
uvicorn main:app --reload
```

Wait for output showing `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
# Navigate to project root (if not already there)
cd ..

# Start development server
npm run dev
```

Wait for output showing `Local: http://localhost:5173/`

**Open Browser:**
Navigate to `http://localhost:5173/`

### During Development

- **Making frontend changes**: Vite automatically hot-reloads. Just edit files in `src/` and save.
- **Making backend changes**: The `--reload` flag auto-restarts the server. Save the file and it reloads.
- **Stopping frontend**: Press `Ctrl+C` in the frontend terminal
- **Stopping backend**: Press `Ctrl+C` in the backend terminal

### Deactivating Virtual Environment

When done for the day, deactivate the Python virtual environment:

```bash
# In the backend terminal
deactivate
```

---

## Testing the Integration

### Test 1: Frontend Loads Successfully

**Expectation:**
- ✅ Browser loads `http://localhost:5173/` without errors
- ✅ Page shows SpaceMinds header and chat interface
- ✅ Initial greeting message appears
- ✅ Input bar has text field and send button enabled

**If it fails:**
- Check browser console (F12 → Console) for JavaScript errors
- Check that both servers are running
- See [Troubleshooting](#troubleshooting) section

### Test 2: Simple Text Query

**Steps:**
1. Click on the text input field
2. Type: **"What is BigEarthNet?"**
3. Press Enter or click Send button

**Expectations:**
- ✅ Your message appears in chat as user message
- ✅ Loading indicator (typing animation) appears
- ✅ Backend terminal shows incoming request
- ✅ After a few seconds, assistant response appears with answer
- ✅ No JavaScript errors in browser console

**Network Request Details:**
- Method: POST
- URL: http://127.0.0.1:8000/ask
- Body: `{"query":"What is BigEarthNet?"}`
- Status: 200 OK

### Test 3: Multiple Queries

**Steps:**
1. Send several different queries one after another
2. Try: "Are forests represented?", "What metadata is available?", etc.

**Expectations:**
- ✅ Each query appears in chat order
- ✅ Each gets a response
- ✅ Conversation flows naturally
- ✅ No errors after multiple requests

### Test 4: Empty Query Validation

**Steps:**
1. Leave the text input empty
2. Observe the Send button

**Expectations:**
- ✅ Send button is **disabled** (grayed out)
- ✅ Clicking it does nothing
- ✅ Only typing text enables the button

### Test 5: Backend Unavailable Error Handling

**Steps:**
1. With everything running, send one successful query first
2. Stop the FastAPI backend (Ctrl+C in backend terminal)
3. Try sending another query

**Expectations:**
- ✅ Message is added to chat
- ✅ Loading indicator shows
- ✅ Friendly error message appears: "Unable to connect to the RAG backend..."
- ✅ No JavaScript error visible to user
- ✅ No stack traces shown

**Restart backend:**
```bash
# In backend terminal
uvicorn main:app --reload
```

Then try a query again - should work.

### Test 6: Image Upload UI

**Steps:**
1. Click the image/paperclip button
2. Select an image from your computer
3. The image appears as a thumbnail

**Expectations:**
- ✅ Thumbnail preview shows below input
- ✅ Can remove image with X button
- ✅ Can upload multiple images (up to 5)

**Currently (v1):**
- Images are shown in chat but not processed by backend yet
- Text-only queries are supported
- If you send only images without text, you get: "Text-based queries are currently supported"

### Test 7: Long Responses

**Steps:**
1. Send a query that typically gets a longer response
2. Example: "Describe the BigEarthNet dataset in detail"

**Expectations:**
- ✅ Entire answer displays correctly
- ✅ Chat scrolls automatically to show latest message
- ✅ No text truncation or display issues

### Test 8: Browser Refresh

**Steps:**
1. Send some messages to build up conversation
2. Refresh the browser (F5 or Ctrl+R)

**Expectations:**
- ✅ Chat history is cleared (it's in-memory, not persisted)
- ✅ Initial greeting reappears
- ✅ Frontend still works after refresh

---

## Troubleshooting

### Issue: "Cannot find command: python"

**Cause:** Python not installed or not in PATH

**Solution:**
1. Download Python from https://www.python.org/downloads/
2. During installation, **check "Add Python to PATH"**
3. Restart terminal and try again

### Issue: "Cannot find command: node" or "npm"

**Cause:** Node.js not installed

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install using default settings
3. Restart terminal and try again

### Issue: Backend won't start - "Address already in use"

**Cause:** Port 8000 already in use by another application

**Solution:**
```bash
# Try a different port
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Then update .env to use new port:
# VITE_API_URL=http://127.0.0.1:8001
```

### Issue: CORS error in browser console

**Error message:** "Access to XMLHttpRequest at 'http://127.0.0.1:8000/ask' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Cause:** Backend CORS not properly configured

**Solution:**
1. Verify `backend/main.py` has CORS middleware
2. Check it allows `http://localhost:5173`
3. Restart backend server

**Check code:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Frontend shows "Unable to connect to the RAG backend"

**Cause:** Backend not running, wrong URL, or backend crashed

**Solution:**
1. Verify backend is running: Check backend terminal for `Uvicorn running...`
2. Check backend health: `curl http://127.0.0.1:8000/`
3. If no response, restart backend: `Ctrl+C` then `uvicorn main:app --reload`
4. Check `.env` has correct URL: `VITE_API_URL=http://127.0.0.1:8000`

### Issue: Frontend won't start - "Port 5173 already in use"

**Cause:** Another application using port 5173

**Solution:**
```bash
# Try without specifying port (Vite will find another)
npm run dev

# Or use a different port explicitly
npm run dev -- --port 5174
```

### Issue: Backend crashes with "ModuleNotFoundError"

**Cause:** Missing Python dependency

**Solution:**
```bash
# Activate virtual environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Or install specific package:
pip install fastapi uvicorn
```

### Issue: "No module named 'openai'" or other Gemini library errors

**Cause:** Missing API keys or libraries

**Solution:**
1. Verify `backend/.env` has `GEMINI_API_KEY` set
2. Install Gemini SDK: `pip install google-generativeai`
3. Or OpenAI SDK if using that: `pip install openai`

### Issue: Backend returns 500 error

**Cause:** Server error during RAG processing or Gemini call

**Solution:**
1. Check backend terminal for error messages
2. Verify GEMINI_API_KEY is valid
3. Check demo data files exist in `backend/demo_data/`
4. Try a simpler query first

### Issue: Blank page or nothing loads

**Cause:** Multiple possibilities

**Solution - Systematic check:**
1. Check browser console (F12 → Console) for errors
2. Check network tab (F12 → Network) for failed requests
3. Verify both servers are running:
   - Backend: `curl http://127.0.0.1:8000/`
   - Frontend: http://localhost:5173/ should load
4. Check `.env` file exists and has correct URL
5. Clear browser cache (Ctrl+Shift+Delete) and reload
6. Try a different browser

### Issue: Send button doesn't work

**Cause:** Several possible reasons

**Solution - Check in order:**
1. Is there text in the input? Button should be enabled only if text exists
2. Is backend running? If not, query fails after sending
3. Check browser console for JavaScript errors
4. Try refreshing the page (F5)
5. Try a different browser

### Issue: Virtual environment activation fails

**Windows - "cannot be loaded because running scripts is disabled"**

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try activation again
venv\Scripts\activate
```

---

## Summary

### Quick Reference

**Total Setup Time:** 15-30 minutes (first time)

**Startup Steps (each session):**

1. **Terminal 1 - Backend** (2-3 minutes)
   ```bash
   cd backend
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # macOS/Linux
   uvicorn main:app --reload
   ```

2. **Terminal 2 - Frontend** (1-2 minutes)
   ```bash
   npm run dev
   ```

3. **Browser**
   ```
   http://localhost:5173/
   ```

**Shutdown:**
- Frontend: Ctrl+C in frontend terminal
- Backend: Ctrl+C in backend terminal
- Deactivate: `deactivate` in backend terminal

### What You've Set Up

- ✅ React frontend with Vite hot-reloading
- ✅ FastAPI backend with RAG pipeline
- ✅ ChromaDB vector search
- ✅ Gemini API integration (server-side)
- ✅ CORS configuration for local development
- ✅ Environment variable configuration
- ✅ Chat interface with message history
- ✅ Error handling and user-friendly messages

### What Works

- ✅ Send text queries from frontend
- ✅ Backend processes via RAG + Gemini
- ✅ Answers display in chat interface
- ✅ Loading indicators during processing
- ✅ Error messages if backend unavailable
- ✅ Empty query validation
- ✅ Multiple queries in conversation

### What's Not Yet Implemented

- ⏳ Image-based RAG (backend will be extended)
- ⏳ Source display in UI (data available, UI pending)
- ⏳ Conversation persistence (in-memory only)
- ⏳ User authentication
- ⏳ Production deployment

---

## Next Steps

1. **Run the application** following the "Running the Application" section
2. **Test the integration** following the "Testing the Integration" section
3. **Explore the code** in `src/` and `backend/` folders
4. **Customize** queries and add features as needed
5. **Deploy** when ready (see deployment documentation)

---

## Support

If you encounter issues:

1. **Check this guide first** - Most common issues are listed in Troubleshooting
2. **Check terminal output** - Error messages usually explain the problem
3. **Check browser console** - F12 → Console for JavaScript errors
4. **Read code comments** - Key files have inline documentation:
   - `src/api.js` - How frontend calls backend
   - `src/App.jsx` - Main React logic
   - `backend/main.py` - FastAPI setup

---

**You're now ready to use SpaceMinds! Start with the "Running the Application" section.** 🚀
