export interface AnalyticsSummary {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
}

export interface AnalyticsUsage {
    totalSpent: number;
    currency?: string;
}

export interface AnalyticsParams {
    startDate?: string; // ISO 8601: "2026-01-01"
    endDate?: string;   // ISO 8601: "2026-12-31"
}