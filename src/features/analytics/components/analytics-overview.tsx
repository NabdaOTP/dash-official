"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, RefreshCw, BarChart2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { getDashboardAnalytics } from "@/features/analytics/services/analytics-service";
import type {
    AnalyticsDashboard,
    DateRange,
} from "@/features/analytics/types";

import { AnalyticsStatCards } from "./analytics-stat-cards";
import { SpendingCard } from "./spending-card";
import { DateRangePicker, getDateRange } from "./date-range-picker";
import { QuickStatsSummary } from "./quick-stats-summary";

export function AnalyticsOverview() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [range, setRange] = useState<DateRange>(() => getDateRange("30d"));
    const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);

        try {
            const dashboardData = await getDashboardAnalytics(projectId, {
                startDate: range.startDate,
                endDate: range.endDate,
            });
            setDashboard(dashboardData);
        } catch (err) {
            console.error("Failed to load analytics:", err);
            setError("Failed to load analytics. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [projectId, range.startDate, range.endDate]);

    useEffect(() => {
        (async () => {
            await fetchAll();
        })()
    }, [fetchAll]);

    

    // Calculate days in range for daily avg
    const days = (() => {
        try {
            const start = new Date(range.startDate);
            const end = new Date(range.endDate);
            const diff = Math.round(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            return Math.max(1, diff + 1);
        } catch {
            return 30;
        }
    })();

    // ── Error ────────────────────────────────────────────────
    if (error && !dashboard) {
        return (
            <div className="space-y-4">
                <PageHeader />
                <DateRangePicker value={range} onChange={setRange} />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={fetchAll}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ── Ready ────────────────────────────────────────────────
    const safeDashboard: AnalyticsDashboard = dashboard ?? {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        successRate: 0,
        failedRate: 0,
        totalSpent: 0,
    };

    const projectIdParam = projectId;

    return (
        <div className="space-y-5">
            {/* Header with view-reports link */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <PageHeader />
                <Link
                    href={`/projects/${projectIdParam}/analytics/reports`}
                    className="cursor-pointer h-9 px-3.5 rounded-lg text-[12.5px] font-medium text-[#7C3AED] bg-[#EDE9FE]/60 hover:bg-[#EDE9FE] active:scale-[0.99] transition-all flex items-center gap-1.5"
                >
                    <BarChart2 className="w-3.5 h-3.5" />
                    View detailed reports
                </Link>
            </div>

            {/* Date range picker */}
            <DateRangePicker
                value={range}
                onChange={setRange}
                disabled={loading}
            />

            {/* 4 Stat cards */}
            <AnalyticsStatCards data={safeDashboard} loading={loading} />

            {/* Quick stats + Spending side-by-side on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <QuickStatsSummary
                    data={safeDashboard}
                    days={days}
                    loading={loading}
                />
                <SpendingCard
                    totalSpent={safeDashboard.totalSpent}
                    days={days}
                    loading={loading}
                />
            </div>
        </div>
    );
}

function PageHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    Analytics Overview
                </h1>
                <p className="text-[12.5px] text-muted-foreground">
                    A snapshot of your messaging performance
                </p>
            </div>
        </div>
    );
}