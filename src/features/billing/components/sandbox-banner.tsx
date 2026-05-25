"use client";

import { useCallback, useEffect, useState } from "react";
import {
    FlaskConical, Loader2, ToggleLeft, ToggleRight, AlertCircle, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
    getSandboxStatus, updateSandboxStatus,
} from "@/features/billing/services/billing-service";
import type { SandboxStatus } from "@/features/billing/types";

interface SandboxCardProps {
    projectId: string;
}

export function SandboxCard({ projectId }: SandboxCardProps) {
    const [status, setStatus] = useState<SandboxStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (!projectId) return;
        setLoadError(false);
        try {
            const result = await getSandboxStatus(projectId);
            setStatus(result);
        } catch (err) {
            console.error("Failed to load sandbox status:", err);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchStatus();
        })()
    }, [fetchStatus]);

    

    const handleToggle = async () => {
        if (!status || updating) return;
        const next = !status.enabled;

        // Optimistic update
        setStatus({ ...status, enabled: next });
        setUpdating(true);

        try {
            const updated = await updateSandboxStatus(projectId, next);
            setStatus(updated);
            toast.success(
                next ? "Sandbox mode enabled" : "Sandbox mode disabled"
            );
        } catch (err) {
            // Rollback
            setStatus((prev) => (prev ? { ...prev, enabled: !next } : null));
            const msg = err instanceof Error ? err.message : "";
            toast.error(msg || "Failed to update sandbox status");
        } finally {
            setUpdating(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="rounded-2xl border border-border/60 bg-white p-5 mb-6 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // ── Load error — hide silently ───────────────────────────
    if (loadError || !status) {
        return null;
    }

    const remaining = Math.max(0, status.maxMessages - status.usedMessages);
    const usagePercent =
        status.maxMessages > 0
            ? Math.min(100, (status.usedMessages / status.maxMessages) * 100)
            : 0;

    const isLow = status.enabled && remaining > 0 && remaining < status.maxMessages * 0.2;
    const isExhausted = status.enabled && remaining === 0;

    // Variant styles based on state
    const variant = isExhausted
        ? {
            border: "border-red-200",
            bg: "bg-red-50/40",
            iconBg: "bg-red-100",
            iconColor: "text-red-700",
            accentColor: "text-red-700",
            barColor: "bg-red-500",
        }
        : isLow
            ? {
                border: "border-amber-200",
                bg: "bg-amber-50/40",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-700",
                accentColor: "text-amber-700",
                barColor: "bg-amber-500",
            }
            : status.enabled
                ? {
                    border: "border-[#7C3AED]/20",
                    bg: "bg-gradient-to-br from-[#F8F7FF] to-white",
                    iconBg: "bg-[#EDE9FE]",
                    iconColor: "text-[#7C3AED]",
                    accentColor: "text-[#7C3AED]",
                    barColor: "bg-[#7C3AED]",
                }
                : {
                    border: "border-border/60",
                    bg: "bg-white",
                    iconBg: "bg-muted/40",
                    iconColor: "text-muted-foreground",
                    accentColor: "text-foreground",
                    barColor: "bg-muted",
                };

    return (
        <div
            className={`rounded-2xl border ${variant.border} ${variant.bg} p-5 mb-6 transition-all`}
        >
            {/* Toggle row */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                        className={`w-10 h-10 rounded-xl ${variant.iconBg} flex items-center justify-center shrink-0`}
                    >
                        <FlaskConical className={`w-5 h-5 ${variant.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[14px] font-semibold text-foreground">
                                Sandbox Mode
                            </h3>
                            {status.enabled && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-[#7C3AED] text-white">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Free
                                </span>
                            )}
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                            {isExhausted
                                ? "You've used all your free sandbox messages. Disable sandbox or add credits to continue."
                                : isLow
                                    ? "You're running low on sandbox messages."
                                    : status.enabled
                                        ? `Test up to ${status.maxMessages} messages free — no credits used.`
                                        : `Enable to send up to ${status.maxMessages || 250} test messages free of charge.`
                            }
                        </p>
                    </div>

                    <button
                        aria-label="button"
                        type="button"
                        onClick={handleToggle}
                        disabled={updating}
                        // aria-pressed={status.enabled}
                        className="cursor-pointer shrink-0 disabled:cursor-wait transition-opacity"
                    >
                        {updating ? (
                            <div className="w-11 h-7 rounded-full bg-muted flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                            </div>
                        ) : status.enabled ? (
                            <ToggleRight className="w-11 h-7 text-[#7C3AED]" />
                        ) : (
                            <ToggleLeft className="w-11 h-7 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Usage bar (only when enabled) */}
            {status.enabled && status.maxMessages > 0 && (
                <div className="mt-4 pt-4 border-t border-current/10">
                    <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                        <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {status.usedMessages.toLocaleString()}
                            </span>
                            {" / "}
                            {status.maxMessages.toLocaleString()} messages used
                        </span>
                        <span className={`font-semibold ${variant.accentColor}`}>
                            {remaining.toLocaleString()} left
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white border border-border/40 overflow-hidden">
                        <div
                            className={`h-full ${variant.barColor} transition-all`}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}