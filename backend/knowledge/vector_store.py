import logging
from typing import List, Dict, Optional
import asyncio
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from backend.config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    """Vector database operations using Qdrant"""

    def __init__(self):
        self.client = None
        self.initialized = False

    async def initialize(self):
        """Initialize Qdrant client and collections"""
        try:
            # Initialize client
            if settings.qdrant_api_key:
                self.client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key
                )
            else:
                # Local Qdrant instance
                self.client = QdrantClient(url=settings.qdrant_url)

            # Create collections if they don't exist
            await self._create_collections()

            self.initialized = True
            logger.info("Qdrant vector store initialized")

        except Exception as e:
            logger.error(f"Failed to initialize Qdrant: {e}")
            logger.warning("Running in mock mode without vector store")
            self.client = None

    async def _create_collections(self):
        """Create required collections"""
        collections = [
            settings.qdrant_collection_context,
            settings.qdrant_collection_knowledge
        ]

        for collection_name in collections:
            try:
                # Check if collection exists
                collections_list = self.client.get_collections()
                exists = any(c.name == collection_name for c in collections_list.collections)

                if not exists:
                    self.client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(
                            size=settings.vector_size,
                            distance=Distance.COSINE
                        )
                    )
                    logger.info(f"Created collection: {collection_name}")
            except Exception as e:
                logger.error(f"Error creating collection {collection_name}: {e}")

    async def add_context(self, session_id: str, content: str, metadata: Optional[Dict] = None):
        """Add context document to vector store"""
        if not self.client:
            logger.warning("Vector store not available")
            return

        try:
            # Would use Mistral embeddings here
            # For now, using mock vector
            vector = [0.1] * settings.vector_size

            point = PointStruct(
                id=session_id,
                vector=vector,
                payload={
                    "session_id": session_id,
                    "content": content,
                    "metadata": metadata or {}
                }
            )

            self.client.upsert(
                collection_name=settings.qdrant_collection_context,
                points=[point]
            )

            logger.info(f"Added context for session {session_id}")

        except Exception as e:
            logger.error(f"Error adding context: {e}")

    async def search_context(self, session_id: str, query_vector: List[float], limit: int = 5) -> List[Dict]:
        """Search context for session"""
        if not self.client:
            return []

        try:
            results = self.client.search(
                collection_name=settings.qdrant_collection_context,
                query_vector=query_vector,
                query_filter={
                    "must": [
                        {"key": "session_id", "match": {"value": session_id}}
                    ]
                },
                limit=limit
            )

            return [
                {
                    "content": hit.payload.get("content"),
                    "metadata": hit.payload.get("metadata"),
                    "score": hit.score
                }
                for hit in results
            ]

        except Exception as e:
            logger.error(f"Error searching context: {e}")
            return []

    async def add_knowledge(self, knowledge_id: str, content: str, category: str, metadata: Optional[Dict] = None):
        """Add knowledge to vector store"""
        if not self.client:
            logger.warning("Vector store not available")
            return

        try:
            # Would use Mistral embeddings here
            vector = [0.1] * settings.vector_size

            point = PointStruct(
                id=knowledge_id,
                vector=vector,
                payload={
                    "knowledge_id": knowledge_id,
                    "content": content,
                    "category": category,
                    "metadata": metadata or {}
                }
            )

            self.client.upsert(
                collection_name=settings.qdrant_collection_knowledge,
                points=[point]
            )

            logger.info(f"Added knowledge: {knowledge_id}")

        except Exception as e:
            logger.error(f"Error adding knowledge: {e}")

    async def search_knowledge(self, query_vector: List[float], category: Optional[str] = None, limit: int = 5) -> List[Dict]:
        """Search knowledge base"""
        if not self.client:
            return []

        try:
            query_filter = None
            if category:
                query_filter = {
                    "must": [
                        {"key": "category", "match": {"value": category}}
                    ]
                }

            results = self.client.search(
                collection_name=settings.qdrant_collection_knowledge,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=limit
            )

            return [
                {
                    "content": hit.payload.get("content"),
                    "category": hit.payload.get("category"),
                    "metadata": hit.payload.get("metadata"),
                    "score": hit.score
                }
                for hit in results
            ]

        except Exception as e:
            logger.error(f"Error searching knowledge: {e}")
            return []

    def get_client(self) -> Optional[QdrantClient]:
        """Get Qdrant client"""
        return self.client
