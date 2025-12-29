"""
Eigensparse - Consent Management System API
DPDP Act & GDPR Compliant Consent Management Platform

Main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, fiduciary, purposes, consents, audit, sdk, dashboard

# Create FastAPI application
app = FastAPI(
    title=f"{settings.APP_NAME} - Consent Management System",
    description="DPDP & GDPR Compliant Consent Management Platform",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware - Allow production and local origins
cors_origins = [
    "https://eigensparse.com",
    "https://www.eigensparse.com",
] + settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(fiduciary.router)
app.include_router(purposes.router)
app.include_router(consents.router)
app.include_router(audit.router)
app.include_router(sdk.router)
app.include_router(dashboard.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
