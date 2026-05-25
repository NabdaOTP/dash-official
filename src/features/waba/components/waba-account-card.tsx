"use client";

import { useState } from "react";
import {
    Building2, Copy, Check, CheckCircle2, Phone, Clock,
    AlertTriangle, RefreshCw, Unlink, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
    getWabaReauthUrl,
} from "@/features/waba/services/waba-service";
import { openOAuthPopup } from "@/features/waba/lib/oauth-popup";
import type { WabaAccount } from "@/features/waba/types";

import { DisconnectWabaDialog } from "./disconnect-waba-dialog";

interface WabaAccountCardProps {
    account: WabaAccount;
    projectId: string;
    onRefresh: () => void;
}

export function WabaAccountCard({
    account,
    projectId,
    onRefresh,
}: WabaAccountCardProps) {
    const [copied, setCopied] = useState<"id" | "phoneId" | null>(null);
    const [reauthing, setReauthing] = useState(false);
    const [disconnectOpen, setDisconnectOpen] = useState(false);

    const handleCopy = async (value: string, field: "id" | "phoneId") => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            toast.success("Copied");
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleReauthorize = async () => {
        if (reauthing) return;
        setReauthing(true);
        try {
            const { connectUrl } = await getWabaReauthUrl(projectId, account.id);
            if (!connectUrl) {
                throw new Error("No reauth URL returned");
            }

            const result = await openOAuthPopup(connectUrl, "Reauthorize WhatsApp");

            if (result.completed) {
                toast.success("Reauthorization complete");
                onRefresh();
                window.setTimeout(onRefresh, 1500);
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (err) {
            console.error("Reauth failed:", err);
            toast.error("Couldn't start reauthorization. Please try again.");
        } finally {
            setReauthing(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    const expiryWarning = getExpiryWarning(
        account.daysUntilExpiry,
        account.needsReauth
    );

    // Show reauth button when token is expired or expiring within 7 days
    const showReauthButton =
        account.needsReauth || account.daysUntilExpiry <= 7;

    return (
        <>
            <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)]">
                {/* Header */}
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border/40 bg-gradient-to-br from-[#F8F7FF] to-white">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-[#7C3AED]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[15px] font-semibold text-foreground truncate">
                                    {account.name || "WhatsApp Business"}
                                </h3>
                                <p className="text-[12px] text-muted-foreground font-mono mt-0.5">
                                    {account.displayPhoneNumber}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {account.isActive && !account.needsReauth ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Connected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
                                    <AlertTriangle className="w-3 h-3" />
                                    {account.needsReauth ? "Reauth required" : "Inactive"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 py-5 space-y-4">
                    {/* Account ID */}
                    <DetailRow
                        label="Account ID"
                        value={account.id}
                        onCopy={() => handleCopy(account.id, "id")}
                        copied={copied === "id"}
                    />

                    {/* Phone Number ID */}
                    <DetailRow
                        label="Phone Number ID"
                        value={account.phoneNumberId}
                        onCopy={() => handleCopy(account.phoneNumberId, "phoneId")}
                        copied={copied === "phoneId"}
                        icon={<Phone className="w-3 h-3" />}
                        helper="Use this ID when sending OTPs via the API"
                    />

                    {/* Token expiry warning */}
                    <div
                        className={`rounded-xl border p-3 ${expiryWarning.bg} ${expiryWarning.border}`}
                    >
                        <div className="flex items-start gap-2.5">
                            <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${expiryWarning.icon}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-[12.5px] font-semibold ${expiryWarning.text}`}>
                                    {expiryWarning.title}
                                </p>
                                <p className={`text-[11.5px] mt-0.5 ${expiryWarning.subtext}`}>
                                    Token expires on {formatDate(account.tokenExpiresAt)} (
                                    {account.daysUntilExpiry}{" "}
                                    {account.daysUntilExpiry === 1 ? "day" : "days"} remaining)
                                </p>
                            </div>
                        </div>

                        {/* Reauthorize button — inside the warning card when needed */}
                        {showReauthButton && (
                            <div className="mt-2.5 pt-2.5 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={handleReauthorize}
                                    disabled={reauthing}
                                    className={`cursor-pointer h-8 px-3 rounded-lg text-[11.5px] font-medium transition-all flex items-center gap-1.5 disabled:opacity-60 ${expiryWarning.buttonClass
                                        }`}
                                >
                                    {reauthing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-3 h-3" />
                                    )}
                                    {reauthing ? "Opening Meta…" : "Reauthorize now"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Disconnect */}
                <div className="px-5 sm:px-6 py-3 bg-muted/20 border-t border-border/40 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setDisconnectOpen(true)}
                        className="cursor-pointer h-8 px-3 rounded-lg text-[11.5px] font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                        <Unlink className="w-3 h-3" />
                        Disconnect
                    </button>
                </div>
            </div>

            <DisconnectWabaDialog
                open={disconnectOpen}
                onClose={() => setDisconnectOpen(false)}
                projectId={projectId}
                account={account}
                onDisconnected={onRefresh}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────
function DetailRow({
    label, value, onCopy, copied, icon, helper,
}: {
    label: string;
    value: string;
    onCopy?: () => void;
    copied?: boolean;
    icon?: React.ReactNode;
    helper?: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-1.5">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <label className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">
                    {label}
                </label>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/40 border border-border/40">
                    <code className="text-[12px] font-mono text-foreground/85 truncate block">
                        {value}
                    </code>
                </div>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="cursor-pointer h-9 px-3 rounded-lg text-[11.5px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE]/60 transition-colors flex items-center gap-1 shrink-0"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                Copy
                            </>
                        )}
                    </button>
                )}
            </div>
            {helper && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {helper}
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function getExpiryWarning(daysUntilExpiry: number, needsReauth: boolean) {
    if (needsReauth || daysUntilExpiry <= 0) {
        return {
            title: "Token expired — reauthorization needed",
            bg: "bg-red-50/60",
            border: "border-red-200",
            text: "text-red-900",
            subtext: "text-red-800/85",
            icon: "text-red-600",
            buttonClass: "text-white bg-red-600 hover:bg-red-700",
        };
    }
    if (daysUntilExpiry <= 7) {
        return {
            title: "Token expiring soon",
            bg: "bg-red-50/40",
            border: "border-red-200",
            text: "text-red-900",
            subtext: "text-red-800/85",
            icon: "text-red-600",
            buttonClass: "text-white bg-red-600 hover:bg-red-700",
        };
    }
    if (daysUntilExpiry <= 30) {
        return {
            title: "Token expiring in less than a month",
            bg: "bg-yellow-50/60",
            border: "border-yellow-200",
            text: "text-yellow-900",
            subtext: "text-yellow-800/85",
            icon: "text-yellow-600",
            buttonClass: "text-yellow-900 bg-yellow-100 hover:bg-yellow-200",
        };
    }
    return {
        title: "Token is healthy",
        bg: "bg-green-50/40",
        border: "border-green-200",
        text: "text-green-900",
        subtext: "text-green-800/85",
        icon: "text-green-600",
        buttonClass: "text-green-900 bg-green-100 hover:bg-green-200",
    };
}