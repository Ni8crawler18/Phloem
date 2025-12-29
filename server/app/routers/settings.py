"""
Settings Router
Profile updates and account management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import (
    User, DataFiduciary, Consent, ConsentReceipt, AuditLog,
    Purpose, AuditAction
)
from app.models.webhook import Webhook, WebhookDelivery
from app.schemas import (
    UserProfileUpdate, UserPasswordChange,
    FiduciaryProfileUpdate, FiduciaryPasswordChange,
    AccountDeleteRequest, AccountDeleteResponse,
    UserResponse, DataFiduciaryResponse
)
from app.services.auth import verify_password, get_password_hash
from app.services.audit import create_audit_log
from app.dependencies.auth import get_current_user, get_current_fiduciary

router = APIRouter(prefix="/api/settings", tags=["Settings"])

limiter = Limiter(key_func=get_remote_address)


# ========== User Settings ==========

@router.get("/user/profile", response_model=UserResponse)
@limiter.limit("30/minute")
def get_user_profile(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.put("/user/profile", response_model=UserResponse)
@limiter.limit("10/minute")
def update_user_profile(
    request: Request,
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile (name, phone)"""
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone

    db.commit()
    db.refresh(current_user)

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "user_profile", current_user.uuid,
        user_id=current_user.id,
        details={"action": "profile_updated"},
        ip_address=request.client.host if request.client else None
    )

    return current_user


@router.post("/user/change-password")
@limiter.limit("5/minute")
def change_user_password(
    request: Request,
    data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password (requires current password)"""
    # Verify current password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Validate new password is different
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")

    # Update password
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "user_password", current_user.uuid,
        user_id=current_user.id,
        details={"action": "password_changed"},
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Password changed successfully"}


@router.post("/user/delete-account", response_model=AccountDeleteResponse)
@limiter.limit("3/minute")
def delete_user_account(
    request: Request,
    data: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account permanently.
    Requires password confirmation and 'DELETE' confirmation text.
    This action is irreversible.
    """
    # Verify password
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password is incorrect")

    # Verify confirmation text
    if data.confirmation != "DELETE":
        raise HTTPException(
            status_code=400,
            detail="Please type 'DELETE' to confirm account deletion"
        )

    # Count data to be deleted for response
    consents_count = db.query(Consent).filter(
        Consent.user_id == current_user.id
    ).count()

    audit_logs_count = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id
    ).count()

    # Create final audit log before deletion
    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "account_deletion", current_user.uuid,
        user_id=current_user.id,
        details={
            "action": "account_deleted",
            "email": current_user.email,
            "consents_deleted": consents_count
        },
        ip_address=request.client.host if request.client else None
    )

    # Delete consent receipts first (foreign key)
    consent_ids = [c.id for c in db.query(Consent).filter(
        Consent.user_id == current_user.id
    ).all()]
    if consent_ids:
        db.query(ConsentReceipt).filter(
            ConsentReceipt.consent_id.in_(consent_ids)
        ).delete(synchronize_session=False)

    # Delete consents
    db.query(Consent).filter(Consent.user_id == current_user.id).delete()

    # Anonymize audit logs (keep for compliance, remove PII)
    db.query(AuditLog).filter(AuditLog.user_id == current_user.id).update(
        {"user_id": None, "ip_address": None, "user_agent": None},
        synchronize_session=False
    )

    # Delete user
    db.delete(current_user)
    db.commit()

    return AccountDeleteResponse(
        message="Account deleted successfully",
        deleted_consents=consents_count,
        deleted_audit_logs=audit_logs_count
    )


# ========== Fiduciary Settings ==========

@router.get("/fiduciary/profile", response_model=DataFiduciaryResponse)
@limiter.limit("30/minute")
def get_fiduciary_profile(
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary)
):
    """Get current fiduciary profile"""
    return current_fiduciary


@router.put("/fiduciary/profile", response_model=DataFiduciaryResponse)
@limiter.limit("10/minute")
def update_fiduciary_profile(
    request: Request,
    data: FiduciaryProfileUpdate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Update fiduciary profile (name, description, privacy policy)"""
    if data.name is not None:
        current_fiduciary.name = data.name
    if data.description is not None:
        current_fiduciary.description = data.description
    if data.privacy_policy_url is not None:
        current_fiduciary.privacy_policy_url = data.privacy_policy_url

    db.commit()
    db.refresh(current_fiduciary)

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "fiduciary_profile", current_fiduciary.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "profile_updated"},
        ip_address=request.client.host if request.client else None
    )

    return current_fiduciary


@router.post("/fiduciary/change-password")
@limiter.limit("5/minute")
def change_fiduciary_password(
    request: Request,
    data: FiduciaryPasswordChange,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Change fiduciary password (requires current password)"""
    # Verify current password
    if not current_fiduciary.hashed_password:
        raise HTTPException(status_code=400, detail="Password not set for this account")

    if not verify_password(data.current_password, current_fiduciary.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Validate new password is different
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")

    # Update password
    current_fiduciary.hashed_password = get_password_hash(data.new_password)
    db.commit()

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "fiduciary_password", current_fiduciary.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "password_changed"},
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Password changed successfully"}


@router.post("/fiduciary/delete-account", response_model=AccountDeleteResponse)
@limiter.limit("3/minute")
def delete_fiduciary_account(
    request: Request,
    data: AccountDeleteRequest,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Delete fiduciary account permanently.
    Requires password confirmation and 'DELETE' confirmation text.
    This will also delete all purposes, webhooks, and revoke all user consents.
    This action is irreversible.
    """
    # Verify password
    if not current_fiduciary.hashed_password:
        raise HTTPException(status_code=400, detail="Password not set for this account")

    if not verify_password(data.password, current_fiduciary.hashed_password):
        raise HTTPException(status_code=400, detail="Password is incorrect")

    # Verify confirmation text
    if data.confirmation != "DELETE":
        raise HTTPException(
            status_code=400,
            detail="Please type 'DELETE' to confirm account deletion"
        )

    # Count data to be deleted
    consents_count = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).count()

    audit_logs_count = db.query(AuditLog).filter(
        AuditLog.fiduciary_id == current_fiduciary.id
    ).count()

    # Create final audit log before deletion
    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "account_deletion", current_fiduciary.uuid,
        fiduciary_id=current_fiduciary.id,
        details={
            "action": "fiduciary_account_deleted",
            "name": current_fiduciary.name,
            "consents_affected": consents_count
        },
        ip_address=request.client.host if request.client else None
    )

    # Delete webhook deliveries first
    webhook_ids = [w.id for w in db.query(Webhook).filter(
        Webhook.fiduciary_id == current_fiduciary.id
    ).all()]
    if webhook_ids:
        db.query(WebhookDelivery).filter(
            WebhookDelivery.webhook_id.in_(webhook_ids)
        ).delete(synchronize_session=False)

    # Delete webhooks
    db.query(Webhook).filter(
        Webhook.fiduciary_id == current_fiduciary.id
    ).delete()

    # Delete consent receipts
    consent_ids = [c.id for c in db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).all()]
    if consent_ids:
        db.query(ConsentReceipt).filter(
            ConsentReceipt.consent_id.in_(consent_ids)
        ).delete(synchronize_session=False)

    # Delete consents
    db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).delete()

    # Delete purposes
    db.query(Purpose).filter(
        Purpose.fiduciary_id == current_fiduciary.id
    ).delete()

    # Anonymize audit logs
    db.query(AuditLog).filter(
        AuditLog.fiduciary_id == current_fiduciary.id
    ).update(
        {"fiduciary_id": None, "ip_address": None, "user_agent": None},
        synchronize_session=False
    )

    # Delete fiduciary
    db.delete(current_fiduciary)
    db.commit()

    return AccountDeleteResponse(
        message="Account deleted successfully",
        deleted_consents=consents_count,
        deleted_audit_logs=audit_logs_count
    )
