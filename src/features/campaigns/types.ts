// ─────────────────────────────────────────────────────────────
// File: src/features/campaigns/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Campaign status (post-creation lifecycle).
 * Backend shape unconfirmed — adjust once tested.
 */
export type CampaignStatus =
    | "DRAFT"
    | "SCHEDULED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

/**
 * Audience filter for targeting contacts.
 * Free-form object since the backend uses arbitrary keys (e.g. city, segment, minAge).
 */
export type AudienceFilter = Record<string, string | number | boolean | undefined>;

/**
 * Request for POST /projects/{id}/campaigns
 */
export interface CreateCampaignRequest {
    name: string;
    templateName: string;
    wabaAccountId: string;
    scheduledAt?: string;          // ISO datetime; omitted = send now
    audienceFilter?: AudienceFilter;
}

/**
 * Campaign object (assumed shape — adjust once backend response is known).
 */
export interface Campaign {
    id: string;
    projectId: string;
    name: string;
    templateName: string;
    wabaAccountId: string;
    scheduledAt?: string | null;
    status: CampaignStatus;
    audienceFilter?: AudienceFilter;
    recipientCount?: number;
    sentCount?: number;
    deliveredCount?: number;
    failedCount?: number;
    createdAt: string;
    updatedAt: string;
    startedAt?: string | null;
    completedAt?: string | null;
}