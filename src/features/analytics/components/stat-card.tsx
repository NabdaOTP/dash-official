"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
    variant?: "default" | "success" | "warning" | "danger" | "info";
    loading?: boolean;
}

const variantStyles = {
    default: {
        bg: "bg-purple-50",
        iconColor: "text-[#7C3AED]",
        border: "border-purple-100",
    },
    success: {
        bg: "bg-green-50",
        iconColor: "text-green-600",
        border: "border-green-100",
    },
    warning: {
        bg: "bg-amber-50",
        iconColor: "text-amber-600",
        border: "border-amber-100",
    },
    danger: {
        bg: "bg-red-50",
        iconColor: "text-red-500",
        border: "border-red-100",
    },
    info: {
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        border: "border-blue-100",
    },
};

export function StatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    trend,
    variant = "default",
    loading,
}: StatCardProps) {
    const styles = variantStyles[variant];

    return (
        <div className="bg-background rounded-2xl border border-border/60 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        styles.bg
                    )}
                >
                    <Icon size={18} className={styles.iconColor} />
                </div>
                {trend && !loading && (
                    <span
                        className={cn(
                            "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                            trend.isPositive
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                        )}
                    >
                        {trend.isPositive ? "+" : ""}
                        {trend.value}%
                    </span>
                )}
            </div>

            <p className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                {label}
            </p>

            {loading ? (
                <div className="h-8 w-20 bg-muted/60 rounded animate-pulse mb-1" />
            ) : (
                <p className="text-2xl font-bold text-foreground mb-1 tabular-nums">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            )}

            {subtitle && (
                <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
        </div>
    );
}