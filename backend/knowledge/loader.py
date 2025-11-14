import json
import asyncio
import logging
from pathlib import Path
from typing import Dict
import uuid

from backend.knowledge.vector_store import VectorStore
from backend.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def load_negotiation_knowledge():
    """Load negotiation knowledge base into vector store"""
    logger.info("Loading negotiation knowledge base...")

    # Initialize vector store
    vector_store = VectorStore()
    await vector_store.initialize()

    if not vector_store.client:
        logger.error("Vector store not available - cannot load knowledge")
        return

    # Load knowledge database
    db_path = Path(__file__).parent / "negotiation_db.json"

    with open(db_path, 'r', encoding='utf-8') as f:
        knowledge_db = json.load(f)

    # Load frameworks
    frameworks = knowledge_db.get("frameworks", {})
    for framework_id, framework in frameworks.items():
        knowledge_id = f"framework_{framework_id}"
        content = f"{framework['name']}: {json.dumps(framework)}"

        await vector_store.add_knowledge(
            knowledge_id=knowledge_id,
            content=content,
            category="framework",
            metadata={"framework_id": framework_id}
        )
        logger.info(f"Loaded framework: {framework['name']}")

    # Load critical patterns
    patterns = knowledge_db.get("critical_patterns", {})
    for pattern_type, pattern_list in patterns.items():
        for pattern in pattern_list:
            knowledge_id = f"pattern_{pattern['id']}"
            content = f"{pattern['name']}: {pattern.get('description', '')} Counter: {pattern.get('counter', '')}"

            await vector_store.add_knowledge(
                knowledge_id=knowledge_id,
                content=content,
                category="pattern",
                metadata={
                    "pattern_id": pattern["id"],
                    "pattern_type": pattern_type,
                    "pattern_data": pattern
                }
            )
            logger.info(f"Loaded pattern: {pattern['name']}")

    # Load closing techniques
    closing = knowledge_db.get("closing_techniques", [])
    for technique in closing:
        knowledge_id = f"closing_{technique['id']}"
        content = f"{technique['name']}: {technique['description']} Example: {technique.get('example', '')}"

        await vector_store.add_knowledge(
            knowledge_id=knowledge_id,
            content=content,
            category="closing",
            metadata={"technique_id": technique["id"], "technique_data": technique}
        )
        logger.info(f"Loaded closing technique: {technique['name']}")

    logger.info("✅ Negotiation knowledge base loaded successfully")


async def main():
    """Main entry point for loading knowledge"""
    await load_negotiation_knowledge()


if __name__ == "__main__":
    asyncio.run(main())
