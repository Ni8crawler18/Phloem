"""
Eigensparse - Consent Management System API
DPDP Act & GDPR Compliant Consent Management Platform

Main application entry point.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db
from app.routers import auth, fiduciary, purposes, consents, audit, sdk, dashboard, webhooks
from app.routers import settings as settings_router

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
