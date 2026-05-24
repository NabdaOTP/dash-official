// ─────────────────────────────────────────────────────────────
// File: src/features/waba/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Quality rating returned by Meta for each phone number.
 * Used to indicate the messaging health of the number.
 */
export type WabaQualityRating = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";

/**
 * A WhatsApp phone number associated with a WABA account.
 *
 * NOTE: Backend has not been tested with a connected account yet,
 * so the exact shape may differ slightly. Adjust as needed once verified.
 */
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
    id: string;                              // local DB id
    projectId: string;
    wabaAccountId: string;                   // Meta's WABA ID
    businessName?: string | null;
    phoneNumbers?: WabaPhoneNumber[];
    createdAt: string;
    updatedAt: string;
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