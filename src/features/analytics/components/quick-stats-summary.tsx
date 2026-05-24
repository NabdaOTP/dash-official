"use client";

import { Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { AnalyticsDashboard } from "@/features/analytics/types";

interface QuickStatsSummaryProps {
    data: AnalyticsDashboard;
    days: number;
    loading?: boolean;
}

export function QuickStatsSummary({ data, days, loading }: QuickStatsSummaryProps) {
    const dailyAvg = days > 0 ? data.totalSent / days : 0;
    const readRate =
        data.totalSent > 0 ? (data.read / data.totalSent) * 100 : 0;

    // Health indicator based on success rate
    const health = getHealthStatus(data.successRate, data.totalSent);

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                    <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                        Performance Summary
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                        Key insights for this period
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InsightRow
                    label="Daily average"
                    value={loading ? "—" : Math.round(dailyAvg).toLocaleString()}
                    suffix="messages/day"
                />
                <InsightRow
                    label="Read rate"
                    value={loading ? "—" : `${readRate.toFixed(1)}%`}
                    suffix="of delivered"
                />
                <InsightRow
                    label="Success rate"
                    value={loading ? "—" : `${data.successRate.toFixed(1)}%`}
                    trend={getTrendForRate(data.successRate, "up")}
                    color={getColorForRate(data.successRate, "up")}
                />
                <InsightRow
                    label="Failure rate"
                    value={loading ? "—" : `${data.failedRate.toFixed(1)}%`}
                    trend={getTrendForRate(data.failedRate, "down")}
                    color={getColorForRate(data.failedRate, "down")}
                />
            </div>

            {/* Health indicator */}
            {!loading && data.totalSent > 0 && (
                <div
                    className={`mt-4 pt-4 border-t border-border/40 flex items-center gap-2.5 ${health.textColor}`}
                >
                    <div className={`w-2 h-2 rounded-full ${health.dotColor}`} />
                    <p className="text-[12px] font-medium leading-tight">
                        {health.label}
                    </p>
                </div>
            )}

            {!loading && data.totalSent === 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                    <p className="text-[11.5px] text-muted-foreground">
                        Send your first message to start tracking performance.
                    </p>
                </div>
            )}
        </div>
    );
}

function InsightRow({
    label,
    value,
    suffix,
    trend,
    color,
}: {
    label: string;
    value: string;
    suffix?: string;
    trend?: "up" | "down" | "flat";
    color?: string;
}) {
    return (
        <div className="rounded-lg bg-muted/30 px-3 py-2.5">
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
                {label}
            </p>
            <div className="flex items-baseline gap-1.5">
                <span
                    className={`text-[16px] font-bold leading-none ${color ?? "text-foreground"
                        }`}
                >
                    {value}
                </span>
                {trend === "up" && (
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                )}
                {trend === "down" && (
                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                )}
                {trend === "flat" && (
                    <Minus className="w-3 h-3 text-muted-foreground" />
                )}
            </div>
            {suffix && (
                <p className="text-[10.5px] text-muted-foreground mt-0.5">
                    {suffix}
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Health rules:
// - successRate >= 95% → Excellent (green)
// - successRate >= 85% → Good (yellow)
// - successRate < 85%  → Needs attention (red)
// - totalSent < 10     → Insufficient data (gray)
// ─────────────────────────────────────────────────────────────
function getHealthStatus(successRate: number, totalSent: number) {
    if (totalSent < 10) {
        return {
            label: "Not enough data yet — send more messages to see health insights.",
            dotColor: "bg-gray-400",
            textColor: "text-muted-foreground",
        };
    }
    if (successRate >= 95) {
        return {
            label: "Excellent delivery health — your messages are reaching users reliably.",
            dotColor: "bg-green-500",
            textColor: "text-green-800",
        };
    }
    if (successRate >= 85) {
        return {
            label: "Good delivery health — consider reviewing failed messages for issues.",
            dotColor: "bg-yellow-500",
            textColor: "text-yellow-800",
        };
    }
    return {
        label: "Delivery health needs attention — check for invalid numbers or template issues.",
        dotColor: "bg-red-500",
        textColor: "text-red-800",
    };
}

function getTrendForRate(
    rate: number,
    higherIsBetter: "up" | "down"
): "up" | "down" | "flat" {
    if (rate === 0) return "flat";
    if (higherIsBetter === "up") {
        return rate >= 90 ? "up" : rate < 80 ? "down" : "flat";
    }
    // higherIsBetter === "down" (e.g. failure rate)
    return rate <= 5 ? "up" : rate > 15 ? "down" : "flat";
}

function getColorForRate(
    rate: number,
    higherIsBetter: "up" | "down"
): string {
    if (rate === 0) return "text-foreground";
    if (higherIsBetter === "up") {
        return rate >= 90
            ? "text-green-700"
            : rate < 80
                ? "text-red-700"
                : "text-foreground";
    }
    return rate <= 5
        ? "text-green-700"
        : rate > 15
            ? "text-red-700"
            : "text-foreground";
}