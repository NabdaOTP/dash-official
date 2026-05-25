/**
 * Request body for POST /external/waba/{phoneNumberId}/messages
 *
 * Shape is based on Meta's WhatsApp Cloud API messages payload.
 * The backend likely forwards this payload to Meta after validating
 * the API key and enriching with the WABA account context.
 */
export interface SendMessageRequest {
    to: string;                       // E.164 phone number
    templateName: string;             // Template name (must be APPROVED)
    language?: string;                // Template language code, e.g. "en_US"
    variables?: string[];             // Body variables in order: {{1}}, {{2}}, ...
}

export interface SendMessageResponse {
    messageId?: string;
    to?: string;
    sentAt?: string;
    status?: string;
}

/**
 * Result kept in component state for UI display.
 */
export interface MessageSendResult {
    phoneNumber: string;
    templateName: string;
    language?: string;
    variables?: string[];
    sentAt: Date;
    messageId?: string;
}