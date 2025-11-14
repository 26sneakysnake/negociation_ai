# NegotiAI Coach - Technical Architecture

## Overview

NegotiAI Coach is a real-time AI-powered negotiation assistant built for the Pioneers AI Lab Hackathon at Station F. The system provides live tactical suggestions, pattern detection, and optional automated responses during business negotiations.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ PrepScreen│  │LiveScreen│  │ AutoPilotToggle │  │
│  └──────────┘  └──────────┘  └─────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (FastAPI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │AudioProcessor│  │  AIEngine    │  │VectorStore││
│  │ (ElevenLabs) │  │  (Mistral)   │  │ (Qdrant)  ││
│  └──────────────┘  └──────────────┘  └───────────┘│
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              WORKFLOW (N8N)                          │
│  Audio → Transcribe → Analyze → Suggest → Send     │
└─────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React)

**Location**: `/frontend/src/`

**Key Components**:
- `PrepScreen.jsx`: Strategy preparation and briefing
- `LiveScreen.jsx`: Real-time negotiation interface
- `SuggestionPanel.jsx`: AI suggestion display
- `AutoPilotToggle.jsx`: Auto-pilot mode control

**Services**:
- `WebSocketService.js`: Real-time communication
- `AudioCapture.js`: Microphone access and streaming
- `api.js`: REST API client

### 2. Backend (FastAPI)

**Location**: `/backend/`

#### 2.1 Main Server (`main.py`)
- WebSocket endpoint for live sessions
- REST API for preparation and configuration
- Session management
- Health checks

#### 2.2 Audio Processing (`audio/`)
- `processor.py`: ElevenLabs integration for STT and TTS
- `stream_handler.py`: Audio chunking and streaming
- Emotion detection
- Hesitation marker identification

#### 2.3 AI Engine (`ai/`)
- `engine.py`: Mistral AI orchestration
  - Strategy analysis
  - Suggestion generation
  - Context-aware recommendations
- `patterns.py`: Pattern detection
  - Manipulation tactics
  - Objection patterns
  - Opportunity signals
- `autopilot.py`: Automated response system
  - Boundary validation
  - Tactic execution
  - Voice synthesis

#### 2.4 Knowledge Base (`knowledge/`)
- `vector_store.py`: Qdrant client and operations
- `negotiation_db.json`: Tactics, patterns, counters
- `loader.py`: Knowledge base initialization

### 3. Data Models (`models.py`)

**Key Models**:
```python
NegotiationContext:
  - target_outcome
  - minimum_acceptable
  - batna
  - red_lines

LiveAnalysis:
  - transcript
  - emotion
  - detected_patterns
  - manipulation_score

Suggestion:
  - type (counter/question/warning/opportunity/close)
  - priority (critical/high/medium/low)
  - text
  - auto_pilot_available
```

## Data Flow

### Preparation Flow
```
1. User uploads context → FastAPI
2. Vectorize document → Qdrant
3. User defines strategy → Mistral analysis
4. AI challenges strategy → User reviews
5. Session ready → WebSocket initialized
```

### Live Negotiation Flow
```
1. Audio capture (250ms chunks) → WebSocket
2. Transcription → ElevenLabs STT
3. Pattern detection → Pattern Matcher
4. Context retrieval → Qdrant search
5. Suggestion generation → Mistral AI
6. Display to user → WebSocket push
7. [Optional] Auto-pilot → Voice synthesis → Audio playback
```

## Pattern Detection System

### Pattern Categories

**Manipulation**:
- False urgency
- Aggressive anchoring
- Good cop / Bad cop
- Nibbling (post-agreement additions)

**Objections**:
- Price objections
- Authority limits
- Competitive mentions

**Opportunities**:
- Hesitation signals
- Budget availability
- Pain point mentions

**Stalemate**:
- Repetition detection
- Silent deadlock

### Detection Logic
```python
1. Keyword matching
2. Regex patterns
3. Frequency analysis
4. Context evaluation
→ Manipulation score (0-1)
→ Opportunity score (0-1)
→ Stalemate risk (0-1)
```

## Auto-Pilot System

### Activation Triggers
- Stalemate risk > 70%
- Manipulation score > 80%
- Aggressive emotion detected
- Critical pattern matched

### Safety Mechanisms
- Red line validation
- Script content analysis
- User boundary enforcement
- Manual override available

### Tactics
- Stall and buy time
- Firm rejection
- Counter-anchor
- Walk-away threat
- Call bluff
- Reframe discussion

## Performance Targets

| Metric | Target |
|--------|--------|
| Transcription latency | < 500ms |
| Suggestion generation | < 2s |
| Pattern detection | < 100ms |
| Auto-pilot activation | < 1s |
| Voice synthesis | < 1.5s |

## API Endpoints

### REST API

**Preparation**:
- `POST /api/prepare/upload` - Upload context document
- `POST /api/prepare/brief` - Process strategy brief

**Session Management**:
- `GET /api/session/{id}` - Get session details
- `POST /api/session/{id}/autopilot` - Configure auto-pilot

**Health**:
- `GET /api/health` - Service health check

### WebSocket

**Endpoint**: `ws://localhost:8000/ws/live/{session_id}`

**Message Types**:
- `transcript`: Real-time transcription
- `suggestion`: AI tactical suggestion
- `alert`: Critical warnings
- `status`: Connection/system status
- `auto_pilot`: Automated response

## Deployment

### Docker Services

```yaml
services:
  - backend (FastAPI): Port 8000
  - frontend (React): Port 3000
  - qdrant (Vector DB): Port 6333
  - n8n (Workflows): Port 5678
```

### Environment Variables

Required API keys:
- `ELEVENLABS_API_KEY`
- `MISTRAL_API_KEY`
- `QDRANT_API_KEY` (optional for local)

### Quick Start

```bash
# Setup
./scripts/setup.sh

# Start all services
./scripts/start.sh

# Run demo
./scripts/demo.sh
```

## Technology Stack

### Core Technologies
- **Frontend**: React 18
- **Backend**: FastAPI (Python 3.11)
- **Database**: Qdrant (vector store)
- **Workflows**: N8N

### AI Services
- **ElevenLabs**: Speech-to-Text, Text-to-Speech, Emotion Analysis
- **Mistral AI**: Strategy analysis, suggestion generation, embeddings
- **Qdrant**: Context and knowledge retrieval

### Additional Services
- **Google Cloud**: Backup STT (optional)
- **Lovable**: UI prototyping (optional)
- **Fal AI**: Visual generation (optional)

## Knowledge Base Structure

### Frameworks
- Harvard Negotiation Method
- Chris Voss FBI Tactics

### Pattern Database
- ~15 manipulation patterns
- ~10 objection types
- ~8 opportunity signals
- ~5 closing techniques

### Power Phrases
- Calibrated questions
- Labeling techniques
- Mirroring templates

## Future Enhancements

1. **Multi-language support** (French, English, Spanish)
2. **Voice cloning** for personalized auto-pilot
3. **Post-negotiation analysis** with ML insights
4. **Mobile app** for on-the-go negotiations
5. **Integration** with CRM systems
6. **Team collaboration** mode

## Hackathon Specifics

**Duration**: 6 hours development time

**Required Partners**:
- ✅ ElevenLabs (audio)
- ✅ Mistral AI (intelligence)
- ✅ Qdrant (vector store)
- ✅ N8N (workflows)
- ✅ Google Cloud (backup)
- ✅ Lovable (UI)
- ✅ Fal AI (optional)

Total: **7 partner technologies** integrated

## License

Built for Pioneers AI Lab Hackathon @StationF
