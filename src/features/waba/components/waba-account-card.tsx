"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    Building2, Copy, Check, CheckCircle2, Phone, Clock,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import type { WabaAccount } from "@/features/waba/types";

interface WabaAccountCardProps {
    account: WabaAccount;
}

export function WabaAccountCard({ account }: WabaAccountCardProps) {
    const t = useTranslations("waba.account");
    const locale = useLocale();
    const [copied, setCopied] = useState<"id" | "phoneId" | null>(null);

    const handleCopy = async (value: string, field: "id" | "phoneId") => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            toast.success(t("copied"));
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    // Token expiry warning level
    const expiryWarning = getExpiryWarning(
        account.daysUntilExpiry,
        account.needsReauth
    );

    return (
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

            {/* Details body */}
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

                {/* Token expiry */}
                <div
                    className={`rounded-xl border p-3 flex items-start gap-2.5 ${expiryWarning.bg} ${expiryWarning.border}`}
                >
                    <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${expiryWarning.icon}`} />
                    <div className="flex-1 min-w-0">
                        <p className={`text-[12.5px] font-semibold ${expiryWarning.text}`}>
                            {expiryWarning.title}
                        </p>
                        <p className={`text-[11.5px] mt-0.5 ${expiryWarning.subtext}`}>
                            Token expires on {formatDate(account.tokenExpiresAt)} ({account.daysUntilExpiry}{" "}
                            {account.daysUntilExpiry === 1 ? "day" : "days"} remaining)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function DetailRow({
    label,
    value,
    onCopy,
    copied,
    icon,
    helper,
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
// Determine warning style based on days until expiry
// ─────────────────────────────────────────────────────────────
function getExpiryWarning(daysUntilExpiry: number, needsReauth: boolean) {
    if (needsReauth || daysUntilExpiry <= 0) {
        return {
            title: "Token expired — reauthentication needed",
            bg: "bg-red-50/60",
            border: "border-red-200",
            text: "text-red-900",
            subtext: "text-red-800/85",
            icon: "text-red-600",
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
        };
    }
    return {
        title: "Token is healthy",
        bg: "bg-green-50/40",
        border: "border-green-200",
        text: "text-green-900",
        subtext: "text-green-800/85",
        icon: "text-green-600",
    };
}