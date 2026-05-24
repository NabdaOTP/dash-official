"use client";

import {
    Send, CheckCheck, Eye, XCircle, TrendingUp, TrendingDown,
} from "lucide-react";
import type { AnalyticsDashboard } from "@/features/analytics/types";

interface AnalyticsStatCardsProps {
    data: AnalyticsDashboard;
    loading?: boolean;
}

export function AnalyticsStatCards({ data, loading }: AnalyticsStatCardsProps) {
    // Calculate read rate from total (backend doesn't return it directly)
    const readRate =
        data.totalSent > 0 ? (data.read / data.totalSent) * 100 : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
                icon={<Send className="w-4 h-4" />}
                iconBg="bg-[#EDE9FE]"
                iconColor="text-[#7C3AED]"
                label="Total Sent"
                value={data.totalSent}
                loading={loading}
            />
            <StatCard
                icon={<CheckCheck className="w-4 h-4" />}
                iconBg="bg-green-50"
                iconColor="text-green-700"
                label="Delivered"
                value={data.delivered}
                rate={data.successRate}
                rateColor="text-green-700"
                rateTrend="up"
                loading={loading}
            />
            <StatCard
                icon={<Eye className="w-4 h-4" />}
                iconBg="bg-blue-50"
                iconColor="text-blue-700"
                label="Read"
                value={data.read}
                rate={readRate}
                rateColor="text-blue-700"
                loading={loading}
            />
            <StatCard
                icon={<XCircle className="w-4 h-4" />}
                iconBg="bg-red-50"
                iconColor="text-red-700"
                label="Failed"
                value={data.failed}
                rate={data.failedRate}
                rateColor="text-red-700"
                rateTrend="down"
                loading={loading}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
    value: number;
    rate?: number;
    rateColor?: string;
    rateTrend?: "up" | "down";
    loading?: boolean;
}

function StatCard({
    icon,
    iconBg,
    iconColor,
    label,
    value,
    rate,
    rateColor,
    rateTrend,
    loading,
}: StatCardProps) {
    const formatNumber = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
        return n.toLocaleString();
    };

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
                    {icon}
                </div>
                {rate !== undefined && rate > 0 && (
                    <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold ${rateColor} bg-current/5`}
                        style={{ backgroundColor: "transparent" }}
                    >
                        {rateTrend === "up" && <TrendingUp className="w-2.5 h-2.5" />}
                        {rateTrend === "down" && <TrendingDown className="w-2.5 h-2.5" />}
                        {rate.toFixed(1)}%
                    </span>
                )}
            </div>

            <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                    {label}
                </p>
                {loading ? (
                    <div className="h-7 w-16 bg-muted/50 rounded animate-pulse" />
                ) : (
                    <p className="text-[24px] font-bold tracking-tight text-foreground leading-none">
                        {formatNumber(value)}
                    </p>
                )}
            </div>
        </div>
    );
}