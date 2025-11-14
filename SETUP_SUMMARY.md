# NegotiAI Coach - Setup Summary

Quick reference for all platform setup methods. Choose your platform below.

---

## 🪟 Windows 11 Setup

### Prerequisites
- Python 3.13.1 ([Download](https://www.python.org/downloads/))
- Visual Studio Code ([Download](https://code.visualstudio.com/))
- Git for Windows ([Download](https://git-scm.com/download/win))

### Option A: PowerShell (Recommended)

```powershell
# Clone repository
git clone [your-repo-url]
cd negociation_ai

# Allow script execution (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run automated setup
.\scripts\setup_windows.ps1

# Start backend
python start_simple.py
```

### Option B: Batch Script

```cmd
REM If PowerShell doesn't work
.\scripts\setup_windows.bat
python start_simple.py
```

### VS Code Workflow

```powershell
# Open in VS Code
code .

# Press F5 to start debugging
# Or Ctrl+Shift+B → "Backend: Start Server"
```

**VS Code Features:**
- ✅ Auto-detected virtual environment
- ✅ F5 debugging with breakpoints
- ✅ Black formatting on save
- ✅ Flake8 linting
- ✅ Tasks for backend, frontend, tests
- ✅ Recommended extensions auto-install

**See:** [WINDOWS_VSCODE_GUIDE.md](WINDOWS_VSCODE_GUIDE.md) for complete guide

---

## 🐧 Linux / macOS Setup

### Prerequisites
- Python 3.11+ (3.13 recommended)
- Node.js 16+ (optional, for frontend)
- Git

### Automated Setup

```bash
# Clone repository
git clone [your-repo-url]
cd negociation_ai

# Make script executable
chmod +x scripts/quick_setup.sh

# Run setup
./scripts/quick_setup.sh

# Start backend
python start_simple.py
```

**See:** [VENV_GUIDE.md](VENV_GUIDE.md) for detailed virtual environment guide

---

## 🌐 Browser Extension Setup

Works on all platforms once backend is running.

### Installation (Chrome/Brave)

1. Open Chrome: `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select folder: `negociation_ai/browser-extension`
5. Extension installed ✓

### Installation (Firefox)

1. Open Firefox: `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select: `browser-extension/manifest.json`
4. Extension installed ✓

### Usage

1. Start backend: `python start_simple.py`
2. Join video call (Google Meet, Zoom, Teams)
3. Overlay appears automatically
4. Real-time AI suggestions displayed

---

## 📋 What Each Setup Does

All setup scripts perform these steps automatically:

1. ✅ **Check Python version** (3.11+ required)
2. ✅ **Create virtual environment** (`venv/` or `.venv/`)
3. ✅ **Upgrade pip** to latest version
4. ✅ **Install dependencies** from `requirements.txt`
5. ✅ **Create .env file** (if doesn't exist)
6. ✅ **Verify configuration** (display summary)

After setup completes, you can:
- Run `python start_simple.py` to start backend
- Install browser extension for overlay mode
- Run `python demo/run_scenario.py` for demo

---

## 🚀 Access Points After Setup

Once running, access these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **API Documentation** | http://localhost:8000/docs | Interactive API docs |
| **Health Check** | http://localhost:8000/api/health | Backend status |
| **Frontend** | http://localhost:3000 | React UI (if running) |
| **WebSocket** | ws://localhost:8000/ws/live/{session_id} | Live updates |

---

## 🔧 Manual Setup (All Platforms)

If automated scripts don't work:

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 5. Start backend
python start_simple.py
```

---

## 🆘 Troubleshooting

### Python not found
- **Windows**: Add Python to PATH during installation, or manually add `C:\Users\YourName\AppData\Local\Programs\Python\Python313`
- **Linux/Mac**: Install via package manager: `sudo apt install python3.13` or `brew install python@3.13`

### PowerShell execution blocked
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port 8000 already in use
```bash
# Find process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8000
kill -9 <PID>
```

### Virtual environment activation fails
```bash
# Windows - try different shells:
.\venv\Scripts\activate.ps1  # PowerShell
.\venv\Scripts\activate.bat  # CMD

# Linux/Mac:
source venv/bin/activate
```

### Dependencies fail to install
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Try installing again
pip install -r requirements.txt

# If specific package fails, check Python version compatibility
python --version
```

---

## 📚 Documentation

| Guide | Description | Lines |
|-------|-------------|-------|
| [WINDOWS_VSCODE_GUIDE.md](WINDOWS_VSCODE_GUIDE.md) | Complete Windows 11 + Python 3.13.1 + VS Code setup | 570 |
| [VENV_GUIDE.md](VENV_GUIDE.md) | Virtual environment comprehensive guide | 3000+ |
| [INSTALLATION_SIMPLE.md](INSTALLATION_SIMPLE.md) | Detailed installation instructions | - |
| [README.md](README.md) | Project overview and quick start | - |

---

## ✅ Post-Setup Checklist

- [ ] Python 3.11+ installed and in PATH
- [ ] Repository cloned
- [ ] Virtual environment created (venv/ exists)
- [ ] Dependencies installed (pip list shows packages)
- [ ] .env file created with API keys
- [ ] Backend starts successfully (`python start_simple.py`)
- [ ] http://localhost:8000/docs accessible
- [ ] Browser extension installed (optional)
- [ ] VS Code configured (Windows users)

---

## 🎯 Next Steps

1. **Configure API Keys** (optional for demo):
   ```bash
   # Edit .env file
   ELEVENLABS_API_KEY=your_key_here
   MISTRAL_API_KEY=your_key_here
   ```

2. **Run Demo Scenario**:
   ```bash
   python demo/run_scenario.py
   ```

3. **Start Development**:
   - Windows: Open in VS Code, press F5
   - Linux/Mac: Run `python start_simple.py`

4. **Install Extension**:
   - Follow browser extension steps above
   - Join a video call to test

---

**Built for Pioneers AI Lab Hackathon @ Station F**

Development time: 6 hours | Python 3.13.1 compatible | Cross-platform support
