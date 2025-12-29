# Compliance Guide

How Eigensparse helps you comply with DPDP Act 2023 and GDPR.

---

## Overview

Eigensparse is designed to help organizations comply with:

- **DPDP Act 2023** (Digital Personal Data Protection Act, India)
- **GDPR** (General Data Protection Regulation, EU)

This guide maps Eigensparse features to specific regulatory requirements.

---

## DPDP Act 2023 (India)

### Section 6: Consent

> "Personal data shall be processed only for a lawful purpose for which the data principal has given her consent."

**Eigensparse Implementation:**

| Requirement | Feature |
|-------------|---------|
| Specific consent | Purpose-bound consent with detailed descriptions |
| Informed consent | Clear purpose names and data categories |
| Freely given | Non-mandatory purposes clearly marked |
| Withdrawable | One-click revocation via dashboard |

**How to comply:**

```javascript
// Create specific, informed purposes
await client.createPurpose({
  name: 'Marketing Communications',
  description: 'Send promotional emails about our products and services',
  data_categories: ['Email', 'Name', 'Purchase History'],
  legal_basis: 'consent',
  is_mandatory: false  // Must be freely given
});
```

---

### Section 6(3): Consent Notice

> "The consent shall be requested along with a notice which contains the details of personal data to be processed."

**Eigensparse Implementation:**

- Consent receipts include all required details
- Purpose descriptions explain data usage
- Data categories clearly listed
- Retention periods specified

**Receipt Contents:**
- Purpose name and description
- Data categories being collected
- Retention period
- Data Fiduciary information
- Cryptographic signature

---

### Section 6(6): Right to Withdraw

> "The data principal shall have the right to withdraw her consent at any time."

**Eigensparse Implementation:**

```javascript
// Users can revoke anytime via dashboard
// Or programmatically:
POST /api/consents/revoke
{
  "consent_uuid": "...",
  "reason": "No longer want marketing emails"
}
```

**Features:**
- One-click revocation
- Immediate effect
- Reason tracking
- Audit trail

---

### Section 8: Duties of Data Fiduciary

> "A data fiduciary shall maintain accuracy, completeness and consistency of personal data."

**Eigensparse Implementation:**

- Immutable audit logs
- Timestamped consent records
- Cryptographic integrity (SHA-256)
- Complete history retention

---

## GDPR (EU)

### Article 7: Conditions for Consent

> "The controller shall be able to demonstrate that the data subject has consented."

**Eigensparse Implementation:**

| GDPR Requirement | Eigensparse Feature |
|------------------|---------------------|
| Demonstrate consent | Downloadable PDF receipts |
| Freely given | is_mandatory flag on purposes |
| Specific | Purpose-bound consent model |
| Informed | Detailed purpose descriptions |
| Unambiguous | Explicit grant action required |
| Withdrawable | Revocation API and dashboard |

---

### Article 13: Information to be Provided

Required information when collecting data:

| Information | Eigensparse Field |
|-------------|-------------------|
| Identity of controller | fiduciary.name |
| Contact details | fiduciary.contact_email |
| Purposes | purpose.name, purpose.description |
| Legal basis | purpose.legal_basis |
| Recipients | purpose.data_categories |
| Retention period | purpose.retention_period_days |
| Right to withdraw | Revoke button in dashboard |

---

### Article 17: Right to Erasure

> "The data subject shall have the right to obtain from the controller the erasure of personal data."

**Implementation Notes:**

Eigensparse tracks consent, not personal data. When processing an erasure request:

1. Query consents for the user
2. Revoke all active consents
3. Process erasure in your systems
4. Consent records are retained for audit (anonymized)

```javascript
// Get all user consents
const consents = await client.getUserConsents('user@example.com');

// Revoke each one
for (const consent of consents) {
  if (consent.status === 'granted') {
    await revokeConsent(consent.uuid);
  }
}

// Then process erasure in your systems
await deleteUserData('user@example.com');
```

---

### Article 30: Records of Processing

> "Each controller shall maintain a record of processing activities."

**Eigensparse Implementation:**

- Complete audit trail of all consent actions
- Timestamped records
- IP address and user agent logging
- Exportable for regulators

**Audit Log Contents:**
- Action type (grant, revoke, verify)
- Timestamp
- User identifier
- Purpose identifier
- IP address
- User agent

---

## Legal Basis Reference

| Legal Basis | DPDP Section | GDPR Article | Use Case |
|-------------|--------------|--------------|----------|
| `consent` | 6(1) | 6(1)(a) | Marketing, Analytics |
| `contract` | 4(2)(a) | 6(1)(b) | Service delivery |
| `legal_obligation` | 4(2)(c) | 6(1)(c) | Tax records, KYC |
| `vital_interests` | 4(2)(b) | 6(1)(d) | Emergency situations |
| `public_task` | - | 6(1)(e) | Government functions |
| `legitimate_interests` | - | 6(1)(f) | Fraud prevention |

---

## Compliance Checklist

### Before Launch

- [ ] Define all data processing purposes
- [ ] Set appropriate legal basis for each purpose
- [ ] Specify accurate retention periods
- [ ] Document data categories collected
- [ ] Configure privacy policy URL
- [ ] Set up DPO contact email

### Ongoing

- [ ] Review consents periodically
- [ ] Update purposes when processing changes
- [ ] Honor revocation requests immediately
- [ ] Maintain audit logs
- [ ] Respond to data subject requests
- [ ] Review for expired consents

---

## Consent Receipt Example

Every consent generates a receipt containing:

```
CONSENT RECEIPT

Receipt ID: RCP-2024-00123
Consent UUID: 550e8400-e29b-41d4-a716-446655440000
Status: GRANTED

DATA PRINCIPAL
Name: John Doe
Email: john@example.com

DATA FIDUCIARY
Organization: Demo Corp
Contact: privacy@democorp.com

CONSENT PURPOSE
Purpose: Marketing Analytics
Description: Track user behavior for personalized marketing
Legal Basis: consent
Data Categories: Usage Data, Device Info
Retention Period: 365 days

Granted At: 2024-01-15 10:30:00 UTC
Expires At: 2025-01-15 10:30:00 UTC

CRYPTOGRAPHIC SIGNATURE (SHA-256)
a1b2c3d4e5f6g7h8i9j0...

This receipt is compliant with DPDP Act 2023 (India) and GDPR (EU).
```

---

## Data Retention

Eigensparse retains:

| Data | Retention | Reason |
|------|-----------|--------|
| Active consents | Until revoked/expired | Operational |
| Revoked consents | 7 years | Audit/compliance |
| Audit logs | 7 years | Regulatory requirement |
| Consent receipts | 7 years | Proof of consent |

---

## Support

For compliance questions:
- GitHub Issues: [github.com/Ni8crawler18/Phloem/issues](https://github.com/Ni8crawler18/Phloem/issues)
- Platform: [eigensparse.com](https://eigensparse.com)
