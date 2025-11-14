# NegotiAI Coach - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- API Keys (ElevenLabs, Mistral AI)

### Step 1: Clone and Setup

```bash
# Clone the repository
cd negociation_ai

# Run setup script
./scripts/setup.sh
```

### Step 2: Configure API Keys

Edit `.env` file:

```bash
ELEVENLABS_API_KEY=your_key_here
MISTRAL_API_KEY=your_key_here
# Other keys are optional for basic functionality
```

### Step 3: Start Services

```bash
./scripts/start.sh
```

This will start:
- Backend API at http://localhost:8000
- Frontend at http://localhost:3000
- Qdrant at http://localhost:6333
- N8N at http://localhost:5678

### Step 4: Load Knowledge Base

```bash
python backend/knowledge/loader.py
```

### Step 5: Run Demo

```bash
./scripts/demo.sh
```

## 📱 Using the Application

### Preparation Phase

1. **Open** http://localhost:3000
2. **Upload Context** (optional)
   - PDF, DOC, or TXT file with negotiation background
3. **Define Strategy**
   - Target outcome: What you want to achieve
   - Minimum acceptable: Your walk-away point
   - BATNA: Best alternative if negotiation fails
   - Red lines: Non-negotiable boundaries
4. **Review AI Analysis**
   - Strengths and weaknesses
   - Challenge questions
   - Improvement suggestions

### Live Negotiation

1. **Click "Start Live Session"**
2. **Grant microphone permission**
3. **Click "Start Recording"**
4. **Negotiate while viewing**:
   - Real-time transcription
   - AI tactical suggestions
   - Pattern detection alerts
   - Emotional analysis

### Auto-Pilot Mode

1. **Toggle "Auto-Pilot ON"** in live session
2. **AI will automatically respond** when:
   - Manipulation detected (>80% score)
   - Stalemate risk high (>70%)
   - Aggressive tactics used
   - Critical patterns matched
3. **Manual override** always available

## 🎯 Demo Scenario

The included demo simulates a **SaaS B2B contract negotiation**:

- **Your Role**: Sales Representative
- **Target**: 50K EUR ARR
- **Minimum**: 35K EUR ARR
- **Duration**: ~5 minutes
- **Tactics Encountered**:
  - Aggressive anchoring (25K)
  - False urgency
  - Price objection
  - Stalemate
  - Nibbling

**Run it**:
```bash
./scripts/demo.sh
```

## 🔧 Manual Setup (Without Docker)

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Load knowledge base
python backend/knowledge/loader.py

# Start Qdrant locally (or use cloud)
docker run -p 6333:6333 qdrant/qdrant

# Start server
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### N8N (Optional)

```bash
docker run -p 5678:5678 n8nio/n8n
```

## 📊 API Documentation

Once backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🐛 Troubleshooting

### Audio Not Working

```bash
# Check microphone permissions in browser
# Chrome: chrome://settings/content/microphone
# Firefox: about:preferences#privacy
```

### WebSocket Connection Failed

```bash
# Check backend is running
curl http://localhost:8000/api/health

# Check firewall rules
# Ensure port 8000 is accessible
```

### Qdrant Connection Error

```bash
# Check Qdrant is running
curl http://localhost:6333

# Or start manually
docker run -p 6333:6333 qdrant/qdrant
```

### API Key Errors

```bash
# Verify .env file exists
cat .env

# Check keys are set
echo $ELEVENLABS_API_KEY
echo $MISTRAL_API_KEY
```

## 🔑 Getting API Keys

### ElevenLabs
1. Go to https://elevenlabs.io
2. Sign up for account
3. Navigate to API settings
4. Copy API key

### Mistral AI
1. Go to https://console.mistral.ai
2. Create account
3. Generate API key
4. Copy to `.env`

### Qdrant (Optional)
- Use local instance (no key needed)
- Or get cloud key at https://cloud.qdrant.io

## 📈 Performance Tips

### For Best Results

1. **Use headphones** to prevent audio feedback
2. **Quiet environment** for better transcription
3. **Clear speech** when recording
4. **Stable internet** for real-time processing

### Optimize Latency

```python
# In backend/config.py
audio_chunk_size = 250  # Lower = faster (but less accurate)
suggestion_timeout = 2.0  # Increase if getting timeouts
```

## 🎓 Learn More

- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](http://localhost:8000/docs)
- [Pattern Detection Guide](backend/knowledge/negotiation_db.json)

## 💡 Example Negotiation

**Scenario**: Software license negotiation

1. **Prep Phase**:
   - Target: $50K/year, 3-year term
   - Minimum: $35K/year, 1-year
   - BATNA: Competitor offer at $30K

2. **Live Phase**:
   - Counterparty: "We can only do $25K"
   - AI Detects: Aggressive anchoring
   - AI Suggests: "Ignore anchor, focus on value"
   - You: "Let me show you the ROI analysis..."

3. **Auto-Pilot** (if enabled):
   - Stalemate detected after 3 rounds
   - AI: "Je remarque que nous tournons en rond. Explorons une nouvelle approche ensemble."

## 🆘 Support

For issues during hackathon:
1. Check logs: `docker-compose logs -f`
2. Review API health: http://localhost:8000/api/health
3. Restart services: `docker-compose restart`

## 🎉 Ready to Negotiate!

You're all set! Start your first negotiation:

```bash
# Quick check
curl http://localhost:8000/api/health

# Open app
open http://localhost:3000

# Good luck! 🎯
```
