# Eigensparse - Consent Management System

A transparent, privacy-first platform for managing user consent. Compliant with India's **DPDP Act 2023** and EU's **GDPR**.

## Project Structure

```
Phloem/
├── server/                  # FastAPI + PostgreSQL
│   └── app/
│       ├── main.py          # Application entry point
│       ├── config.py        # Settings & environment
│       ├── models/          # SQLAlchemy ORM models
│       │   ├── user.py      # User & DataFiduciary
│       │   ├── consent.py   # Consent & ConsentReceipt
│       │   ├── purpose.py   # Purpose definitions
│       │   └── audit.py     # AuditLog
│       ├── schemas/         # Pydantic request/response schemas
│       ├── routers/         # API route handlers
│       │   ├── auth.py      # Registration, login, JWT
│       │   ├── consents.py  # Grant, revoke, receipts
│       │   ├── purposes.py  # CRUD for purposes
│       │   ├── sdk.py       # SDK endpoints (check-consent)
│       │   ├── dashboard.py # Fiduciary dashboard
│       │   └── audit.py     # Audit log queries
│       ├── services/        # Business logic layer
│       └── dependencies/    # Auth, DB session injectors
├── client/                  # React + Vite
│   └── src/
│       ├── api/             # Modular API clients
│       │   ├── auth.js, consents.js, fiduciary.js
│       │   ├── purposes.js, audit.js, dashboard.js
│       ├── components/      # Reusable UI components
│       │   ├── common/      # Loading, Modal, Alert
│       │   └── layout/      # Sidebar, StatCard
│       ├── context/         # AuthContext (JWT state)
│       ├── routes/          # ProtectedRoute guard
│       ├── pages/           # Landing, Login, Dashboard, FiduciaryDashboard
│       ├── utils/           # Formatters, helpers
│       └── constants/       # App-wide constants
├── sdk/                     # JavaScript SDK (@eigensparse/sdk)
│   ├── src/                 # Source files
│   │   ├── index.js         # EigensparseClient class
│   │   └── index.d.ts       # TypeScript definitions
│   ├── dist/                # Production build
│   └── examples/            # Integration examples
├── tests/                   # Interoperability test suite
│   └── interoperability_test.py
└── venv/                    # Python virtual environment
```

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Database Setup
```bash
createdb eigensparse
```

### Server
```bash
cd server
source ../venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd client
npm install
npm run dev  # http://localhost:5173
```

### SDK
```bash
cd sdk
npm run build
```

## Key Concepts

### Roles
- **Data Fiduciary**: Organization that collects/processes personal data (e.g., a company)
- **Data Principal**: Individual whose data is being processed (e.g., a user)

### Consent Model
- **Purpose**: A declared reason for data collection with specific legal basis
- **Consent**: A Data Principal's agreement to a specific Purpose for a specific Fiduciary
- **Consent Receipt**: Cryptographically signed (SHA-256) proof of consent

### Legal Basis (GDPR Article 6)
| Value | Use Case |
|-------|----------|
| `consent` | User explicitly agrees |
| `contract` | Required for service delivery |
| `legal_obligation` | Required by law |
| `vital_interests` | Protect someone's life |
| `public_task` | Public authority function |
| `legitimate_interests` | Business necessity (balanced against user rights) |

## API Architecture

### Authentication Flow
1. User registers → hashed password stored
2. Login → JWT access token issued
3. Token sent in `Authorization: Bearer <token>` header

### Fiduciary Flow
1. Create fiduciary → API key generated
2. Create purposes with API key
3. SDK uses API key to check consent

### Consent Flow
1. User views purposes (via SDK widget or dashboard)
2. User grants consent → Receipt generated with signature
3. Fiduciary checks consent via SDK before processing data
4. User can revoke anytime → Audit log entry created

## API Endpoints Reference

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Get JWT token |
| GET | `/me` | Get current user |

### Consents (`/api/consents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/grant` | Grant consent to purpose |
| POST | `/revoke` | Revoke consent |
| GET | `/` | List user's consents |
| GET | `/{uuid}/receipt` | Get consent receipt |

### SDK (`/api/sdk`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/check-consent` | Check if user has consent |
| GET | `/purposes` | Get fiduciary's purposes |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Fiduciary statistics |
| GET | `/consents` | Consents for fiduciary |

### Audit (`/api/audit-logs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | User's audit logs |
| GET | `/fiduciary` | Fiduciary's audit logs |

## Testing

```bash
# Run interoperability tests (requires server running)
cd tests
python interoperability_test.py
```

**Test Coverage:**
- User registration/login flow
- Fiduciary and purpose creation
- Consent grant/revoke lifecycle
- SDK consent checks
- Cross-app consent isolation
- Performance KPIs (latency < 100ms)

## Environment Variables

Backend `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/eigensparse
SECRET_KEY=your-jwt-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Compliance Mapping

| Requirement | DPDP Act | GDPR | Implementation |
|-------------|----------|------|----------------|
| Purpose Limitation | Section 6 | Article 5 | Purpose binding on consents |
| Right to Withdraw | Section 6(6) | Article 7 | One-click revocation |
| Transparency | Section 5 | Article 12 | Consent receipts with signatures |
| Records of Processing | Section 8 | Article 30 | Immutable audit logs |
| Data Minimization | Section 6 | Article 5 | Category-specific consent |
