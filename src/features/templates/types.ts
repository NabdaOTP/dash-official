// ─────────────────────────────────────────────────────────────
// File: src/features/templates/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Meta WhatsApp template categories.
 * - AUTHENTICATION: OTP, verification codes (our primary use-case)
 * - UTILITY: transactional updates (orders, deliveries, receipts)
 * - MARKETING: promotional content
 */
export type TemplateCategory = "AUTHENTICATION" | "UTILITY" | "MARKETING";

/**
 * Template review status from Meta.
 */
export type TemplateStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "IN_APPEAL";

/**
 * Template component types supported by Meta.
 */
export type TemplateComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS";

/**
 * A button inside a BUTTONS component.
 */
export interface TemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "OTP" | "COPY_CODE";
  text: string;
  url?: string;
  phone_number?: string;
  otp_type?: "COPY_CODE" | "ONE_TAP";
}

/**
 * A template component (HEADER / BODY / FOOTER / BUTTONS).
 */
export interface TemplateComponent {
  type: TemplateComponentType;
  text?: string;                          // for HEADER, BODY, FOOTER
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";  // for HEADER
  buttons?: TemplateButton[];             // for BUTTONS
  example?: {
    body_text?: string[][];
    header_text?: string[];
  };
}

/**
 * A WhatsApp message template (as returned from the backend).
 *
 * NOTE: Exact backend shape unconfirmed — adjust once tested.
 */
export interface MessageTemplate {
  id: string;
  projectId: string;
  wabaAccountId?: string;
  name: string;
  category: TemplateCategory;
  language: string;                       // e.g. "en_US", "ar"
  status: TemplateStatus;
  components: TemplateComponent[];
  rejectedReason?: string | null;
  metaTemplateId?: string | null;         // ID from Meta after submission
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for POST /waba/templates (create + submit to Meta directly).
 */
export interface CreateTemplateRequest {
  name: string;
  category: TemplateCategory;
  language: string;
  components: TemplateComponent[];
  wabaAccountId: string;
  options?: {
    allow_category_change?: boolean;
  };
}

/**
 * UI-only: the simplified shape used in the builder form,
 * before being converted to Meta's component array.
 */
export interface TemplateFormState {
  name: string;
  category: TemplateCategory;
  language: string;
  headerText: string;                     // empty = no header
  bodyText: string;
  footerText: string;                     // empty = no footer
  includeCopyCodeButton: boolean;
  copyCodeButtonText: string;
}