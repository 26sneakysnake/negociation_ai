from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Tuple, Dict
from datetime import datetime


class NegotiationContext(BaseModel):
    """Context for a negotiation session"""
    # Objectives
    target_outcome: str = Field(..., description="Desired outcome")
    minimum_acceptable: str = Field(..., description="Minimum acceptable outcome")
    red_lines: List[str] = Field(default_factory=list, description="Non-negotiable limits")

    # Strategy
    batna: str = Field(..., description="Best Alternative To Negotiated Agreement")
    zopa: Optional[Tuple[float, float]] = Field(None, description="Zone Of Possible Agreement")
    initial_position: str = Field(..., description="Opening position")
    concession_steps: List[str] = Field(default_factory=list, description="Planned concessions")

    # Counterparty
    counterparty_info: Dict = Field(default_factory=dict, description="Info about other party")
    expected_tactics: List[str] = Field(default_factory=list, description="Expected tactics")

    # Knowledge Base
    relevant_patterns: List[str] = Field(default_factory=list, description="Relevant patterns")
    prepared_responses: Dict = Field(default_factory=dict, description="Pre-prepared responses")

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    session_id: Optional[str] = None


class LiveAnalysis(BaseModel):
    """Real-time analysis of negotiation conversation"""
    # Audio Analysis
    transcript: str = Field(..., description="Transcribed text")
    timestamp: float = Field(..., description="Unix timestamp")
    speaker: Literal["user", "counterparty"] = Field(..., description="Who is speaking")

    # Emotional Analysis
    emotion: Literal["neutral", "tense", "aggressive", "conceding", "confident"] = Field(
        default="neutral", description="Detected emotion"
    )
    confidence_level: float = Field(default=0.5, ge=0.0, le=1.0, description="Speaker confidence")
    hesitation_markers: List[str] = Field(default_factory=list, description="Hesitation indicators")

    # Pattern Detection
    detected_patterns: List[str] = Field(default_factory=list, description="Detected tactics/patterns")
    manipulation_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Manipulation likelihood")
    opportunity_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Opportunity likelihood")

    # Context
    conversation_phase: Literal["opening", "exploration", "bargaining", "closing"] = Field(
        default="opening", description="Current phase"
    )
    stalemate_risk: float = Field(default=0.0, ge=0.0, le=1.0, description="Risk of stalemate")

    # Session
    session_id: str


class Suggestion(BaseModel):
    """AI-generated suggestion for negotiator"""
    type: Literal["counter", "question", "warning", "opportunity", "close"] = Field(
        ..., description="Type of suggestion"
    )
    priority: Literal["critical", "high", "medium", "low"] = Field(
        ..., description="Priority level"
    )
    text: str = Field(..., description="The suggestion text")
    reasoning: str = Field(..., description="Why this suggestion")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    auto_pilot_available: bool = Field(default=False, description="Can be auto-executed")
    voice_script: Optional[str] = Field(None, description="Script for auto-pilot voice")

    # Metadata
    timestamp: datetime = Field(default_factory=datetime.now)
    session_id: str


class AutoPilotConfig(BaseModel):
    """Configuration for auto-pilot mode"""
    enabled: bool = Field(default=False, description="Auto-pilot active")
    boundaries: Dict = Field(default_factory=dict, description="Operational boundaries")
    voice_profile: str = Field(default="", description="Voice ID for synthesis")
    activation_triggers: List[str] = Field(
        default_factory=lambda: ["stalemate", "manipulation", "aggression"],
        description="Conditions that trigger auto-pilot"
    )
    session_id: str


class AudioChunk(BaseModel):
    """Audio data chunk"""
    data: bytes
    timestamp: float
    session_id: str
    speaker: Literal["user", "counterparty"] = "counterparty"


class StrategyAnalysis(BaseModel):
    """Analysis of negotiation strategy"""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    challenge_questions: List[str] = Field(default_factory=list)
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)


class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: Literal["suggestion", "alert", "transcript", "status", "auto_pilot"]
    data: Dict
    timestamp: datetime = Field(default_factory=datetime.now)
    session_id: str
