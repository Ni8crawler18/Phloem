-- Migration: Add email verification and password reset fields
-- Date: 2025-01-01
-- Description: Adds fields for email verification and password reset functionality

-- Add new audit action enum values
ALTER TYPE auditaction ADD VALUE IF NOT EXISTS 'email_verified';
ALTER TYPE auditaction ADD VALUE IF NOT EXISTS 'password_reset';

-- Add email verification and reset fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Add email verification and reset fields to data_fiduciaries table
ALTER TABLE data_fiduciaries ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE data_fiduciaries ADD COLUMN IF NOT EXISTS verification_token VARCHAR(100);
ALTER TABLE data_fiduciaries ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE data_fiduciaries ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);
ALTER TABLE data_fiduciaries ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Set existing users as verified (optional - remove if you want existing users to verify)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
UPDATE data_fiduciaries SET email_verified = TRUE WHERE email_verified IS NULL;

-- Create indexes for token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_fiduciaries_verification_token ON data_fiduciaries(verification_token);
CREATE INDEX IF NOT EXISTS idx_fiduciaries_reset_token ON data_fiduciaries(reset_token);
