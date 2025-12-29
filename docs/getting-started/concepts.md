# Core Concepts

Understanding the key concepts behind Eigensparse.

---

## The Three Parties

Eigensparse implements a three-party consent model:

### 1. Data Principal (User)

The individual whose personal data is being collected or processed.

**Rights:**
- Grant consent for specific purposes
- Revoke consent at any time
- Download consent receipts
- View all active consents

### 2. Data Fiduciary (Company)

The organization that determines the purpose and means of processing personal data.

**Responsibilities:**
- Define clear data processing purposes
- Obtain valid consent before processing
- Verify consent status via API/SDK
- Honor consent revocations

### 3. Eigensparse (Platform)

The consent management infrastructure that:
- Records all consent transactions
- Generates cryptographic receipts
- Provides verification APIs
- Maintains immutable audit logs

---

## Consent Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Define  │────►│  Request │────►│  Grant   │────►│  Active  │
│  Purpose │     │  Consent │     │  Consent │     │  Consent │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │  Revoke  │
                                                  │  Consent │
                                                  └──────────┘
```

### States

| State | Description |
|-------|-------------|
| `granted` | Consent is active and valid |
| `revoked` | User has withdrawn consent |
| `expired` | Consent has passed its expiration date |

---

## Purpose

A Purpose defines why data is being collected and processed.

### Attributes

| Field | Description |
|-------|-------------|
| `name` | Short identifier (e.g., "Marketing Analytics") |
| `description` | Detailed explanation shown to users |
| `data_categories` | Types of data collected (e.g., "Email", "Usage Data") |
| `retention_period_days` | How long data will be retained |
| `legal_basis` | Legal justification for processing |
| `is_mandatory` | Whether consent is required for service |

### Legal Basis Options

| Value | When to Use |
|-------|-------------|
| `consent` | User explicitly agrees (marketing, analytics) |
| `contract` | Required to deliver a service |
| `legal_obligation` | Required by law (tax records) |
| `vital_interests` | Protect someone's life |
| `public_task` | Government/public authority function |
| `legitimate_interests` | Business necessity (fraud prevention) |

---

## Consent Receipt

When consent is granted, a receipt is generated containing:

- **Receipt ID** - Unique identifier
- **Consent UUID** - Reference to the consent record
- **Timestamp** - When consent was granted
- **Expiration** - When consent expires
- **Signature** - SHA-256 cryptographic signature

The signature ensures the receipt cannot be tampered with and provides proof of consent for audits.

---

## Audit Trail

Every action is logged with:

- Action type (grant, revoke, verify)
- Timestamp
- User information
- IP address
- User agent

This provides a complete audit trail for regulatory compliance.
