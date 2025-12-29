"""
Eigensparse - Consent Management System API
DPDP Act & GDPR Compliant Consent Management Platform

Main application entry point.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from app.config import settings
from app.database import init_db, get_db
from app.routers import auth, fiduciary, purposes, consents, audit, sdk, dashboard, webhooks
from app.routers import settings as settings_router
from sqlalchemy import text

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS Protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (disable unnecessary features)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # HSTS - Force HTTPS (only in production)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


# Request Logging Middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time

        # Log request details (skip health checks to reduce noise)
        if not request.url.path.startswith("/health"):
            logger.info(
                f"{request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.3f}s - "
                f"Client: {request.client.host if request.client else 'unknown'}"
            )

        # Add processing time header
        response.headers["X-Process-Time"] = f"{process_time:.3f}"

        return response

# Create FastAPI application
app = FastAPI(
    title=f"{settings.APP_NAME} - Consent Management System",
    description="DPDP & GDPR Compliant Consent Management Platform",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware - Allow production and local origins
cors_origins = [
    "https://eigensparse.com",
    "https://www.eigensparse.com",
] + settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key", "Accept"],
)

# Include routers
app.include_router(auth.router)
app.include_router(fiduciary.router)
app.include_router(purposes.router)
app.include_router(consents.router)
app.include_router(audit.router)
app.include_router(sdk.router)
app.include_router(dashboard.router)
app.include_router(webhooks.router)
app.include_router(settings_router.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


# ========== Health Check Endpoints ==========

@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check - returns OK if API is running"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/health/live", tags=["Health"])
async def liveness_check():
    """Liveness probe - checks if the application is running"""
    return {"status": "alive"}


@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """Readiness probe - checks if the application can serve requests"""
    try:
        # Check database connection
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )

    return {
        "status": "ready",
        "database": db_status,
        "service": settings.APP_NAME
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
