from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API Keys
    elevenlabs_api_key: str = ""
    mistral_api_key: str = ""
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    google_cloud_key: str = ""
    n8n_webhook_url: str = "http://localhost:5678/webhook"
    lovable_project_id: str = ""
    fal_api_key: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Audio
    audio_chunk_size: int = 250  # milliseconds
    audio_sample_rate: int = 16000

    # AI
    mistral_model: str = "mistral-large-latest"
    embedding_model: str = "mistral-embed"

    # Vector Store
    qdrant_collection_context: str = "negotiation_context"
    qdrant_collection_knowledge: str = "negotiation_knowledge"
    vector_size: int = 1024

    # Performance
    suggestion_timeout: float = 2.0  # seconds
    transcription_timeout: float = 0.5

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
