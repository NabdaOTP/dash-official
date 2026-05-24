"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { getAnalyticsUsage } from "../services/analytics-service";
import type { AnalyticsUsage } from "../types";

export function UsageCard() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const projectId = params.projectId as string;

    const [usage, setUsage] = useState<AnalyticsUsage | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUsage = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getAnalyticsUsage(projectId);
            setUsage(data);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchUsage();
        })()
    }, [fetchUsage]);


    const currency = usage?.currency ?? "USD";
    const totalSpent = usage?.totalSpent ?? 0;

    return (
        <div className="relative bg-linear-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-2xl p-5 sm:p-6 overflow-hidden">
            {/* Decorative elements */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
                        <DollarSign size={18} className="text-white" />
                    </div>
                </div>

                <p className="text-[11px] font-medium text-white/70 mb-1 uppercase tracking-wide">
                    Total Spent
                </p>

                {loading ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                ) : (
                    <p className="text-3xl font-bold text-white mb-1 tabular-nums">
                        {currency} {totalSpent.toLocaleString()}
                    </p>
                )}

                <p className="text-[11.5px] text-white/70 mb-5">
                    Across all messages and services
                </p>

                <button
                    onClick={() =>
                        router.push(
                            `/${locale}/projects/${projectId}/credits/history`
                        )
                    }
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white hover:gap-2 transition-all cursor-pointer"
                >
                    View transaction history
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}