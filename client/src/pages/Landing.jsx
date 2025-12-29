import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Check } from 'lucide-react';

export default function Landing() {
  const stats = [
    { value: 'SHA-256', label: 'Receipt Signatures' },
    { value: 'JWT', label: 'Auth Protocol' },
    { value: 'REST', label: 'API Standard' },
    { value: 'Webhooks', label: 'Real-time Events' },
    { value: 'Immutable', label: 'Audit Logs' },
  ];

  const features = [
    {
      title: 'consent_manager.grant()',
      description: 'Purpose-bound consent with cryptographic receipts. Full audit trail.',
      inputs: ['user_id', 'purpose', 'duration'],
      output: 'ConsentReceipt',
    },
    {
      title: 'consent_manager.revoke()',
      description: 'Instant revocation with cascade notifications. DPDP Section 6(6) compliant.',
      inputs: ['consent_id', 'reason'],
      output: 'RevokeConfirmation',
    },
    {
      title: 'consent_manager.verify()',
      description: 'Real-time consent verification for data processing. Sub-50ms latency.',
      inputs: ['user_id', 'purpose_id'],
      output: 'ConsentStatus',
    },
    {
      title: 'data.export()',
      description: 'Export all user data in JSON or CSV format. GDPR Article 20 compliant.',
      inputs: ['user_id', 'format'],
      output: 'DataPackage',
    },
    {
      title: 'webhook.notify()',
      description: 'Real-time notifications for consent events. HMAC-signed payloads.',
      inputs: ['event', 'endpoint', 'secret'],
      output: 'DeliveryStatus',
    },
    {
      title: 'account.delete()',
      description: 'Complete account erasure with cascade deletion. GDPR Article 17 compliant.',
      inputs: ['user_id', 'confirmation'],
      output: 'DeletionReceipt',
    },
  ];

  const complianceItems = [
    { law: 'DPDP Section 6', desc: 'Purpose limitation and lawful processing' },
    { law: 'DPDP Section 6(6)', desc: 'Right to withdraw consent' },
    { law: 'GDPR Article 7', desc: 'Conditions for consent' },
    { law: 'GDPR Article 17', desc: 'Right to erasure (account deletion)' },
    { law: 'GDPR Article 20', desc: 'Right to data portability (export)' },
    { law: 'GDPR Article 30', desc: 'Records of processing activities' },
  ];

  const techStack = [
    { name: 'FastAPI', desc: 'Backend' },
    { name: 'Postgres', desc: 'Database' },
    { name: 'JWT', desc: 'Auth Tokens' },
    { name: 'SHA-256', desc: 'Signatures' },
    { name: 'REST', desc: 'API Protocol' },
  ];

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Hero Section */}
      <section className="grid-pattern" style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container auto-grid-lg" style={{
          alignItems: 'center',
          padding: '40px 24px',
        }}>
          <div className="animate-fadeInUp">
            <div className="badge badge-primary" style={{ marginBottom: '24px' }}>
              DPDP Act 2023 Compliant
            </div>

            <h1 style={{
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '24px',
              letterSpacing: '-0.03em',
            }}>
              Manage Consent<br />
              <span style={{ color: 'var(--color-primary)' }}>With Precision</span>
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '32px',
              maxWidth: '480px',
              lineHeight: '1.7',
            }}>
              Enterprise consent management infrastructure. Grant, track, and revoke
              data permissions with cryptographic audit trails.
            </p>

            <div className="flex-responsive" style={{ marginBottom: '48px' }}>
              <span className="code-label">DPDP Section 6</span>
              <span className="code-label">GDPR Article 7</span>
              <span className="code-label">ISO 27001</span>
            </div>

            <div className="flex-responsive">
              <Link to="/register" className="btn btn-primary btn-lg btn-mobile-full">
                Launch Console
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg btn-mobile-full">
                <Terminal size={18} />
                View Dashboard
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src="/illustration_1.png"
              alt="Data Privacy"
              style={{
                width: '100%',
                maxWidth: '540px',
                height: 'auto',
              }}
              className="animate-fadeIn"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '48px 0',
      }}>
        <div className="container">
          <div className="auto-grid-sm" style={{ gap: '32px' }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Section */}
      <section id="protocol" className="section-lg" style={{ background: 'var(--color-background)' }}>
        <div className="container auto-grid-lg" style={{
          alignItems: 'center',
        }}>
          <div>
            <img
              src="/illustration_2.png"
              alt="Consent Protocol"
              style={{ width: '100%', maxWidth: '480px' }}
            />
          </div>

          <div>
            <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
              Protocol Flow
            </span>

            <h2 style={{ marginBottom: '16px' }}>
              Consent Management<br />
              <span style={{ color: 'var(--color-primary)' }}>Protocol</span>
            </h2>

            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '32px',
              fontSize: '1.0625rem',
              lineHeight: '1.7',
            }}>
              Three-party protocol where Data Principals control their consent,
              Data Fiduciaries request permissions, and Eigensparse maintains
              immutable audit records.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { num: '01', title: 'Request', desc: 'Fiduciary requests consent for specific purpose' },
                { num: '02', title: 'Grant', desc: 'Principal reviews and grants granular permissions' },
                { num: '03', title: 'Receipt', desc: 'Cryptographic receipt issued to all parties' },
                { num: '04', title: 'Verify', desc: 'Real-time consent verification before processing' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: 'var(--color-primary)',
                    fontWeight: '600',
                    minWidth: '32px',
                  }}>
                    {step.num}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{step.title}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-lg" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
              API Reference
            </span>
            <h2 style={{ marginBottom: '16px' }}>
              Core Functions
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              margin: '0 auto',
              fontSize: '1.0625rem',
            }}>
              Type-safe consent operations with full audit logging and compliance tracking.
            </p>
          </div>

          <div className="auto-grid">
            {features.map((feature, i) => (
              <div key={i} className="card" style={{
                padding: '32px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9375rem',
                    color: 'var(--color-primary)',
                    fontWeight: '500',
                  }}>
                    {feature.title}
                  </span>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--color-primary)',
                    transform: 'rotate(45deg)',
                  }} />
                </div>

                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  marginBottom: '24px',
                  lineHeight: '1.6',
                }}>
                  {feature.description}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    // inputs
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {feature.inputs.map((input, j) => (
                      <span key={j} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        padding: '4px 10px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {input}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    // output
                  </span>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    padding: '4px 10px',
                    background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-primary)',
                    marginTop: '8px',
                    display: 'inline-block',
                  }}>
                    {feature.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="section-lg" style={{ background: 'var(--color-background)' }}>
        <div className="container auto-grid-lg" style={{
          alignItems: 'center',
        }}>
          <div>
            <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
              Compliance
            </span>

            <h2 style={{ marginBottom: '16px' }}>
              Built for<br />
              <span style={{ color: 'var(--color-primary)' }}>Regulatory Compliance</span>
            </h2>

            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '32px',
              fontSize: '1.0625rem',
              lineHeight: '1.7',
            }}>
              Every consent operation maps directly to regulatory requirements.
              Audit-ready from day one.
            </p>

            <div className="auto-grid-sm" style={{ gap: '16px' }}>
              {complianceItems.map((item, i) => (
                <div key={i} className="card" style={{ padding: '20px' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-primary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Check size={14} />
                    {item.law}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <img
              src="/illustration_3.png"
              alt="Compliance"
              style={{ width: '100%', maxWidth: '480px' }}
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '40px 0',
      }}>
        <div className="container">
          <div className="flex-responsive-center" style={{ gap: '48px' }}>
            {techStack.map((tech, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  marginBottom: '4px',
                }}>
                  {tech.name}
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                }}>
                  {tech.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-lg" style={{
        background: 'var(--color-background)',
        textAlign: 'center',
      }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '24px' }}>
            DPDP Act 2023 Compliant
          </div>

          <h2 style={{ marginBottom: '16px', fontSize: '2.75rem' }}>
            Start Managing<br />
            <span style={{ color: 'var(--color-primary)' }}>Consent Today</span>
          </h2>

          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
            maxWidth: '480px',
            margin: '0 auto 32px',
            fontSize: '1.0625rem',
          }}>
            Privacy-preserving consent management. Mathematical proof of compliance
            without data exposure.
          </p>

          <Link to="/register" className="btn btn-primary btn-lg">
            Launch Console
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '64px 0 32px',
      }}>
        <div className="container">
          <div className="auto-grid" style={{ marginBottom: '48px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <img src="/logo.png" alt="Eigensparse" style={{ height: '24px' }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                }}>
                  Eigensparse
                </span>
              </div>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                maxWidth: '280px',
                lineHeight: '1.6',
              }}>
                Enterprise consent management infrastructure for DPDP and GDPR compliance.
              </p>
            </div>

            {/* Protocol */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
              }}>
                // Protocol
              </div>
              {['How it Works', 'Architecture', 'Security', 'Compliance'].map((link, i) => (
                <a key={i} href="#" style={{
                  display: 'block',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  marginBottom: '12px',
                }}>
                  {link}
                </a>
              ))}
            </div>

            {/* Developers */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
              }}>
                // Developers
              </div>
              <Link to="/api" style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '12px',
              }}>
                API Reference
              </Link>
              <a href="https://eigensparse.gitbook.io/docs/" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '12px',
              }}>
                Documentation
              </a>
              <Link to="/sdk-demo" style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '12px',
              }}>
                SDK Demo
              </Link>
              <a href="https://www.npmjs.com/package/eigensparse-sdk" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '12px',
              }}>
                npm Package
              </a>
              <a href="https://github.com/Ni8crawler18/Phloem" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '12px',
              }}>
                GitHub
              </a>
            </div>

            {/* Resources */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
              }}>
                // Resources
              </div>
              {['Blog', 'Research', 'Privacy Policy', 'Terms'].map((link, i) => (
                <a key={i} href="#" style={{
                  display: 'block',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  marginBottom: '12px',
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex-responsive" style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '24px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
            }}>
              2025 Eigensparse. Built with FastAPI + React.
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                }} />
                DPDP Compliant
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                }} />
                GDPR Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
