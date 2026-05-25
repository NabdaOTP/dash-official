"use client";

import { useCallback, useEffect, useState } from "react";
import {
    FlaskConical, Loader2, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
    getSandboxStatus, updateSandboxStatus,
} from "@/features/billing/services/billing-service";
import type { SandboxStatus } from "@/features/billing/types";

interface SandboxSettingsCardProps {
    projectId: string;
}

export function SandboxSettingsCard({ projectId }: SandboxSettingsCardProps) {
    const [status, setStatus] = useState<SandboxStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!projectId) return;
        setLoadError(null);
        try {
            const result = await getSandboxStatus(projectId);
            setStatus(result);
        } catch (err) {
            console.error("Failed to load sandbox status:", err);
            setLoadError("Couldn't load sandbox status");
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

        // Optimistic UI update — we'll roll back on error
        setStatus({ ...status, enabled: next });
        setUpdating(true);

        try {
            const updated = await updateSandboxStatus(projectId, next);
            setStatus(updated);
            toast.success(
                next ? "Sandbox mode enabled" : "Sandbox mode disabled"
            );
        } catch (err) {
            // Roll back
            setStatus((prev) => (prev ? { ...prev, enabled: !next } : null));
            const msg = err instanceof Error ? err.message : "";
            if (msg.includes("500") || msg.toLowerCase().includes("internal server")) {
                toast.error(
                    "This action isn't available yet. Please try again later."
                );
            } else {
                toast.error(msg || "Failed to update sandbox status");
            }
        } finally {
            setUpdating(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <CardShell>
                <div className="py-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[12.5px]">Loading sandbox status…</span>
                </div>
            </CardShell>
        );
    }

    // ── Load error ───────────────────────────────────────────
    if (loadError || !status) {
        return (
            <CardShell>
                <div className="rounded-lg bg-amber-50/60 border border-amber-200 p-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-[12.5px] text-amber-900 font-medium">
                            Sandbox status unavailable
                        </p>
                        <p className="text-[11.5px] text-amber-800/85 mt-0.5">
                            Couldn&apos;t load sandbox info. This feature may not be fully
                            available yet.
                        </p>
                    </div>
                </div>
            </CardShell>
        );
    }

    const remaining = Math.max(0, status.maxMessages - status.usedMessages);
    const usagePercent =
        status.maxMessages > 0
            ? Math.min(100, (status.usedMessages / status.maxMessages) * 100)
            : 0;

    return (
        <CardShell>
            {/* Toggle row */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-semibold text-foreground">
                            Sandbox Mode
                        </p>
                        {status.enabled && (
                            <span className="text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-[#7C3AED] text-white">
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                        Send test messages free of charge. When disabled, messages
                        consume credits from your balance.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={updating}
                    // aria-pressed={status.enabled}
                    aria-label="button"
                    className="cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-wait transition-opacity"
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

            {/* Usage stats (only when enabled) */}
            {status.enabled && status.maxMessages > 0 && (
                <div className="rounded-xl border border-[#7C3AED]/15 bg-[#F8F7FF] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {status.usedMessages.toLocaleString()}
                            </span>
                            {" / "}
                            {status.maxMessages.toLocaleString()} messages used
                        </span>
                        <span className="font-semibold text-[#7C3AED]">
                            {remaining.toLocaleString()} left
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white overflow-hidden border border-border/40">
                        <div
                            className="h-full bg-[#7C3AED] transition-all"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>
            )}
        </CardShell>
    );
}

// ─────────────────────────────────────────────────────────────
function CardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                    <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                        Sandbox & Testing
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                        Test messaging without using credits
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}