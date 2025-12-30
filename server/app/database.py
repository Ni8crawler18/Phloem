"""
Database Configuration
PostgreSQL connection with SQLAlchemy
"""
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Database session dependency.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Called on application startup.
    """
    # Import all models to ensure they're registered
    from app.models import User, DataFiduciary, Purpose, Consent, ConsentReceipt, AuditLog

    Base.metadata.create_all(bind=engine)


def safe_commit(db: Session, operation: str = "database operation") -> bool:
    """
    Safely commit database transaction with rollback on failure.

    Args:
        db: SQLAlchemy session
        operation: Description of the operation for logging

    Returns:
        True if commit succeeded, raises HTTPException on failure
    """
    from fastapi import HTTPException

    try:
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during {operation}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error occurred. Please try again."
        )


@contextmanager
def atomic_transaction(db: Session):
    """
    Context manager for atomic database transactions.
    Automatically commits on success or rolls back on failure.

    Usage:
        with atomic_transaction(db):
            db.add(model)
            # auto-commits if no exception
    """
    try:
        yield db
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Transaction rolled back: {str(e)}")
        raise
    except Exception as e:
        db.rollback()
        raise
