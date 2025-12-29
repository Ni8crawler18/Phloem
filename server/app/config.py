"""
Application Configuration
Environment-based settings for Eigensparse
"""
import os
import secrets
import warnings
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/eigensparse"

    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    @field_validator('SECRET_KEY', mode='before')
    @classmethod
    def validate_secret_key(cls, v):
        """Validate and generate secure SECRET_KEY"""
        # Check for weak/default keys
        weak_keys = [
            "change-this-in-production",
            "your-secret-key",
            "secret",
            "changeme",
            ""
        ]

        if not v or any(weak in v.lower() for weak in weak_keys):
            # In production, this should fail; in dev, generate a random key
            if os.getenv("ENV", "development").lower() == "production":
                raise ValueError(
                    "SECRET_KEY must be set to a strong random value in production. "
                    "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
                )
            else:
                # Generate a secure key for development
                generated_key = secrets.token_urlsafe(32)
                warnings.warn(
                    "Using auto-generated SECRET_KEY for development. "
                    "Set a persistent SECRET_KEY in .env for production.",
                    UserWarning
                )
                return generated_key

        # Validate key length
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")

        return v
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

    # Email SMTP Settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Eigensparse"
    SMTP_USE_TLS: bool = True

    # Frontend URL for email links
    FRONTEND_URL: str = "http://localhost:5173"

    # Token Expiration Settings
    VERIFICATION_EXPIRE_HOURS: int = 24
    RESET_EXPIRE_MINUTES: int = 30

    @property
    def email_enabled(self) -> bool:
        """Check if email is configured"""
        return bool(self.SMTP_HOST and self.SMTP_USER and self.SMTP_PASSWORD)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global settings instance
settings = Settings()