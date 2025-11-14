#!/usr/bin/env python3
"""
Demo scenario runner for NegotiAI Coach
Simulates a negotiation with predefined events and tests AI responses
"""

import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime
import logging

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.models import NegotiationContext, LiveAnalysis
from backend.ai.engine import NegotiationEngine
from backend.ai.patterns import PatternMatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScenarioRunner:
    """Run demo negotiation scenario"""

    def __init__(self, scenario_path: str):
        with open(scenario_path, 'r') as f:
            self.scenario = json.load(f)

        self.ai_engine = NegotiationEngine()
        self.pattern_matcher = PatternMatcher()
        self.results = []

    async def run(self):
        """Execute the scenario"""
        logger.info(f"Starting scenario: {self.scenario['scenario']['name']}")

        # Setup context
        context = self._create_context()
        logger.info(f"Objective: {context.target_outcome}")
        logger.info(f"BATNA: {context.batna}")

        # Run timeline events
        for event in self.scenario['timeline']:
            await self._process_event(event)

        # Show results
        self._show_results()

    def _create_context(self) -> NegotiationContext:
        """Create negotiation context from scenario"""
        negotiator = self.scenario['negotiator']

        return NegotiationContext(
            target_outcome=negotiator['objectives']['target_outcome'],
            minimum_acceptable=negotiator['objectives']['minimum_acceptable'],
            batna=negotiator['objectives']['batna'],
            red_lines=negotiator['constraints']['red_lines'],
            initial_position=f"We recommend {negotiator['objectives']['target_outcome']}",
            counterparty_info={'company': self.scenario['counterparty']['company']},
            expected_tactics=self.scenario['counterparty']['tactics'],
            relevant_patterns=[],
            prepared_responses={}
        )

    async def _process_event(self, event: dict):
        """Process a timeline event"""
        logger.info(f"\n{'='*60}")
        logger.info(f"[{event['time']}] {event['phase'].upper()}: {event['event']}")

        # Get test phrase if pattern exists
        pattern = event.get('pattern')
        if pattern:
            test_phrase = self._get_test_phrase(pattern)
            if test_phrase:
                logger.info(f"Counterparty: \"{test_phrase}\"")

                # Create analysis
                analysis = LiveAnalysis(
                    transcript=test_phrase,
                    timestamp=datetime.now().timestamp(),
                    speaker="counterparty",
                    emotion="neutral",
                    confidence_level=0.7,
                    hesitation_markers=[],
                    detected_patterns=[],
                    conversation_phase=event['phase'],
                    stalemate_risk=0.7 if pattern == "stalemate" else 0.0,
                    session_id="demo_session"
                )

                # Get AI suggestion
                suggestion = await self.ai_engine.analyze_and_suggest(analysis)

                logger.info(f"\n🤖 AI SUGGESTION:")
                logger.info(f"   Type: {suggestion.type}")
                logger.info(f"   Priority: {suggestion.priority}")
                logger.info(f"   Text: {suggestion.text}")
                logger.info(f"   Reasoning: {suggestion.reasoning}")
                logger.info(f"   Confidence: {suggestion.confidence:.0%}")

                if suggestion.auto_pilot_available:
                    logger.info(f"   🚀 AUTO-PILOT: {suggestion.voice_script}")

                # Compare with optimal response
                if 'optimal_response' in event:
                    logger.info(f"\n✅ OPTIMAL: {event['optimal_response']}")

                # Record result
                self.results.append({
                    'event': event['event'],
                    'pattern': pattern,
                    'ai_type': suggestion.type,
                    'ai_priority': suggestion.priority,
                    'ai_confidence': suggestion.confidence,
                    'autopilot': suggestion.auto_pilot_available
                })

        await asyncio.sleep(0.5)  # Simulate time passing

    def _get_test_phrase(self, pattern: str) -> str:
        """Get test phrase for pattern"""
        test_phrases = self.scenario.get('test_phrases', {})

        phrase_map = {
            'anchoring': test_phrases.get('manipulation_detection', [])[1] if len(test_phrases.get('manipulation_detection', [])) > 1 else None,
            'false_urgency': test_phrases.get('manipulation_detection', [])[0] if test_phrases.get('manipulation_detection') else None,
            'price_objection': test_phrases.get('objection_patterns', [])[0] if test_phrases.get('objection_patterns') else None,
            'hesitation': test_phrases.get('opportunity_detection', [])[0] if test_phrases.get('opportunity_detection') else None,
            'stalemate': "Non, je ne peux vraiment pas aller au-delà de 30K.",
            'nibbling': test_phrases.get('manipulation_detection', [])[3] if len(test_phrases.get('manipulation_detection', [])) > 3 else None
        }

        return phrase_map.get(pattern, "")

    def _show_results(self):
        """Display scenario results"""
        logger.info(f"\n{'='*60}")
        logger.info("SCENARIO RESULTS")
        logger.info(f"{'='*60}")

        if not self.results:
            logger.info("No events processed")
            return

        # Statistics
        total_events = len(self.results)
        autopilot_count = sum(1 for r in self.results if r['autopilot'])
        avg_confidence = sum(r['ai_confidence'] for r in self.results) / total_events

        logger.info(f"Total events: {total_events}")
        logger.info(f"Auto-pilot available: {autopilot_count} ({autopilot_count/total_events:.0%})")
        logger.info(f"Average confidence: {avg_confidence:.0%}")

        # Pattern distribution
        patterns = {}
        for r in self.results:
            pattern = r['pattern']
            patterns[pattern] = patterns.get(pattern, 0) + 1

        logger.info(f"\nPattern detection:")
        for pattern, count in patterns.items():
            logger.info(f"  - {pattern}: {count}")

        # Success criteria check
        success = self.scenario.get('success_criteria', {})
        logger.info(f"\nSuccess criteria:")
        logger.info(f"  Target ARR: {success['target']['arr_value']} EUR")
        logger.info(f"  Pattern detection: {len(self.results)} patterns detected")
        logger.info(f"  AI accuracy: {avg_confidence:.0%} (target: 80%+)")


async def main():
    """Main entry point"""
    scenario_path = Path(__file__).parent / "scenario.json"

    if not scenario_path.exists():
        logger.error(f"Scenario file not found: {scenario_path}")
        return

    runner = ScenarioRunner(str(scenario_path))
    await runner.run()


if __name__ == "__main__":
    asyncio.run(main())
