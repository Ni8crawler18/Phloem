"""
Authentication Router
User and Fiduciary authentication endpoints
"""
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db, safe_commit
from app.config import settings
from app.models import User, DataFiduciary, AuditAction
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    FiduciaryRegister, AuthResponse, DataFiduciaryWithMaskedKey,
    VerifyEmailRequest, ResendVerificationRequest,
    ForgotPasswordRequest, ResetPasswordRequest, MessageResponse
)
from app.services.auth import (
    verify_password, get_password_hash, create_access_token, generate_api_key
)
from app.services.audit import create_audit_log
from app.services.email import email_service
from app.dependencies.auth import get_current_user, get_current_fiduciary


def generate_verification_token() -> str:
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


# ========== User Authentication ==========

@router.post("/register", response_model=MessageResponse)
@limiter.limit("5/minute")
async def register_user(
    request: Request,
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new data principal (user)"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration failed. Please try again or contact support.")

    # Generate verification token
    verification_token = generate_verification_token()
    token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_EXPIRE_MINUTES)

    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password),
        email_verified=False,
        verification_token=verification_token,
        verification_token_expires=token_expires
    )
    db.add(user)
    safe_commit(db, "register user")
    db.refresh(user)

    create_audit_log(
        db, AuditAction.USER_REGISTERED, "user", user.uuid,
        user_id=user.id,
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )

    # Send verification email in background
    background_tasks.add_task(
        email_service.send_verification_email,
        user.email, user.name, verification_token, "user"
    )

    return MessageResponse(message="Registration successful. Please check your email to verify your account.")


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check email verification
    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox for the verification link."
        )

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


# ========== User Email Verification ==========

@router.post("/verify-email")
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    data: VerifyEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Verify user email with token"""
    user = db.query(User).filter(User.verification_token == data.token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    # Check expiration
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")

    # Mark as verified (keep token valid for reuse within validity period)
    was_already_verified = user.email_verified
    user.email_verified = True
    db.commit()

    # Only log and send welcome email on first verification
    if not was_already_verified:
        create_audit_log(
            db, AuditAction.EMAIL_VERIFIED, "user", user.uuid,
            user_id=user.id,
            details={"email": user.email},
            ip_address=request.client.host if request.client else None
        )

        # Send welcome email
        background_tasks.add_task(
            email_service.send_welcome_email,
            user.email, user.name, "user"
        )

    return {"message": "Email verified successfully.", "account_type": "user"}


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    data: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend verification email"""
    # Always return success to prevent user enumeration
    user = db.query(User).filter(User.email == data.email).first()

    if user and not user.email_verified:
        # Generate new token
        verification_token = generate_verification_token()
        token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_EXPIRE_MINUTES)

        user.verification_token = verification_token
        user.verification_token_expires = token_expires
        db.commit()

        background_tasks.add_task(
            email_service.send_verification_email,
            user.email, user.name, verification_token, "user"
        )

    return MessageResponse(message="If the email exists and is not verified, a new verification link has been sent.")


# ========== User Password Reset ==========

@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset email"""
    # Always return success to prevent user enumeration
    user = db.query(User).filter(User.email == data.email).first()

    if user:
        # Generate reset token
        reset_token = generate_reset_token()
        token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_EXPIRE_MINUTES)

        user.reset_token = reset_token
        user.reset_token_expires = token_expires
        db.commit()

        background_tasks.add_task(
            email_service.send_password_reset_email,
            user.email, user.name, reset_token, "user"
        )

    return MessageResponse(message="If the email exists, a password reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Check expiration
    if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    # Update password
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    create_audit_log(
        db, AuditAction.PASSWORD_RESET, "user", user.uuid,
        user_id=user.id,
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )

    # Notify user
    background_tasks.add_task(
        email_service.send_password_changed_email,
        user.email, user.name
    )

    return MessageResponse(message="Password reset successfully. You can now login with your new password.")


# ========== Fiduciary Authentication ==========

@router.post("/fiduciary/register", response_model=MessageResponse)
@limiter.limit("5/minute")
async def register_fiduciary(
    request: Request,
    data: FiduciaryRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new data fiduciary (company)"""
    existing = db.query(DataFiduciary).filter(
        DataFiduciary.contact_email == data.contact_email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration failed. Please try again or contact support.")

    # Generate verification token
    verification_token = generate_verification_token()
    token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_EXPIRE_MINUTES)

    fiduciary = DataFiduciary(
        name=data.name,
        description=data.description,
        privacy_policy_url=data.privacy_policy_url,
        contact_email=data.contact_email,
        hashed_password=get_password_hash(data.password),
        api_key=generate_api_key(),
        email_verified=False,
        verification_token=verification_token,
        verification_token_expires=token_expires
    )
    db.add(fiduciary)
    safe_commit(db, "register fiduciary")
    db.refresh(fiduciary)

    create_audit_log(
        db, AuditAction.USER_REGISTERED, "fiduciary", fiduciary.uuid,
        fiduciary_id=fiduciary.id,
        details={"name": fiduciary.name, "email": fiduciary.contact_email},
        ip_address=request.client.host if request.client else None
    )

    # Send verification email in background
    background_tasks.add_task(
        email_service.send_verification_email,
        fiduciary.contact_email, fiduciary.name, verification_token, "fiduciary"
    )

    return MessageResponse(message="Registration successful. Please check your email to verify your account.")


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

    # Check email verification
    if not fiduciary.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox for the verification link."
        )

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


# ========== Fiduciary Email Verification ==========

@router.post("/fiduciary/verify-email")
@limiter.limit("10/minute")
async def verify_fiduciary_email(
    request: Request,
    data: VerifyEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Verify fiduciary email with token"""
    fiduciary = db.query(DataFiduciary).filter(DataFiduciary.verification_token == data.token).first()

    if not fiduciary:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    # Check expiration
    if fiduciary.verification_token_expires and fiduciary.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")

    # Mark as verified (keep token valid for reuse within validity period)
    was_already_verified = fiduciary.email_verified
    fiduciary.email_verified = True
    db.commit()

    # Only log and send welcome email on first verification
    if not was_already_verified:
        create_audit_log(
            db, AuditAction.EMAIL_VERIFIED, "fiduciary", fiduciary.uuid,
            fiduciary_id=fiduciary.id,
            details={"email": fiduciary.contact_email},
            ip_address=request.client.host if request.client else None
        )

        # Send welcome email
        background_tasks.add_task(
            email_service.send_welcome_email,
            fiduciary.contact_email, fiduciary.name, "fiduciary"
        )

    return {"message": "Email verified successfully.", "account_type": "fiduciary"}


@router.post("/fiduciary/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
async def resend_fiduciary_verification(
    request: Request,
    data: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend verification email for fiduciary"""
    # Always return success to prevent user enumeration
    fiduciary = db.query(DataFiduciary).filter(DataFiduciary.contact_email == data.email).first()

    if fiduciary and not fiduciary.email_verified:
        # Generate new token
        verification_token = generate_verification_token()
        token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_EXPIRE_MINUTES)

        fiduciary.verification_token = verification_token
        fiduciary.verification_token_expires = token_expires
        db.commit()

        background_tasks.add_task(
            email_service.send_verification_email,
            fiduciary.contact_email, fiduciary.name, verification_token, "fiduciary"
        )

    return MessageResponse(message="If the email exists and is not verified, a new verification link has been sent.")


# ========== Fiduciary Password Reset ==========

@router.post("/fiduciary/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def fiduciary_forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset email for fiduciary"""
    # Always return success to prevent user enumeration
    fiduciary = db.query(DataFiduciary).filter(DataFiduciary.contact_email == data.email).first()

    if fiduciary:
        # Generate reset token
        reset_token = generate_reset_token()
        token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_EXPIRE_MINUTES)

        fiduciary.reset_token = reset_token
        fiduciary.reset_token_expires = token_expires
        db.commit()

        background_tasks.add_task(
            email_service.send_password_reset_email,
            fiduciary.contact_email, fiduciary.name, reset_token, "fiduciary"
        )

    return MessageResponse(message="If the email exists, a password reset link has been sent.")


@router.post("/fiduciary/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def fiduciary_reset_password(
    request: Request,
    data: ResetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Reset fiduciary password with token"""
    fiduciary = db.query(DataFiduciary).filter(DataFiduciary.reset_token == data.token).first()

    if not fiduciary:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Check expiration
    if fiduciary.reset_token_expires and fiduciary.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    # Update password
    fiduciary.hashed_password = get_password_hash(data.new_password)
    fiduciary.reset_token = None
    fiduciary.reset_token_expires = None
    db.commit()

    create_audit_log(
        db, AuditAction.PASSWORD_RESET, "fiduciary", fiduciary.uuid,
        fiduciary_id=fiduciary.id,
        details={"email": fiduciary.contact_email},
        ip_address=request.client.host if request.client else None
    )

    # Notify user
    background_tasks.add_task(
        email_service.send_password_changed_email,
        fiduciary.contact_email, fiduciary.name
    )

    return MessageResponse(message="Password reset successfully. You can now login with your new password.")
