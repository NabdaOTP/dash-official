"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    MessageSquare, Send, CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getAnalyticsSummary } from "../services/analytics-service";
import type { AnalyticsSummary } from "../types";
import { StatCard } from "./stat-card";

export function AnalyticsOverview() {
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
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to load analytics"
            );
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchSummary();
        })()
    }, [fetchSummary]);



    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Analytics Overview
                    </h2>
                    <p className="text-[12px] text-muted-foreground">
                        Message statistics for this project
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    icon={MessageSquare}
                    label="Total Messages"
                    value={summary?.total ?? 0}
                    variant="default"
                    loading={loading}
                />
                <StatCard
                    icon={Send}
                    label="Sent"
                    value={summary?.sent ?? 0}
                    variant="info"
                    loading={loading}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Delivered"
                    value={summary?.delivered ?? 0}
                    variant="success"
                    loading={loading}
                />
                <StatCard
                    icon={XCircle}
                    label="Failed"
                    value={summary?.failed ?? 0}
                    variant="danger"
                    loading={loading}
                />
            </div>
        </div>
    );
}