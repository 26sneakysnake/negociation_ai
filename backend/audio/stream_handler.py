import asyncio
from typing import AsyncGenerator, Callable
import logging

logger = logging.getLogger(__name__)


class AudioStreamHandler:
    """Handle streaming audio data"""

    def __init__(self, chunk_size: int = 250):
        self.chunk_size = chunk_size  # milliseconds
        self.callbacks = []

    def register_callback(self, callback: Callable):
        """Register callback for audio chunks"""
        self.callbacks.append(callback)

    async def process_stream(self, audio_stream: AsyncGenerator[bytes, None]):
        """Process streaming audio data"""
        try:
            async for chunk in audio_stream:
                # Call all registered callbacks
                for callback in self.callbacks:
                    try:
                        await callback(chunk)
                    except Exception as e:
                        logger.error(f"Error in audio callback: {e}")
        except Exception as e:
            logger.error(f"Error processing audio stream: {e}")

    async def chunk_audio(self, audio_data: bytes, chunk_size_bytes: int = 4096) -> AsyncGenerator[bytes, None]:
        """Split audio data into chunks"""
        for i in range(0, len(audio_data), chunk_size_bytes):
            chunk = audio_data[i:i + chunk_size_bytes]
            yield chunk
            await asyncio.sleep(0.01)  # Simulate streaming delay
