// ─────────────────────────────────────────────────────────────
// File: src/features/analytics/services/analytics-service.ts
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import type {
    AnalyticsDashboard,
    AnalyticsDailyEntry,
    AnalyticsSummary,
    AnalyticsUsage,
} from "../types";

interface DateRangeParams {
    startDate?: string;
    endDate?: string;
}

function buildQuery(params: DateRangeParams): string {
    const search = new URLSearchParams();
    if (params.startDate) search.set("startDate", params.startDate);
    if (params.endDate) search.set("endDate", params.endDate);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

/**
 * Get the project dashboard metrics (new combined endpoint).
 * GET /projects/{projectId}/analytics/dashboard
 *
 * Returns: totalSent, delivered, read, failed, successRate, failedRate, totalSpent
 */
export async function getDashboardAnalytics(
    projectId: string,
    range?: DateRangeParams
): Promise<AnalyticsDashboard> {
    const result = await api.get<AnalyticsDashboard>(
        `/projects/${projectId}/analytics/dashboard${buildQuery(range ?? {})}`
    );
    // Defensive defaults
    return {
        totalSent: result?.totalSent ?? 0,
        delivered: result?.delivered ?? 0,
        read: result?.read ?? 0,
        failed: result?.failed ?? 0,
        successRate: result?.successRate ?? 0,
        failedRate: result?.failedRate ?? 0,
        totalSpent: result?.totalSpent ?? 0,
    };
}

/**
 * Get the daily report breakdown for charting.
 * GET /projects/{projectId}/analytics/reports/daily
 */
export async function getDailyReport(
    projectId: string,
    range?: DateRangeParams
): Promise<AnalyticsDailyEntry[]> {
    const result = await api.get<AnalyticsDailyEntry[]>(
        `/projects/${projectId}/analytics/reports/daily${buildQuery(range ?? {})}`
    );
    return Array.isArray(result) ? result : [];
}

// ─────────────────────────────────────────────────────────────
// Legacy endpoints — kept for backwards compatibility
// ─────────────────────────────────────────────────────────────

/**
 * @deprecated Use getDashboardAnalytics instead.
 */
export async function getAnalyticsSummary(
    projectId: string,
    range?: DateRangeParams
): Promise<AnalyticsSummary> {
    const result = await api.get<AnalyticsSummary>(
        `/projects/${projectId}/analytics/summary${buildQuery(range ?? {})}`
    );
    return {
        sent: result?.sent ?? 0,
        delivered: result?.delivered ?? 0,
        read: result?.read ?? 0,
        failed: result?.failed ?? 0,
        total: result?.total ?? 0,
    };
}

/**
 * @deprecated Use getDashboardAnalytics instead.
 */
export async function getAnalyticsUsage(
    projectId: string,
    range?: DateRangeParams
): Promise<AnalyticsUsage> {
    const result = await api.get<AnalyticsUsage>(
        `/projects/${projectId}/analytics/usage${buildQuery(range ?? {})}`
    );
    return { totalSpent: result?.totalSpent ?? 0 };
}