import logging
from typing import List, Dict, Optional
import asyncio

from backend.config import settings
from backend.models import (
    NegotiationContext, LiveAnalysis, Suggestion,
    StrategyAnalysis
)
from backend.ai.patterns import PatternMatcher

logger = logging.getLogger(__name__)


class NegotiationEngine:
    """AI engine for negotiation analysis and suggestions using Mistral"""

    def __init__(self):
        self.mistral_client = None
        self.pattern_matcher = PatternMatcher()
        self._init_mistral()

    def _init_mistral(self):
        """Initialize Mistral AI client"""
        try:
            from mistralai.client import MistralClient

            if settings.mistral_api_key:
                self.mistral_client = MistralClient(api_key=settings.mistral_api_key)
                logger.info("Mistral AI client initialized")
            else:
                logger.warning("Mistral API key not configured - using mock mode")
        except ImportError:
            logger.error("Mistral SDK not installed")
        except Exception as e:
            logger.error(f"Error initializing Mistral: {e}")

    async def analyze_strategy(self, context: NegotiationContext) -> StrategyAnalysis:
        """Analyze and challenge negotiation strategy"""
        prompt = f"""Analyze this negotiation strategy:

Objective: {context.target_outcome}
Minimum acceptable: {context.minimum_acceptable}
BATNA: {context.batna}
Initial position: {context.initial_position}
Red lines: {', '.join(context.red_lines)}

Evaluate:
1. Clarity and realism of objectives
2. Strength of BATNA
3. Potential weaknesses in approach
4. Missing elements or blind spots

Provide:
- Strengths (list)
- Weaknesses (list)
- Improvements needed (list)
- Challenge questions to test strategy (list)

Format as JSON with keys: strengths, weaknesses, improvements, challenge_questions
"""

        if not self.mistral_client:
            # Mock response for testing
            return StrategyAnalysis(
                strengths=["Clear BATNA", "Defined objectives"],
                weaknesses=["Concession strategy unclear", "Limited counterparty research"],
                improvements=[
                    "Define specific concession triggers",
                    "Research counterparty's constraints"
                ],
                challenge_questions=[
                    "What if they reject your minimum acceptable?",
                    "How will you handle aggressive anchoring?",
                    "What's your walk-away point?"
                ],
                confidence_score=0.7
            )

        try:
            response = await self._generate(prompt)
            # Parse response and create StrategyAnalysis
            # For now, using mock response
            return StrategyAnalysis(
                strengths=["Clear objectives", "Strong BATNA"],
                weaknesses=["Need more counterparty intel"],
                improvements=["Prepare for objections"],
                challenge_questions=["What's your walk-away point?"],
                confidence_score=0.75
            )
        except Exception as e:
            logger.error(f"Error analyzing strategy: {e}")
            return StrategyAnalysis()

    async def analyze_and_suggest(self, analysis: LiveAnalysis) -> Suggestion:
        """Generate tactical suggestion based on live analysis"""
        # Detect patterns
        detected_patterns = self.pattern_matcher.match(analysis.transcript)

        # Update analysis with pattern detection
        analysis.detected_patterns = [p["id"] for p in detected_patterns]
        analysis.manipulation_score = self.pattern_matcher.calculate_manipulation_score(detected_patterns)
        analysis.opportunity_score = self.pattern_matcher.calculate_opportunity_score(detected_patterns)

        # Determine suggestion type and priority
        suggestion_type, priority = self._determine_suggestion_type(analysis, detected_patterns)

        # Generate suggestion text
        suggestion_text = await self._generate_suggestion(analysis, detected_patterns)

        # Check if auto-pilot is available
        auto_pilot_available = self._is_autopilot_available(detected_patterns, analysis)

        # Generate voice script if auto-pilot available
        voice_script = None
        if auto_pilot_available:
            voice_script = self._get_autopilot_script(detected_patterns)

        return Suggestion(
            type=suggestion_type,
            priority=priority,
            text=suggestion_text,
            reasoning=self._generate_reasoning(analysis, detected_patterns),
            confidence=self._calculate_confidence(analysis, detected_patterns),
            auto_pilot_available=auto_pilot_available,
            voice_script=voice_script,
            session_id=analysis.session_id
        )

    def _determine_suggestion_type(
        self, analysis: LiveAnalysis, patterns: List[Dict]
    ) -> tuple:
        """Determine suggestion type and priority"""
        # Critical patterns
        if analysis.manipulation_score > 0.7:
            return ("warning", "critical")

        # Opportunities
        if analysis.opportunity_score > 0.6:
            return ("opportunity", "high")

        # Objections
        objections = [p for p in patterns if p["type"] == "objection"]
        if objections:
            return ("counter", "high")

        # Closing opportunities
        if "closing" in analysis.conversation_phase:
            return ("close", "medium")

        # Questions for exploration
        if "exploration" in analysis.conversation_phase:
            return ("question", "medium")

        return ("counter", "low")

    async def _generate_suggestion(
        self, analysis: LiveAnalysis, patterns: List[Dict]
    ) -> str:
        """Generate suggestion text using Mistral"""
        # Get relevant patterns
        pattern_info = "\n".join([
            f"- {p['name']}: {p.get('description', '')}"
            for p in patterns[:3]
        ])

        prompt = f"""Current negotiation situation:

Statement: "{analysis.transcript}"
Emotion: {analysis.emotion}
Confidence: {analysis.confidence_level}
Phase: {analysis.conversation_phase}

Detected patterns:
{pattern_info if pattern_info else "None"}

Generate ONE clear, actionable tactical suggestion for the negotiator.
The suggestion should:
1. Address detected patterns if any
2. Maintain strategic position
3. Move toward positive outcome
4. Be specific and immediately usable

Response (one sentence):"""

        if not self.mistral_client:
            # Use pattern templates if available
            if patterns:
                pattern = patterns[0]
                return pattern.get("response_template", "Stay calm and maintain your position.")

            return "Listen actively and ask calibrated questions to understand their interests."

        try:
            response = await self._generate(prompt)
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating suggestion: {e}")
            return "Maintain your position and seek to understand their underlying interests."

    def _generate_reasoning(self, analysis: LiveAnalysis, patterns: List[Dict]) -> str:
        """Generate reasoning for suggestion"""
        reasons = []

        if analysis.manipulation_score > 0.5:
            reasons.append("Manipulation tactic detected")

        if analysis.opportunity_score > 0.5:
            reasons.append("Opportunity to advance")

        if analysis.hesitation_markers:
            reasons.append("Counterparty showing hesitation")

        if patterns:
            reasons.append(f"Pattern: {patterns[0]['name']}")

        if not reasons:
            reasons.append("Strategic positioning")

        return "; ".join(reasons)

    def _calculate_confidence(self, analysis: LiveAnalysis, patterns: List[Dict]) -> float:
        """Calculate confidence in suggestion"""
        base_confidence = 0.7

        # Higher confidence with clear patterns
        if patterns:
            base_confidence += 0.15

        # Higher confidence with strong signals
        if analysis.manipulation_score > 0.7 or analysis.opportunity_score > 0.7:
            base_confidence += 0.10

        return min(base_confidence, 0.95)

    def _is_autopilot_available(self, patterns: List[Dict], analysis: LiveAnalysis) -> bool:
        """Check if auto-pilot can handle this situation"""
        # Auto-pilot available for known patterns with scripts
        for pattern in patterns:
            if pattern.get("auto_pilot_script"):
                return True

        # Auto-pilot for high manipulation
        if analysis.manipulation_score > 0.8:
            return True

        # Auto-pilot for stalemate
        if analysis.stalemate_risk > 0.7:
            return True

        return False

    def _get_autopilot_script(self, patterns: List[Dict]) -> Optional[str]:
        """Get auto-pilot script from patterns"""
        for pattern in patterns:
            script = pattern.get("auto_pilot_script")
            if script:
                return script
        return None

    async def _generate(self, prompt: str) -> str:
        """Generate text using Mistral"""
        if not self.mistral_client:
            return "Mock response"

        try:
            # Note: Actual Mistral API call would be:
            # response = await self.mistral_client.chat(
            #     model=settings.mistral_model,
            #     messages=[{"role": "user", "content": prompt}]
            # )
            # return response.choices[0].message.content

            # Mock for now
            await asyncio.sleep(0.1)
            return "Stay calm and ask clarifying questions."
        except Exception as e:
            logger.error(f"Mistral generation error: {e}")
            return ""

    async def embed(self, text: str) -> List[float]:
        """Generate embeddings using Mistral"""
        if not self.mistral_client:
            # Mock embedding
            return [0.1] * settings.vector_size

        try:
            # Note: Actual Mistral embedding call
            # response = await self.mistral_client.embeddings(
            #     model=settings.embedding_model,
            #     input=[text]
            # )
            # return response.data[0].embedding

            # Mock for now
            return [0.1] * settings.vector_size
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return [0.1] * settings.vector_size
