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

```bash
# Install dependencies
pip install -r requirements.txt
cd frontend && npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Load knowledge base
python backend/knowledge/loader.py

# Start services with Docker
docker-compose up -d

# Or start manually
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &
cd frontend && npm start
```

### Access Points
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- N8N: http://localhost:5678

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

### Development Time: 6 hours
Built for Pioneers AI Lab Hackathon at Station F.
