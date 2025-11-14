import logging
from typing import Dict, Optional
import asyncio

from backend.models import LiveAnalysis, Suggestion
from backend.config import settings

logger = logging.getLogger(__name__)


class AutoPilot:
    """Auto-pilot mode for automated negotiation responses"""

    def __init__(self, config: Dict):
        self.enabled = config.get("enabled", False)
        self.boundaries = config.get("boundaries", {})
        self.voice_profile = config.get("voice_profile", "")
        self.activation_triggers = config.get("activation_triggers", [])
        self.red_lines = self.boundaries.get("red_lines", [])

    def should_activate(self, analysis: LiveAnalysis) -> bool:
        """Determine if auto-pilot should activate"""
        if not self.enabled:
            return False

        triggers = []

        # Stalemate trigger
        if "stalemate" in self.activation_triggers:
            if analysis.stalemate_risk > 0.7:
                triggers.append("stalemate")

        # Manipulation trigger
        if "manipulation" in self.activation_triggers:
            if analysis.manipulation_score > 0.8:
                triggers.append("manipulation")

        # Aggression trigger
        if "aggression" in self.activation_triggers:
            if analysis.emotion == "aggressive":
                triggers.append("aggression")

        # Critical patterns
        critical_patterns = [
            "false_urgency",
            "good_cop_bad_cop",
            "nibbling"
        ]
        if any(pattern in analysis.detected_patterns for pattern in critical_patterns):
            triggers.append("critical_pattern")

        logger.info(f"Auto-pilot triggers: {triggers}")
        return len(triggers) > 0

    async def generate_response(
        self, analysis: LiveAnalysis, suggestion: Suggestion
    ) -> Dict:
        """Generate automated response"""
        logger.info("Auto-pilot generating response")

        # Get voice script
        script = suggestion.voice_script or await self._generate_script(analysis, suggestion)

        # Validate against red lines
        if self._violates_red_lines(script):
            logger.warning("Auto-pilot script violates red lines - aborting")
            return {
                "status": "aborted",
                "reason": "Script violates red lines",
                "script": None
            }

        # Generate audio
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "script": script,
            "audio": audio,
            "reasoning": suggestion.reasoning,
            "confidence": suggestion.confidence
        }

    async def execute_tactic(self, tactic: str, context: Dict) -> Dict:
        """Execute specific auto-pilot tactic"""
        tactics = {
            "stall": self._stall_conversation,
            "firm_no": self._deliver_rejection,
            "counter_anchor": self._aggressive_counter,
            "walk_away": self._threaten_exit,
            "call_bluff": self._call_bluff,
            "reframe": self._reframe_discussion
        }

        if tactic not in tactics:
            logger.error(f"Unknown tactic: {tactic}")
            return {"status": "error", "message": "Unknown tactic"}

        return await tactics[tactic](context)

    async def _stall_conversation(self, context: Dict) -> Dict:
        """Stall to buy time"""
        scripts = [
            "C'est une proposition intéressante. Laissez-moi prendre un moment pour bien analyser tous les aspects.",
            "Je veux m'assurer de bien comprendre toutes les implications. Pouvons-nous revenir sur certains détails ?",
            "Avant de continuer, récapitulons où nous en sommes sur les points principaux."
        ]

        script = scripts[0]  # Could randomize
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "stall",
            "script": script,
            "audio": audio
        }

    async def _deliver_rejection(self, context: Dict) -> Dict:
        """Deliver firm rejection"""
        script = "Je comprends votre position, mais ce point est non-négociable pour nous. Explorons d'autres options."
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "firm_no",
            "script": script,
            "audio": audio
        }

    async def _aggressive_counter(self, context: Dict) -> Dict:
        """Counter with aggressive anchor"""
        script = "Laissez-moi vous présenter notre vision de la valeur pour ce projet."
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "counter_anchor",
            "script": script,
            "audio": audio
        }

    async def _threaten_exit(self, context: Dict) -> Dict:
        """Credible walk-away threat"""
        script = "Si nous ne pouvons pas trouver un terrain d'entente, je pense qu'il est préférable d'explorer d'autres options."
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "walk_away",
            "script": script,
            "audio": audio
        }

    async def _call_bluff(self, context: Dict) -> Dict:
        """Call out bluff professionally"""
        script = "Je comprends la contrainte de temps, mais je préfère prendre le temps nécessaire pour une décision réfléchie."
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "call_bluff",
            "script": script,
            "audio": audio
        }

    async def _reframe_discussion(self, context: Dict) -> Dict:
        """Reframe the conversation"""
        script = "Prenons du recul. Quel est l'objectif principal que nous cherchons tous les deux à atteindre ?"
        audio = await self._synthesize_voice(script)

        return {
            "status": "ready",
            "tactic": "reframe",
            "script": script,
            "audio": audio
        }

    async def _generate_script(self, analysis: LiveAnalysis, suggestion: Suggestion) -> str:
        """Generate script if not provided"""
        # Use suggestion text as fallback
        return suggestion.text

    async def _synthesize_voice(self, script: str) -> bytes:
        """Synthesize voice using ElevenLabs"""
        try:
            from backend.audio.processor import AudioProcessor

            audio_processor = AudioProcessor()
            audio = await audio_processor.synthesize_speech(
                text=script,
                voice_id=self.voice_profile,
                emotion="confident"
            )
            return audio
        except Exception as e:
            logger.error(f"Voice synthesis error: {e}")
            return b""

    def _violates_red_lines(self, script: str) -> bool:
        """Check if script violates red lines"""
        script_lower = script.lower()

        for red_line in self.red_lines:
            red_line_lower = red_line.lower()

            # Check for direct mentions
            if red_line_lower in script_lower:
                logger.warning(f"Script mentions red line: {red_line}")
                return True

            # Check for concession keywords
            concession_keywords = [
                "accepte", "d'accord pour", "oui à", "ok pour"
            ]
            if any(
                keyword in script_lower and red_line_lower in script_lower
                for keyword in concession_keywords
            ):
                return True

        return False
