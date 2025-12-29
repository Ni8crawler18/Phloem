"""
Data Export Service
GDPR Article 20 - Right to Data Portability
"""
import json
import csv
import io
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models import User, Consent, ConsentReceipt, Purpose, DataFiduciary, AuditLog


def get_user_export_data(db: Session, user: User) -> Dict[str, Any]:
    """
    Gather all user data for export.
    Returns a dictionary with all user-related data.
    """
    # User profile
    profile = {
        "id": user.uuid,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

    # Consents
    consents_data = []
    consents = db.query(Consent).filter(Consent.user_id == user.id).all()

    for consent in consents:
        purpose = db.query(Purpose).filter(Purpose.id == consent.purpose_id).first()
        fiduciary = db.query(DataFiduciary).filter(
            DataFiduciary.id == consent.fiduciary_id
        ).first()
        receipt = db.query(ConsentReceipt).filter(
            ConsentReceipt.consent_id == consent.id
        ).first()

        consent_entry = {
            "consent_id": consent.uuid,
            "status": consent.status.value,
            "granted_at": consent.granted_at.isoformat() if consent.granted_at else None,
            "revoked_at": consent.revoked_at.isoformat() if consent.revoked_at else None,
            "expires_at": consent.expires_at.isoformat() if consent.expires_at else None,
            "fiduciary": {
                "name": fiduciary.name if fiduciary else None,
                "contact_email": fiduciary.contact_email if fiduciary else None,
            },
            "purpose": {
                "name": purpose.name if purpose else None,
                "description": purpose.description if purpose else None,
                "data_categories": json.loads(purpose.data_categories) if purpose else [],
                "legal_basis": purpose.legal_basis if purpose else None,
                "retention_period_days": purpose.retention_period_days if purpose else None,
            },
            "receipt": {
                "receipt_id": receipt.receipt_id if receipt else None,
                "signature": receipt.signature if receipt else None,
            } if receipt else None,
        }
        consents_data.append(consent_entry)

    # Audit logs
    audit_logs = []
    logs = db.query(AuditLog).filter(AuditLog.user_id == user.id).order_by(
        AuditLog.created_at.desc()
    ).all()

    for log in logs:
        audit_logs.append({
            "action": log.action.value,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": json.loads(log.details) if log.details else None,
            "ip_address": log.ip_address,
            "timestamp": log.created_at.isoformat() if log.created_at else None,
        })

    return {
        "export_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "format_version": "1.0",
            "compliance": ["GDPR Article 20", "DPDP Act 2023"],
        },
        "profile": profile,
        "consents": consents_data,
        "audit_logs": audit_logs,
    }


def export_to_json(data: Dict[str, Any]) -> str:
    """Export data as JSON string"""
    return json.dumps(data, indent=2, ensure_ascii=False)


def export_to_csv(data: Dict[str, Any]) -> str:
    """Export data as CSV string (consents only, flattened)"""
    output = io.StringIO()

    # Flatten consents for CSV
    consents = data.get("consents", [])
    if not consents:
        # Return header only if no consents
        writer = csv.writer(output)
        writer.writerow([
            "consent_id", "status", "granted_at", "revoked_at", "expires_at",
            "fiduciary_name", "fiduciary_email",
            "purpose_name", "purpose_description", "data_categories",
            "legal_basis", "retention_days", "receipt_id"
        ])
        return output.getvalue()

    fieldnames = [
        "consent_id", "status", "granted_at", "revoked_at", "expires_at",
        "fiduciary_name", "fiduciary_email",
        "purpose_name", "purpose_description", "data_categories",
        "legal_basis", "retention_days", "receipt_id"
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for consent in consents:
        row = {
            "consent_id": consent["consent_id"],
            "status": consent["status"],
            "granted_at": consent["granted_at"],
            "revoked_at": consent["revoked_at"],
            "expires_at": consent["expires_at"],
            "fiduciary_name": consent["fiduciary"]["name"],
            "fiduciary_email": consent["fiduciary"]["contact_email"],
            "purpose_name": consent["purpose"]["name"],
            "purpose_description": consent["purpose"]["description"],
            "data_categories": ", ".join(consent["purpose"]["data_categories"]),
            "legal_basis": consent["purpose"]["legal_basis"],
            "retention_days": consent["purpose"]["retention_period_days"],
            "receipt_id": consent["receipt"]["receipt_id"] if consent["receipt"] else None,
        }
        writer.writerow(row)

    return output.getvalue()
