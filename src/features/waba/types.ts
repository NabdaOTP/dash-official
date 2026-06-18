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
  id: string;
  name: string;
  displayPhoneNumber: string;
  phoneNumberId: string;
  isActive: boolean;
  tokenExpiresAt: string;
  daysUntilExpiry: number;
  needsReauth: boolean;
  reauthRequiredAt: string | null;
}

export interface WabaStatus {
  isConnected: boolean;
  accounts: WabaAccount[];
}

export interface WabaAppReviewPermissionGuide {
  permission: string;
  title: string;
  purpose: string;
  whyNeeded: string;
  reviewerSees: string;
  demoAction: string;
  backendProof: string[];
}

export interface WabaAppReviewGuide {
  generatedAt: string;
  projectId: string;
  readiness: {
    activeAccounts: number;
    totalAccounts: number;
    totalTemplates: number;
    approvedTemplates: number;
    canSendTestMessage: boolean;
    webhookPath: string;
    callbackPath: string;
  };
  permissions: WabaAppReviewPermissionGuide[];
  demoScript: Array<{
    title: string;
    description: string;
  }>;
  sampleValues: {
    businessId: string;
    businessName: string;
    wabaId: string;
    phoneNumberId: string;
    recipient: string;
    accessTokenNote: string;
  };
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
// export interface WabaConnectUrl {
//   connectUrl: string;
//   redirectUri: string;
// }

export interface WabaConnectUrl {
  connectUrl: string;
  redirectUri: string;
  fallbackRedirectUri?: string;
  state: string;
  embeddedSignup: {
    appId: string;
    configId: string;
    version: string;       // e.g. "v25.0"
    extras: Record<string, unknown>;
  };
}
