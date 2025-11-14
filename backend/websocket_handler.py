from fastapi import WebSocket
from typing import Dict
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for live sessions"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected: {session_id}")

    async def send_message(self, session_id: str, message: dict):
        """Send message to specific session"""
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]

            # Add timestamp if not present
            if "timestamp" not in message:
                message["timestamp"] = datetime.now().isoformat()

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected sessions"""
        for session_id in list(self.active_connections.keys()):
            await self.send_message(session_id, message)

    def get_connection(self, session_id: str) -> WebSocket:
        """Get WebSocket connection for session"""
        return self.active_connections.get(session_id)

    def is_connected(self, session_id: str) -> bool:
        """Check if session is connected"""
        return session_id in self.active_connections
