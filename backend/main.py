from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import uuid
import json
from typing import Dict
import logging

from backend.config import settings
from backend.models import NegotiationContext, AutoPilotConfig, StrategyAnalysis
from backend.websocket_handler import ConnectionManager
from backend.ai.engine import NegotiationEngine
from backend.knowledge.vector_store import VectorStore

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="NegotiAI Coach API",
    description="Real-time AI assistant for business negotiations",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
connection_manager = ConnectionManager()
sessions: Dict[str, dict] = {}


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting NegotiAI Coach API...")

    # Initialize vector store
    try:
        vector_store = VectorStore()
        await vector_store.initialize()
        app.state.vector_store = vector_store
        logger.info("Vector store initialized")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}")

    # Initialize AI engine
    try:
        ai_engine = NegotiationEngine()
        app.state.ai_engine = ai_engine
        logger.info("AI engine initialized")
    except Exception as e:
        logger.error(f"Failed to initialize AI engine: {e}")

    logger.info("NegotiAI Coach API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down NegotiAI Coach API...")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "NegotiAI Coach",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "vector_store": hasattr(app.state, "vector_store"),
            "ai_engine": hasattr(app.state, "ai_engine")
        },
        "sessions": len(sessions)
    }


@app.post("/api/prepare/upload")
async def upload_context(file: UploadFile = File(...)):
    """Upload and vectorize negotiation context document"""
    try:
        content = await file.read()
        content_str = content.decode("utf-8")

        # Generate session ID
        session_id = str(uuid.uuid4())

        # Vectorize and store
        vector_store = app.state.vector_store
        await vector_store.add_context(session_id, content_str)

        return {
            "status": "success",
            "session_id": session_id,
            "message": "Context uploaded and vectorized"
        }
    except Exception as e:
        logger.error(f"Error uploading context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/prepare/brief")
async def process_voice_brief(session_id: str, context: NegotiationContext):
    """Process negotiation context and generate strategic analysis"""
    try:
        ai_engine = app.state.ai_engine

        # Analyze strategy
        analysis = await ai_engine.analyze_strategy(context)

        # Store in session
        sessions[session_id] = {
            "context": context.model_dump(),
            "analysis": analysis.model_dump(),
            "auto_pilot": AutoPilotConfig(session_id=session_id).model_dump()
        }

        return {
            "status": "success",
            "session_id": session_id,
            "analysis": analysis.model_dump()
        }
    except Exception as e:
        logger.error(f"Error processing brief: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    return sessions[session_id]


@app.post("/api/session/{session_id}/autopilot")
async def configure_autopilot(session_id: str, config: AutoPilotConfig):
    """Configure auto-pilot mode for session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    sessions[session_id]["auto_pilot"] = config.model_dump()

    return {
        "status": "success",
        "message": "Auto-pilot configured",
        "config": config.model_dump()
    }


@app.websocket("/ws/live/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handle live negotiation WebSocket connection"""
    await connection_manager.connect(session_id, websocket)

    try:
        # Send welcome message
        await connection_manager.send_message(session_id, {
            "type": "status",
            "data": {"message": "Connected to NegotiAI Coach", "session_id": session_id},
            "session_id": session_id
        })

        # Get session context
        session_data = sessions.get(session_id, {})

        while True:
            # Receive audio chunk or message
            try:
                data = await websocket.receive()

                if "bytes" in data:
                    # Audio chunk
                    audio_chunk = data["bytes"]
                    await handle_audio_chunk(session_id, audio_chunk)

                elif "text" in data:
                    # Control message
                    message = json.loads(data["text"])
                    await handle_control_message(session_id, message)

            except Exception as e:
                logger.error(f"Error processing websocket data: {e}")
                await connection_manager.send_message(session_id, {
                    "type": "alert",
                    "data": {"error": str(e)},
                    "session_id": session_id
                })

    except WebSocketDisconnect:
        connection_manager.disconnect(session_id)
        logger.info(f"WebSocket disconnected for session {session_id}")


async def handle_audio_chunk(session_id: str, audio_data: bytes):
    """Process audio chunk and generate suggestions"""
    try:
        from backend.audio.processor import AudioProcessor

        # Process audio
        audio_processor = AudioProcessor()
        analysis = await audio_processor.process_chunk(audio_data, session_id)

        # Send transcript
        await connection_manager.send_message(session_id, {
            "type": "transcript",
            "data": analysis.model_dump(),
            "session_id": session_id
        })

        # Generate suggestion
        ai_engine = app.state.ai_engine
        suggestion = await ai_engine.analyze_and_suggest(analysis)

        # Send suggestion
        await connection_manager.send_message(session_id, {
            "type": "suggestion",
            "data": suggestion.model_dump(),
            "session_id": session_id
        })

        # Check auto-pilot
        session_data = sessions.get(session_id, {})
        auto_pilot_config = session_data.get("auto_pilot", {})

        if auto_pilot_config.get("enabled"):
            from backend.ai.autopilot import AutoPilot

            auto_pilot = AutoPilot(auto_pilot_config)
            if auto_pilot.should_activate(analysis):
                response = await auto_pilot.generate_response(analysis, suggestion)

                await connection_manager.send_message(session_id, {
                    "type": "auto_pilot",
                    "data": response,
                    "session_id": session_id
                })

    except Exception as e:
        logger.error(f"Error handling audio chunk: {e}")
        raise


async def handle_control_message(session_id: str, message: dict):
    """Handle control messages from client"""
    msg_type = message.get("type")

    if msg_type == "auto_pilot":
        action = message.get("action")

        if action == "activate":
            sessions[session_id]["auto_pilot"]["enabled"] = True
            await connection_manager.send_message(session_id, {
                "type": "status",
                "data": {"message": "Auto-pilot activated"},
                "session_id": session_id
            })

        elif action == "deactivate":
            sessions[session_id]["auto_pilot"]["enabled"] = False
            await connection_manager.send_message(session_id, {
                "type": "status",
                "data": {"message": "Auto-pilot deactivated"},
                "session_id": session_id
            })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
