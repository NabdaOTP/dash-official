"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart2 } from "lucide-react";
import type { AnalyticsDailyEntry } from "@/features/analytics/types";

type MetricKey = "all" | "delivered" | "failed";

interface DailyChartProps {
    data: AnalyticsDailyEntry[];
    loading?: boolean;
}

const METRICS: { id: MetricKey; label: string; color: string }[] = [
    { id: "all", label: "All", color: "#7C3AED" },
    { id: "delivered", label: "Delivered", color: "#16a34a" },
    { id: "failed", label: "Failed", color: "#dc2626" },
];

export function DailyChart({ data, loading }: DailyChartProps) {
    const [metric, setMetric] = useState<MetricKey>("all");
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Normalize data — pull the right field per metric
    const series = useMemo(() => {
        return data.map((entry) => {
            let value = 0;
            switch (metric) {
                case "all":
                    value = entry.total ?? entry.sent ?? 0;
                    break;
                case "delivered":
                    value = entry.delivered ?? 0;
                    break;
                case "failed":
                    value = entry.failed ?? 0;
                    break;
            }
            return { date: entry.date, value };
        });
    }, [data, metric]);

    const maxValue = useMemo(
        () => Math.max(1, ...series.map((s) => s.value)),
        [series]
    );

    const total = useMemo(
        () => series.reduce((sum, s) => sum + s.value, 0),
        [series]
    );

    const activeColor =
        METRICS.find((m) => m.id === metric)?.color ?? "#7C3AED";

    // ── Loading 
    if (loading) {
        return (
            <ChartShell>
                <div className="h-[240px] flex items-center justify-center">
                    <div className="text-[12px] text-muted-foreground">Loading chart…</div>
                </div>
            </ChartShell>
        );
    }

    // ── Empty state ──────────────────────────────────────────
    if (!data.length || total === 0) {
        return (
            <ChartShell>
                <div className="h-[240px] flex flex-col items-center justify-center text-center px-4">
                    <div className="w-11 h-11 rounded-xl bg-muted/40 flex items-center justify-center mb-2">
                        <BarChart2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-[13px] font-semibold text-foreground mb-0.5">
                        No data for this period
                    </p>
                    <p className="text-[11.5px] text-muted-foreground max-w-xs">
                        Send your first OTP to see daily message activity here.
                    </p>
                </div>
            </ChartShell>
        );
    }

    return (
        <ChartShell
            metric={metric}
            onMetricChange={setMetric}
            total={total}
            activeColor={activeColor}
        >
            <div className="relative">
                {/* Chart */}
                <div className="flex items-end gap-1 h-[180px] px-1 pt-2">
                    {series.map((point, i) => {
                        const heightPct = (point.value / maxValue) * 100;
                        const isHovered = hoverIndex === i;
                        return (
                            <div
                                key={point.date}
                                className="flex-1 flex flex-col items-center justify-end group cursor-pointer relative"
                                onMouseEnter={() => setHoverIndex(i)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute -top-12 z-10 pointer-events-none">
                                        <div className="bg-foreground text-white rounded-lg px-2.5 py-1.5 shadow-lg text-center whitespace-nowrap">
                                            <div className="text-[10px] opacity-70">
                                                {formatTooltipDate(point.date)}
                                            </div>
                                            <div className="text-[12px] font-semibold">
                                                {point.value.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
                                    </div>
                                )}

                                {/* Bar */}
                                <div
                                    className="w-full rounded-sm transition-all relative overflow-hidden"
                                    style={{
                                        height: `${Math.max(heightPct, 2)}%`,
                                        backgroundColor: isHovered
                                            ? activeColor
                                            : `${activeColor}33`, // 20% opacity
                                        minHeight: point.value > 0 ? "3px" : "2px",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 transition-opacity"
                                        style={{
                                            backgroundColor: activeColor,
                                            opacity: isHovered ? 1 : 0.65,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X-axis labels — show ~5 evenly spaced */}
                <div className="flex justify-between mt-2 px-1 text-[10px] text-muted-foreground">
                    {pickAxisLabels(series).map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>
            </div>
        </ChartShell>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers & sub-components
// ─────────────────────────────────────────────────────────────

function ChartShell({
    children,
    metric,
    onMetricChange,
    total,
    activeColor,
}: {
    children: React.ReactNode;
    metric?: MetricKey;
    onMetricChange?: (m: MetricKey) => void;
    total?: number;
    activeColor?: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                            Messages Over Time
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Daily activity breakdown
                        </p>
                    </div>
                </div>

                {onMetricChange && metric && total !== undefined && (
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {total.toLocaleString()}
                            </span>{" "}
                            total
                        </span>
                        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border/40">
                            {METRICS.map((m) => {
                                const active = m.id === metric;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => onMetricChange(m.id)}
                                        className={`cursor-pointer h-6 px-2 rounded-md text-[10.5px] font-semibold transition-all flex items-center gap-1 ${active
                                            ? "bg-white shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        style={active ? { color: m.color } : undefined}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: m.color }}
                                        />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}

function pickAxisLabels(series: { date: string }[]): string[] {
    if (series.length === 0) return [];
    if (series.length <= 7) {
        return series.map((s) => formatAxisDate(s.date));
    }

    // Pick 5 evenly spaced labels
    const count = 5;
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
        const idx = Math.round((i * (series.length - 1)) / (count - 1));
        result.push(formatAxisDate(series[idx].date));
    }
    return result;
}

function formatAxisDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    } catch {
        return iso;
    }
}

function formatTooltipDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}