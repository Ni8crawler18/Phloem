"""
Application Configuration
Environment-based settings for Eigensparse
"""
import os
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/eigensparse"

    # Security
    SECRET_KEY: str = "change-this-in-production-min-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  
    # CORS
    CORS_ORIGINS: str = '["http://localhost:5173", "http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string or comma-separated"""
        try:
            # Try JSON first
            return json.loads(self.CORS_ORIGINS)
        except json.JSONDecodeError:
            # Fall back to comma-separated
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # App Info
    APP_NAME: str = "Eigensparse"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global settings instance
settings = Settings()