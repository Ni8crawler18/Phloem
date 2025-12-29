// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Legal Basis Options
export const LEGAL_BASIS_OPTIONS = [
  { value: 'consent', label: 'Consent' },
  { value: 'contract', label: 'Contract' },
  { value: 'legal_obligation', label: 'Legal Obligation' },
  { value: 'legitimate_interest', label: 'Legitimate Interest' },
];

// Consent Status
export const CONSENT_STATUS = {
  GRANTED: 'granted',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

// User Roles
export const ROLES = {
  USER: 'user',
  FIDUCIARY: 'fiduciary',
};

// Navigation Items - User Dashboard
export const USER_NAV_ITEMS = [
  { id: 'consents', label: 'My Consents', icon: 'Shield' },
  { id: 'available', label: 'Available Purposes', icon: 'Database' },
  { id: 'audit', label: 'Audit Log', icon: 'History' },
];

// Navigation Items - Fiduciary Dashboard
export const FIDUCIARY_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'Building2' },
  { id: 'purposes', label: 'Purposes', icon: 'Target' },
  { id: 'consents', label: 'User Consents', icon: 'Users' },
  { id: 'api', label: 'API Key', icon: 'Key' },
];
