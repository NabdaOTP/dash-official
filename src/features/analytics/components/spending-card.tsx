"use client";

import { DollarSign, TrendingUp } from "lucide-react";

interface SpendingCardProps {
    totalSpent: number;
    days: number;
    loading?: boolean;
}

export function SpendingCard({ totalSpent, days, loading }: SpendingCardProps) {
    const dailyAvg = days > 0 ? totalSpent / days : 0;

    return (
        <div className="rounded-2xl bg-linear-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] p-5 text-white overflow-hidden relative shadow-lg shadow-[#7C3AED]/20">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                </div>

                <p className="text-[11px] uppercase tracking-wide font-semibold text-white/70 mb-1">
                    Total Spent
                </p>
                {loading ? (
                    <div className="h-9 w-24 bg-white/20 rounded animate-pulse mb-3" />
                ) : (
                    <p className="text-[28px] font-bold tracking-tight leading-none mb-3">
                        ${totalSpent.toFixed(2)}
                    </p>
                )}

                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
                        <TrendingUp className="w-3 h-3" />
                        Daily avg
                    </div>
                    {loading ? (
                        <div className="h-4 w-12 bg-white/20 rounded animate-pulse" />
                    ) : (
                        <span className="text-[13px] font-semibold">
                            ${dailyAvg.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}