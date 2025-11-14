import asyncio
import time
import logging
from typing import List, Optional
import io

from backend.config import settings
from backend.models import LiveAnalysis

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Process audio using ElevenLabs for transcription and emotion analysis"""

    def __init__(self):
        self.buffer = AudioBuffer(chunk_size=settings.audio_chunk_size)
        self.elevenlabs_client = None
        self._init_elevenlabs()

    def _init_elevenlabs(self):
        """Initialize ElevenLabs client"""
        try:
            from elevenlabs import ElevenLabs
            if settings.elevenlabs_api_key:
                self.elevenlabs_client = ElevenLabs(api_key=settings.elevenlabs_api_key)
                logger.info("ElevenLabs client initialized")
            else:
                logger.warning("ElevenLabs API key not configured - using mock mode")
        except ImportError:
            logger.error("ElevenLabs SDK not installed")
        except Exception as e:
            logger.error(f"Error initializing ElevenLabs: {e}")

    async def process_chunk(self, audio: bytes, session_id: str) -> LiveAnalysis:
        """Process audio chunk and return live analysis"""
        timestamp = time.time()

        # Add to buffer
        self.buffer.add(audio)

        # Transcribe
        transcript = await self._transcribe(audio)

        # Analyze emotion
        emotion = await self._analyze_emotion(audio)

        # Detect hesitation
        hesitation_markers = self._detect_hesitation(transcript, audio)

        # Determine speaker (simple heuristic for demo)
        speaker = self._detect_speaker(audio)

        return LiveAnalysis(
            transcript=transcript,
            timestamp=timestamp,
            speaker=speaker,
            emotion=emotion,
            confidence_level=self._calculate_confidence(transcript, hesitation_markers),
            hesitation_markers=hesitation_markers,
            detected_patterns=[],  # Will be filled by pattern detector
            manipulation_score=0.0,
            opportunity_score=0.0,
            conversation_phase="exploration",  # Will be determined by AI engine
            stalemate_risk=0.0,
            session_id=session_id
        )

    async def _transcribe(self, audio: bytes) -> str:
        """Transcribe audio to text"""
        if not self.elevenlabs_client:
            # Mock transcription for testing
            return "[Mock transcription - ElevenLabs not configured]"

        try:
            # Note: ElevenLabs transcription API would be used here
            # For now, using a placeholder
            # In production, use: result = await self.elevenlabs_client.transcribe(audio)
            return await self._mock_transcribe(audio)
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return ""

    async def _mock_transcribe(self, audio: bytes) -> str:
        """Mock transcription for testing"""
        # Simulate API call delay
        await asyncio.sleep(0.1)
        return "Je pense que 50K est un bon prix pour ce contrat."

    async def _analyze_emotion(self, audio: bytes) -> str:
        """Analyze emotion from audio"""
        if not self.elevenlabs_client:
            return "neutral"

        try:
            # Note: Would use ElevenLabs emotion detection API
            # For now, simple heuristic
            return "neutral"
        except Exception as e:
            logger.error(f"Emotion analysis error: {e}")
            return "neutral"

    def _detect_hesitation(self, transcript: str, audio: bytes) -> List[str]:
        """Detect hesitation markers in speech"""
        hesitation = []

        # Filler words
        fillers = ["euh", "hmm", "donc", "en fait", "peut-être", "je ne sais pas"]
        for filler in fillers:
            if filler in transcript.lower():
                hesitation.append(filler)

        # Long pauses (would analyze audio waveform in production)
        if self._detect_silence(audio, duration=2.0):
            hesitation.append("long_pause")

        return hesitation

    def _detect_silence(self, audio: bytes, duration: float) -> bool:
        """Detect silence in audio chunk"""
        # Simplified - would use audio analysis in production
        return False

    def _detect_speaker(self, audio: bytes) -> str:
        """Detect which speaker (user or counterparty)"""
        # Simplified - would use speaker diarization in production
        # For demo, assume counterparty by default
        return "counterparty"

    def _calculate_confidence(self, transcript: str, hesitation: List[str]) -> float:
        """Calculate speaker confidence level"""
        base_confidence = 0.7

        # Reduce confidence for each hesitation marker
        confidence = base_confidence - (len(hesitation) * 0.1)

        # Boost for assertive language
        assertive_words = ["certainement", "absolument", "évidemment", "clairement"]
        for word in assertive_words:
            if word in transcript.lower():
                confidence += 0.1

        return max(0.0, min(1.0, confidence))

    async def synthesize_speech(self, text: str, voice_id: str, emotion: str = "confident") -> bytes:
        """Synthesize speech from text using ElevenLabs"""
        if not self.elevenlabs_client:
            logger.warning("Cannot synthesize speech - ElevenLabs not configured")
            return b""

        try:
            # Note: Would use ElevenLabs TTS API
            # audio = await self.elevenlabs_client.text_to_speech(
            #     text=text,
            #     voice_id=voice_id,
            #     settings={"emotion": emotion}
            # )
            # return audio

            # Mock for now
            return b"mock_audio_data"
        except Exception as e:
            logger.error(f"Speech synthesis error: {e}")
            return b""


class AudioBuffer:
    """Buffer for audio chunks"""

    def __init__(self, chunk_size: int = 250):
        self.chunk_size = chunk_size  # milliseconds
        self.buffer = []

    def add(self, chunk: bytes):
        """Add audio chunk to buffer"""
        self.buffer.append(chunk)

        # Keep only last 10 seconds
        max_chunks = int(10000 / self.chunk_size)
        if len(self.buffer) > max_chunks:
            self.buffer = self.buffer[-max_chunks:]

    def get_recent(self, duration_ms: int = 1000) -> bytes:
        """Get recent audio data"""
        num_chunks = int(duration_ms / self.chunk_size)
        recent_chunks = self.buffer[-num_chunks:]
        return b"".join(recent_chunks)

    def clear(self):
        """Clear buffer"""
        self.buffer = []
