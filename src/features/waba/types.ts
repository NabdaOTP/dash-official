// ─────────────────────────────────────────────────────────────
// File: src/features/waba/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Quality rating returned by Meta for each phone number.
 * Used to indicate the messaging health of the number.
 */
export type WabaQualityRating = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";


export interface WabaPhoneNumber {
    id: string;                              // local DB id
    phoneNumberId: string;                   // Meta's phone number ID (used in send OTP API)
    displayPhoneNumber: string;              // e.g. "+20 100 123 4567"
    verifiedName?: string | null;            // verified business name
    qualityRating?: WabaQualityRating;
    status?: string | null;                  // e.g. "CONNECTED", "PENDING"
    codeVerificationStatus?: string | null;
}

/**
 * A WhatsApp Business Account (WABA) connected to a project.
 */
export interface WabaAccount {
  id: string;                              // Local DB id (also serves as wabaAccountId for backend calls)
  name: string;                            // Business name (e.g. "Technology News")
  displayPhoneNumber: string;              // Formatted phone (e.g. "+1 555-972-8142")
  phoneNumberId: string;                   // Meta's phone number ID (used in send OTP API)
  isActive: boolean;
  tokenExpiresAt: string;                  // ISO datetime when Meta token expires
  daysUntilExpiry: number;                 // Convenience field from backend
  needsReauth: boolean;                    // True when token is expired/expiring soon
  reauthRequiredAt: string | null;         // ISO datetime if reauth is required
}
 

/**
 * Response from GET /projects/{id}/waba/status
 */
export interface WabaStatus {
  isConnected: boolean;
  accounts: WabaAccount[];
}

/**
 * Response from GET /projects/{id}/waba/connect-url
 */
export interface WabaConnectUrl {
  connectUrl: string;
  redirectUri: string;
}