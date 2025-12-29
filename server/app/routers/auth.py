"""
Authentication Router
User and Fiduciary authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import User, DataFiduciary, AuditAction
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    FiduciaryRegister, AuthResponse, DataFiduciaryWithMaskedKey
)
from app.services.auth import (
    verify_password, get_password_hash, create_access_token, generate_api_key
)
from app.services.audit import create_audit_log
from app.dependencies.auth import get_current_user, get_current_fiduciary

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


# ========== User Authentication ==========

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register_user(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new data principal (user)"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration failed. Please try again or contact support.")

    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db, AuditAction.USER_REGISTERED, "user", user.uuid,
        user_id=user.id,
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )

    return user


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


# ========== Fiduciary Authentication ==========

@router.post("/fiduciary/register", response_model=AuthResponse)
@limiter.limit("5/minute")
def register_fiduciary(
    request: Request,
    data: FiduciaryRegister,
    db: Session = Depends(get_db)
):
    """Register a new data fiduciary (company)"""
    existing = db.query(DataFiduciary).filter(
        DataFiduciary.contact_email == data.contact_email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration failed. Please try again or contact support.")

    fiduciary = DataFiduciary(
        name=data.name,
        description=data.description,
        privacy_policy_url=data.privacy_policy_url,
        contact_email=data.contact_email,
        hashed_password=get_password_hash(data.password),
        api_key=generate_api_key()
    )
    db.add(fiduciary)
    db.commit()
    db.refresh(fiduciary)

    create_audit_log(
        db, AuditAction.USER_REGISTERED, "fiduciary", fiduciary.uuid,
        fiduciary_id=fiduciary.id,
        details={"name": fiduciary.name, "email": fiduciary.contact_email},
        ip_address=request.client.host if request.client else None
    )

    token = create_access_token({"sub": str(fiduciary.id), "role": "fiduciary"})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        role="fiduciary",
        name=fiduciary.name,
        email=fiduciary.contact_email
    )


@router.post("/fiduciary/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login_fiduciary(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    """Login as data fiduciary"""
    fiduciary = db.query(DataFiduciary).filter(
        DataFiduciary.contact_email == data.email
    ).first()

    if not fiduciary or not fiduciary.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, fiduciary.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(fiduciary.id), "role": "fiduciary"})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        role="fiduciary",
        name=fiduciary.name,
        email=fiduciary.contact_email
    )


@router.get("/fiduciary/me", response_model=DataFiduciaryWithMaskedKey)
def get_fiduciary_me(
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary)
):
    """Get current fiduciary profile with masked API key"""
    api_key = current_fiduciary.api_key or ""
    # Mask the API key: show first 8 and last 4 characters
    prefix = api_key[:8] if len(api_key) >= 8 else api_key
    suffix = api_key[-4:] if len(api_key) >= 4 else ""
    hint = f"{prefix}****{suffix}" if len(api_key) > 12 else "****"

    return DataFiduciaryWithMaskedKey(
        id=current_fiduciary.id,
        uuid=current_fiduciary.uuid,
        name=current_fiduciary.name,
        description=current_fiduciary.description,
        privacy_policy_url=current_fiduciary.privacy_policy_url,
        contact_email=current_fiduciary.contact_email,
        is_active=current_fiduciary.is_active,
        created_at=current_fiduciary.created_at,
        api_key_prefix=prefix,
        api_key_suffix=suffix,
        api_key_hint=hint
    )
