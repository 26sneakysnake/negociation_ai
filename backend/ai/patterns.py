import re
from typing import List, Dict, Optional
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class PatternMatcher:
    """Detect negotiation patterns and tactics in conversation"""

    def __init__(self):
        self.patterns = self._load_patterns()

    def _load_patterns(self) -> Dict:
        """Load patterns from knowledge database"""
        db_path = Path(__file__).parent.parent / "knowledge" / "negotiation_db.json"

        try:
            with open(db_path, 'r', encoding='utf-8') as f:
                knowledge = json.load(f)
            return knowledge.get("critical_patterns", {})
        except Exception as e:
            logger.error(f"Error loading patterns: {e}")
            return {}

    def match(self, transcript: str) -> List[Dict]:
        """Match patterns in transcript"""
        detected = []
        transcript_lower = transcript.lower()

        # Check manipulation patterns
        for pattern in self.patterns.get("manipulation", []):
            if self._match_pattern(transcript_lower, pattern):
                detected.append({
                    "id": pattern["id"],
                    "name": pattern["name"],
                    "type": "manipulation",
                    "description": pattern.get("description", ""),
                    "counter": pattern.get("counter", ""),
                    "response_template": pattern.get("response_template", ""),
                    "auto_pilot_script": pattern.get("auto_pilot_script", "")
                })

        # Check objection patterns
        for objection in self.patterns.get("objections", []):
            if self._match_triggers(transcript_lower, objection.get("triggers", [])):
                detected.append({
                    "id": objection["id"],
                    "name": objection["id"].replace("_", " ").title(),
                    "type": "objection",
                    "objection_type": objection.get("type", ""),
                    "counters": objection.get("counters", [])
                })

        # Check opportunity patterns
        for opportunity in self.patterns.get("opportunities", []):
            if self._match_triggers(transcript_lower, opportunity.get("markers", [])):
                detected.append({
                    "id": opportunity["id"],
                    "name": opportunity["id"].replace("_", " ").title(),
                    "type": "opportunity",
                    "description": opportunity.get("description", ""),
                    "action": opportunity.get("action", ""),
                    "tactics": opportunity.get("tactics", []),
                    "response_template": opportunity.get("response_template", ""),
                    "auto_pilot_script": opportunity.get("auto_pilot_script", "")
                })

        return detected

    def _match_pattern(self, text: str, pattern: Dict) -> bool:
        """Check if pattern matches text"""
        # Check keywords
        keywords = pattern.get("keywords", [])
        if keywords and any(kw.lower() in text for kw in keywords):
            return True

        # Check regex pattern
        pattern_regex = pattern.get("pattern", "")
        if pattern_regex:
            try:
                if re.search(pattern_regex, text, re.IGNORECASE):
                    return True
            except re.error:
                pass

        # Check indicators
        indicators = pattern.get("indicators", [])
        if indicators and any(ind.lower() in text for ind in indicators):
            return True

        return False

    def _match_triggers(self, text: str, triggers: List[str]) -> bool:
        """Check if any trigger matches text"""
        return any(trigger.lower() in text for trigger in triggers)

    def calculate_manipulation_score(self, detected_patterns: List[Dict]) -> float:
        """Calculate manipulation likelihood score"""
        manipulation_patterns = [p for p in detected_patterns if p["type"] == "manipulation"]

        if not manipulation_patterns:
            return 0.0

        # Base score on number and severity
        base_score = min(len(manipulation_patterns) * 0.3, 1.0)

        # High severity patterns
        high_severity = ["false_urgency", "good_cop_bad_cop", "nibbling"]
        has_severe = any(p["id"] in high_severity for p in manipulation_patterns)

        if has_severe:
            base_score = min(base_score + 0.3, 1.0)

        return base_score

    def calculate_opportunity_score(self, detected_patterns: List[Dict]) -> float:
        """Calculate opportunity likelihood score"""
        opportunity_patterns = [p for p in detected_patterns if p["type"] == "opportunity"]

        if not opportunity_patterns:
            return 0.0

        # Higher score for stronger opportunities
        strong_opportunities = ["budget_available", "pain_point_mentioned"]
        has_strong = any(p["id"] in strong_opportunities for p in opportunity_patterns)

        base_score = min(len(opportunity_patterns) * 0.25, 1.0)

        if has_strong:
            base_score = min(base_score + 0.3, 1.0)

        return base_score

    def detect_stalemate(self, conversation_history: List[str]) -> float:
        """Detect stalemate risk from conversation history"""
        if len(conversation_history) < 3:
            return 0.0

        # Check for repetition
        recent = conversation_history[-6:]  # Last 6 messages

        # Simple repetition detection
        unique_messages = len(set(recent))
        repetition_ratio = 1.0 - (unique_messages / len(recent))

        # Check for stalemate keywords
        stalemate_keywords = ["non", "impossible", "je ne peux pas", "c'est ma limite"]
        stalemate_count = sum(
            1 for msg in recent
            if any(kw in msg.lower() for kw in stalemate_keywords)
        )

        stalemate_score = min(repetition_ratio + (stalemate_count * 0.15), 1.0)

        return stalemate_score

    def get_pattern_by_id(self, pattern_id: str) -> Optional[Dict]:
        """Get pattern details by ID"""
        for category in self.patterns.values():
            if isinstance(category, list):
                for pattern in category:
                    if pattern.get("id") == pattern_id:
                        return pattern
        return None
