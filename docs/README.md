# Eigensparse

**Consent Management for the Modern Web**

Eigensparse is an open-source consent management platform built for compliance with **DPDP Act 2023 (India)** and **GDPR (EU)**. It provides a complete solution for managing user consent with cryptographic audit trails.

---


## What is Eigensparse?

Eigensparse enables organizations to:

- **Collect consent** with purpose-specific granularity
- **Generate receipts** with SHA-256 cryptographic signatures
- **Verify consent** in real-time via SDK or API
- **Maintain audit logs** for regulatory compliance
- **Respect user rights** including withdrawal of consent

---

## Key Concepts

| Term | Description |
|------|-------------|
| **Data Principal** | The individual whose personal data is being processed |
| **Data Fiduciary** | The organization that determines the purpose of data processing |
| **Purpose** | The specific reason for collecting and processing data |
| **Consent Receipt** | Cryptographic proof that consent was granted |

---

## Quick Links

| Resource | Link |
|----------|------|
| Platform | [eigensparse.com](https://eigensparse.com) |
| API Docs | [eigensparse-api.onrender.com/docs](https://eigensparse-api.onrender.com/docs) |
| SDK | [npm package](https://www.npmjs.com/package/eigensparse-sdk) |
| GitHub | [Ni8crawler18/Phloem](https://github.com/Ni8crawler18/Phloem) |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Data Principal │     │ Data Fiduciary  │     │   Eigensparse   │
│     (User)      │     │    (Company)    │     │    (Platform)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  Grant/Revoke         │    Verify Consent     │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
         │  Consent Receipt      │    Consent Status     │
         │◄──────────────────────┼───────────────────────┤
```

---

## Features

### For Data Principals (Users)
- View all organizations requesting data access
- Grant consent for specific purposes
- Revoke consent at any time
- Download PDF consent receipts
- Complete audit history

### For Data Fiduciaries (Companies)
- Define data processing purposes
- Collect user consent via SDK
- Verify consent before processing
- API key authentication
- Dashboard analytics

### For Developers
- Simple SDK integration
- REST API
- Express.js middleware
- React hooks
- TypeScript support

---

## Get Started

1. **[Quick Start](getting-started/quick-start.md)** - Get running in 5 minutes
2. **[Core Concepts](getting-started/concepts.md)** - Understand the consent model
3. **[SDK Installation](sdk/installation.md)** - Add to your project
4. **[API Reference](api-reference/overview.md)** - Complete API documentation

---

## Compliance

Eigensparse is designed for compliance with:

| Regulation | Coverage |
|------------|----------|
| **DPDP Act 2023** | Section 6 (Consent), Section 6(6) (Withdrawal) |
| **GDPR** | Article 7 (Consent), Article 30 (Records) |

See our [Compliance Guide](guides/compliance-guide.md) for details.

---

## Support

- **GitHub Issues**: [Report bugs](https://github.com/Ni8crawler18/Phloem/issues)
- **Email**: Contact via GitHub

---

## License

MIT License - See [LICENSE](https://github.com/Ni8crawler18/Phloem/blob/main/LICENSE)
