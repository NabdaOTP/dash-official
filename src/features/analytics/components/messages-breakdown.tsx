"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart3, Loader2 } from "lucide-react";
import { getAnalyticsSummary } from "../services/analytics-service";
import type { AnalyticsSummary } from "../types";

interface MetricRow {
    label: string;
    count: number;
    total: number;
    color: string;
    bgColor: string;
}

function calcRate(count: number, total: number) {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
}

function ProgressRow({ label, count, total, color, bgColor }: MetricRow) {
    const rate = calcRate(count, total);

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12.5px] font-medium text-foreground">
                    {label}
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-[12.5px] font-semibold text-foreground tabular-nums">
                        {count.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                        {rate}%
                    </span>
                </div>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${bgColor}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${rate}%` }}
                />
            </div>
        </div>
    );
}

export function MessagesBreakdown() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getAnalyticsSummary(projectId);
            setSummary(data);
        } catch {
            // silent fail — main analytics overview already shows errors
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchSummary();
        })()
    }, [fetchSummary]);

    const total = summary?.total ?? 0;

    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <BarChart3 size={16} className="text-[#7C3AED]" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Message Performance
                    </h2>
                    <p className="text-[11.5px] text-muted-foreground">
                        Delivery and engagement breakdown
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
            ) : total === 0 ? (
                <div className="text-center py-8">
                    <BarChart3
                        size={28}
                        className="mx-auto text-muted-foreground/40 mb-2"
                    />
                    <p className="text-[13px] font-medium text-foreground mb-1">
                        No data yet
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                        Send your first message to see analytics here
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <ProgressRow
                        label="Sent"
                        count={summary?.sent ?? 0}
                        total={total}
                        color="bg-blue-500"
                        bgColor="bg-blue-50"
                    />
                    <ProgressRow
                        label="Delivered"
                        count={summary?.delivered ?? 0}
                        total={total}
                        color="bg-green-500"
                        bgColor="bg-green-50"
                    />
                    <ProgressRow
                        label="Read"
                        count={summary?.read ?? 0}
                        total={total}
                        color="bg-[#7C3AED]"
                        bgColor="bg-purple-50"
                    />
                    <ProgressRow
                        label="Failed"
                        count={summary?.failed ?? 0}
                        total={total}
                        color="bg-red-500"
                        bgColor="bg-red-50"
                    />
                </div>
            )}
        </div>
    );
}