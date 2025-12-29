/**
 * Eigensparse JavaScript SDK
 * Consent Management System for Web and Node.js Applications
 *
 * DPDP Act 2023 (India) & GDPR (EU) Compliant
 *
 * @version 1.0.0
 * @license MIT
 * @see https://eigensparse.com/docs/sdk
 */

const VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'http://localhost:8000/api';

/**
 * Custom error class for SDK errors
 */
class EigensparseError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'EigensparseError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Eigensparse SDK Client
 * @class
 */
class EigensparseClient {
  /**
   * Create a new SDK client instance
   * @param {Object} config - Configuration options
   * @param {string} config.baseUrl - API base URL
   * @param {string} config.apiKey - Data Fiduciary API key
   * @param {boolean} config.debug - Enable debug logging
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey || null;
    this.debug = config.debug || false;
    this.version = VERSION;
  }

  /**
   * Set or update API key
   * @param {string} apiKey - Data Fiduciary API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled
   */
  setDebug(enabled) {
    this.debug = enabled;
  }

  /**
   * Internal HTTP request handler
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-SDK-Version': this.version,
      ...options.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (this.debug) {
      console.log(`[Eigensparse SDK] ${options.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new EigensparseError(
          data.detail || 'Request failed',
          response.status,
          data.code || 'API_ERROR'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof EigensparseError) throw error;
      throw new EigensparseError(error.message, 0, 'NETWORK_ERROR');
    }
  }

  // ============================================================
  // CONSENT VERIFICATION
  // ============================================================

  /**
   * Check consent status for a user
   * @param {string} userEmail - User's email address
   * @param {string} [purposeUuid] - Optional specific purpose UUID
   * @returns {Promise<Object>} Consent status with details
   * @example
   * const status = await client.checkConsent('user@example.com');
   * if (status.has_consent) {
   *   // User has consented
   * }
   */
  async checkConsent(userEmail, purposeUuid = null) {
    const body = { user_email: userEmail };
    if (purposeUuid) {
      body.purpose_uuid = purposeUuid;
    }

    return this._request('/sdk/check-consent', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Quick check if user has consented to a specific purpose
   * @param {string} userEmail - User's email address
   * @param {string} purposeUuid - Purpose UUID
   * @returns {Promise<boolean>} Whether user has consented
   * @example
   * if (await client.hasConsent('user@example.com', 'purpose-uuid')) {
   *   processUserData();
   * }
   */
  async hasConsent(userEmail, purposeUuid) {
    const result = await this.checkConsent(userEmail, purposeUuid);
    return result.has_consent;
  }

  /**
   * Get all active consents for a user
   * @param {string} userEmail - User's email address
   * @returns {Promise<Array>} List of active consents
   */
  async getUserConsents(userEmail) {
    const result = await this.checkConsent(userEmail);
    return result.consents || [];
  }

  // ============================================================
  // PURPOSE MANAGEMENT
  // ============================================================

  /**
   * Get all purposes for the authenticated fiduciary
   * @returns {Promise<Array>} List of purposes
   * @example
   * const purposes = await client.getPurposes();
   * purposes.forEach(p => console.log(p.name));
   */
  async getPurposes() {
    return this._request('/sdk/purposes');
  }

  /**
   * Create a new purpose
   * @param {Object} purpose - Purpose configuration
   * @param {string} purpose.name - Purpose name
   * @param {string} purpose.description - Clear description
   * @param {string[]} purpose.data_categories - Data types collected
   * @param {number} purpose.retention_period_days - Retention period
   * @param {string} purpose.legal_basis - GDPR Article 6 basis
   * @param {boolean} [purpose.is_mandatory] - Required for service
   * @returns {Promise<Object>} Created purpose
   */
  async createPurpose(purpose) {
    return this._request('/purposes', {
      method: 'POST',
      body: JSON.stringify(purpose),
    });
  }

  // ============================================================
  // UI COMPONENTS
  // ============================================================

  /**
   * Render consent widget in a container
   * @param {string|HTMLElement} container - Container element or selector
   * @param {Object} [options] - Widget options
   * @param {Function} [options.onConsent] - Callback when consent granted
   * @param {Function} [options.onDeny] - Callback when consent denied
   * @param {string} [options.theme] - 'light' or 'dark'
   * @param {string} [options.locale] - Language code (en, hi)
   */
  async renderWidget(container, options = {}) {
    const targetEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!targetEl) {
      throw new EigensparseError('Container element not found', 400, 'INVALID_CONTAINER');
    }

    const purposes = await this.getPurposes();
    targetEl.innerHTML = this._buildWidgetHTML(purposes, options);
    this._attachWidgetEvents(targetEl, purposes, options);
  }

  /**
   * Show consent banner at page bottom
   * @param {Object} [options] - Banner options
   * @param {Function} [options.onAccept] - Callback on accept all
   * @param {Function} [options.onManage] - Callback on manage preferences
   * @param {Function} [options.onDismiss] - Callback on dismiss
   */
  showBanner(options = {}) {
    // Remove existing banner
    this.hideBanner();

    const banner = document.createElement('div');
    banner.id = 'eigensparse-consent-banner';
    banner.innerHTML = this._buildBannerHTML(options);
    document.body.appendChild(banner);

    this._attachBannerEvents(banner, options);
  }

  /**
   * Hide and remove consent banner
   */
  hideBanner() {
    const existing = document.getElementById('eigensparse-consent-banner');
    if (existing) {
      existing.remove();
    }
  }

  // ============================================================
  // PRIVATE: UI BUILDERS
  // ============================================================

  _buildWidgetHTML(purposes, options) {
    const theme = options.theme || 'light';
    const colors = theme === 'dark' ? {
      bg: '#1e293b',
      text: '#f1f5f9',
      muted: '#94a3b8',
      border: '#334155',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
    } : {
      bg: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
    };

    return `
      <div class="eigensparse-widget" style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${colors.primary}" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style="font-size: 18px; font-weight: 600; color: ${colors.text};">
            Consent Preferences
          </span>
        </div>

        <p style="color: ${colors.muted}; margin-bottom: 20px; font-size: 14px; line-height: 1.5;">
          We respect your privacy. Please review the data processing purposes below and manage your preferences.
        </p>

        <div class="eigensparse-purposes" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          ${purposes.map(p => this._buildPurposeItem(p, colors)).join('')}
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="eigensparse-accept-all" style="
            flex: 1;
            padding: 12px 20px;
            background: ${colors.primary};
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
          ">Accept All</button>
          <button class="eigensparse-accept-selected" style="
            flex: 1;
            padding: 12px 20px;
            background: transparent;
            color: ${colors.primary};
            border: 2px solid ${colors.primary};
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Save Preferences</button>
        </div>

        <p style="text-align: center; color: ${colors.muted}; font-size: 11px; margin-top: 16px;">
          Powered by <strong>Eigensparse</strong> • DPDP & GDPR Compliant
        </p>
      </div>
    `;
  }

  _buildPurposeItem(purpose, colors) {
    return `
      <label style="
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        border: 1px solid ${colors.border};
        border-radius: 8px;
        cursor: ${purpose.is_mandatory ? 'not-allowed' : 'pointer'};
        transition: border-color 0.2s;
      ">
        <input
          type="checkbox"
          name="eigensparse-purpose"
          value="${purpose.uuid}"
          ${purpose.is_mandatory ? 'checked disabled' : ''}
          style="margin-top: 3px; width: 18px; height: 18px; accent-color: ${colors.primary};"
        >
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-weight: 500; color: ${colors.text}; font-size: 14px;">
              ${purpose.name}
            </span>
            ${purpose.is_mandatory ? `
              <span style="font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: 500;">
                Required
              </span>
            ` : ''}
            <span style="font-size: 10px; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px;">
              ${purpose.legal_basis}
            </span>
          </div>
          <p style="color: ${colors.muted}; font-size: 13px; margin-top: 6px; line-height: 1.4;">
            ${purpose.description}
          </p>
          <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
            ${purpose.data_categories.map(cat => `
              <span style="font-size: 10px; background: ${colors.border}; color: ${colors.muted}; padding: 3px 8px; border-radius: 4px;">
                ${cat}
              </span>
            `).join('')}
          </div>
        </div>
      </label>
    `;
  }

  _buildBannerHTML(options) {
    return `
      <div style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        padding: 20px 24px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="flex: 1; max-width: 600px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style="font-weight: 600; color: #0f172a; font-size: 15px;">Privacy Settings</span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
            We process your data to provide our services. You can manage your consent preferences at any time.
          </p>
        </div>
        <div style="display: flex; gap: 12px; flex-shrink: 0;">
          <button id="eigensparse-banner-manage" style="
            padding: 10px 20px;
            background: transparent;
            color: #2563eb;
            border: 2px solid #2563eb;
            border-radius: 8px;
            font-weight: 500;
            font-size: 13px;
            cursor: pointer;
            white-space: nowrap;
          ">Manage Preferences</button>
          <button id="eigensparse-banner-accept" style="
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 13px;
            cursor: pointer;
            white-space: nowrap;
          ">Accept All</button>
        </div>
      </div>
    `;
  }

  _attachWidgetEvents(container, purposes, options) {
    const acceptAllBtn = container.querySelector('.eigensparse-accept-all');
    const saveBtn = container.querySelector('.eigensparse-accept-selected');
    const checkboxes = container.querySelectorAll('input[name="eigensparse-purpose"]');

    acceptAllBtn?.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        if (!cb.disabled) cb.checked = true;
      });
      const selected = purposes.map(p => p.uuid);
      options.onConsent?.(selected);
    });

    saveBtn?.addEventListener('click', () => {
      const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (selected.length > 0) {
        options.onConsent?.(selected);
      } else {
        options.onDeny?.();
      }
    });
  }

  _attachBannerEvents(banner, options) {
    const acceptBtn = banner.querySelector('#eigensparse-banner-accept');
    const manageBtn = banner.querySelector('#eigensparse-banner-manage');

    acceptBtn?.addEventListener('click', () => {
      this.hideBanner();
      options.onAccept?.();
    });

    manageBtn?.addEventListener('click', () => {
      this.hideBanner();
      options.onManage?.();
    });
  }
}

/**
 * Create a new Eigensparse SDK client
 * @param {Object} config - Configuration options
 * @returns {EigensparseClient} SDK client instance
 * @example
 * const client = Eigensparse.createClient({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: 'your-api-key'
 * });
 */
function createClient(config) {
  return new EigensparseClient(config);
}

// UMD Export
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.Eigensparse = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  return {
    createClient,
    EigensparseClient,
    EigensparseError,
    VERSION,
  };
}));
