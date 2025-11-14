# NegotiAI Coach

AI-powered real-time negotiation assistant for business negotiations.

## Hackathon Pioneers AI Lab @StationF

### Tech Stack
- **ElevenLabs**: Audio transcription, emotion analysis, voice synthesis
- **Mistral AI**: Strategic analysis, pattern detection, suggestion generation
- **Qdrant**: Vector database for context and knowledge retrieval
- **FastAPI**: Backend server with WebSocket support
- **React**: Real-time frontend interface
- **N8N**: Workflow automation
- **Docker**: Containerized deployment

### Features
1. **Strategic Preparation**: Upload context, voice briefing, AI challenge
2. **Live Analysis**: Real-time transcription and pattern detection
3. **Smart Suggestions**: Context-aware tactical recommendations
4. **Auto-Pilot Mode**: Automated responses within defined boundaries
5. **Knowledge Base**: Negotiation techniques and counter-tactics

### Quick Start

#### Automated Setup (Recommended)

**Windows 11 + PowerShell:**
```powershell
.\scripts\setup_windows.ps1
python start_simple.py
```

**Windows 11 + Batch (if PowerShell blocked):**
```cmd
.\scripts\setup_windows.bat
python start_simple.py
```

**Linux / macOS:**
```bash
./scripts/quick_setup.sh
python start_simple.py
```

All setup scripts automatically:
- Create Python virtual environment
- Install dependencies
- Setup .env file
- Verify configuration

#### VS Code Workflow (Windows 11)

1. Open project in VS Code: `code .`
2. Press **F5** to start debugging backend
3. Or use **Ctrl+Shift+B** → "Backend: Start Server"

See [WINDOWS_VSCODE_GUIDE.md](WINDOWS_VSCODE_GUIDE.md) for complete VS Code setup.

#### Manual Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Or (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
cd frontend && npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Load knowledge base
python backend/knowledge/loader.py

# Start services
python start_simple.py
```

### Access Points
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- N8N: http://localhost:5678

### Browser Extension (Overlay Mode)

The browser extension displays AI suggestions directly on video call pages (Google Meet, Zoom, Teams).

**Installation:**
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `negociation_ai/browser-extension`
5. Join a video call - the overlay activates automatically

**Features:**
- Draggable, minimizable overlay
- Real-time suggestions
- Live transcript
- Auto-connects to backend via WebSocket

### Architecture
```
Frontend (React) <-> WebSocket <-> FastAPI Backend
                                        |
                                        v
                        [ElevenLabs | Mistral | Qdrant]
```

### Demo Scenario
Run the SaaS B2B contract negotiation demo:
```bash
python demo/run_scenario.py
```

### Requirements
- **Python**: 3.11+ (tested on 3.13.1)
- **Node.js**: 16+ (for frontend, optional)
- **VS Code**: Latest version (recommended for Windows 11)
- **Browser**: Chrome or Firefox (for extension)

### Documentation
- [WINDOWS_VSCODE_GUIDE.md](WINDOWS_VSCODE_GUIDE.md) - Complete Windows 11 + VS Code setup (570 lines)
- [VENV_GUIDE.md](VENV_GUIDE.md) - Virtual environment comprehensive guide
- [INSTALLATION_SIMPLE.md](INSTALLATION_SIMPLE.md) - Detailed installation instructions
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when running)

### Platform Support
- **Windows 11**: Full support with automated PowerShell/Batch setup + VS Code integration
- **Linux**: Bash setup script with venv auto-management
- **macOS**: Compatible (use Linux setup script)

### Development Time: 6 hours
Built for Pioneers AI Lab Hackathon at Station F.
