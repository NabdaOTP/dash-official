// ─────────────────────────────────────────────────────────────
// File: src/features/analytics/types.ts
// ─────────────────────────────────────────────────────────────

/**
 * Response from GET /projects/{id}/analytics/dashboard
 * Single endpoint that returns all dashboard metrics + rates.
 */
export interface AnalyticsDashboard {
    totalSent: number;
    delivered: number;
    read: number;
    failed: number;
    successRate: number; // 0-100 (percentage as number)
    failedRate: number;
    totalSpent: number;
}

/**
 * A single day's metrics from GET /projects/{id}/analytics/reports/daily
 * NOTE: backend shape isn't documented exactly, so we keep the
 * required fields and allow extras. Adjust once verified.
 */
export interface AnalyticsDailyEntry {
    date: string; // ISO date like "2026-05-22"
    sent?: number;
    delivered?: number;
    read?: number;
    failed?: number;
    total?: number;
    spent?: number;
    [key: string]: unknown;
}

/**
 * Legacy summary type — kept for backwards compatibility but
 * the new code prefers AnalyticsDashboard.
 */
export interface AnalyticsSummary {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    total: number;
}

/**
 * Legacy usage type.
 */
export interface AnalyticsUsage {
    totalSpent: number;
    currency?: string;
}

/**
 * Date range presets for the picker.
 */
export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export interface DateRange {
    startDate: string; // ISO date
    endDate: string;   // ISO date
    preset: DateRangePreset;
}