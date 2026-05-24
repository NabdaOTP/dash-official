import { api } from "@/lib/api-client";
import type {
    AnalyticsSummary,
    AnalyticsUsage,
    AnalyticsParams,
} from "../types";

function buildQuery(params?: AnalyticsParams): string {
    if (!params) return "";
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    const str = query.toString();
    return str ? `?${str}` : "";
}

export async function getAnalyticsSummary(
    projectId: string,
    params?: AnalyticsParams
): Promise<AnalyticsSummary> {
    return api.get<AnalyticsSummary>(
        `/projects/${projectId}/analytics/summary${buildQuery(params)}`
    );
}

export async function getAnalyticsUsage(
    projectId: string,
    params?: AnalyticsParams
): Promise<AnalyticsUsage> {
    return api.get<AnalyticsUsage>(
        `/projects/${projectId}/analytics/usage${buildQuery(params)}`
    );
}