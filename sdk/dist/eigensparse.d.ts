/**
 * Eigensparse SDK TypeScript Definitions
 * @version 1.0.0
 */

export interface EigensparseConfig {
  /** API base URL */
  baseUrl?: string;
  /** Data Fiduciary API key */
  apiKey?: string;
  /** Enable debug logging */
  debug?: boolean;
}

export interface Purpose {
  uuid: string;
  name: string;
  description: string;
  data_categories: string[];
  legal_basis: LegalBasis;
  retention_period_days: number;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CreatePurposeRequest {
  name: string;
  description: string;
  data_categories: string[];
  retention_period_days: number;
  legal_basis: LegalBasis;
  is_mandatory?: boolean;
}

export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export interface ConsentInfo {
  consent_uuid: string;
  purpose_uuid: string;
  purpose_name: string;
  granted_at: string;
  expires_at: string | null;
}

export interface ConsentStatus {
  has_consent: boolean;
  consents: ConsentInfo[];
}

export interface WidgetOptions {
  /** Callback when consent is granted */
  onConsent?: (purposeUuids: string[]) => void;
  /** Callback when consent is denied */
  onDeny?: () => void;
  /** Widget theme */
  theme?: 'light' | 'dark';
  /** Language locale */
  locale?: 'en' | 'hi';
}

export interface BannerOptions {
  /** Callback when user accepts all */
  onAccept?: () => void;
  /** Callback when user clicks manage */
  onManage?: () => void;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

export class EigensparseError extends Error {
  name: 'EigensparseError';
  statusCode: number;
  code: string;
  constructor(message: string, statusCode: number, code?: string);
}

export class EigensparseClient {
  readonly version: string;

  constructor(config?: EigensparseConfig);

  /** Set or update API key */
  setApiKey(apiKey: string): void;

  /** Enable or disable debug mode */
  setDebug(enabled: boolean): void;

  /** Check consent status for a user */
  checkConsent(userEmail: string, purposeUuid?: string): Promise<ConsentStatus>;

  /** Quick check if user has consented to a specific purpose */
  hasConsent(userEmail: string, purposeUuid: string): Promise<boolean>;

  /** Get all active consents for a user */
  getUserConsents(userEmail: string): Promise<ConsentInfo[]>;

  /** Get all purposes for the authenticated fiduciary */
  getPurposes(): Promise<Purpose[]>;

  /** Create a new purpose */
  createPurpose(purpose: CreatePurposeRequest): Promise<Purpose>;

  /** Render consent widget in a container */
  renderWidget(
    container: string | HTMLElement,
    options?: WidgetOptions
  ): Promise<void>;

  /** Show consent banner at page bottom */
  showBanner(options?: BannerOptions): void;

  /** Hide and remove consent banner */
  hideBanner(): void;
}

/** Create a new Eigensparse SDK client */
export function createClient(config?: EigensparseConfig): EigensparseClient;

/** SDK version */
export const VERSION: string;

declare const Eigensparse: {
  createClient: typeof createClient;
  EigensparseClient: typeof EigensparseClient;
  EigensparseError: typeof EigensparseError;
  VERSION: typeof VERSION;
};

export default Eigensparse;
