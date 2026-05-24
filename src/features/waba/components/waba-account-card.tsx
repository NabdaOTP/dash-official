"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Building2, Copy, Check, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import type { WabaAccount } from "@/features/waba/types";
import { WabaPhoneNumberRow } from "./waba-phone-number-row";

interface WabaAccountCardProps {
    account: WabaAccount;
}

export function WabaAccountCard({ account }: WabaAccountCardProps) {
    const t = useTranslations("waba.account");
    const locale = useLocale();
    const [copied, setCopied] = useState(false);

    const handleCopyWabaId = async () => {
        try {
            await navigator.clipboard.writeText(account.wabaAccountId);
            setCopied(true);
            toast.success(t("copied"));
            setTimeout(() => setCopied(false), 2000);
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

    const phoneNumbers = account.phoneNumbers ?? [];
    const businessName = account.businessName || t("unnamedBusiness");

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
                                {businessName}
                            </h3>
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                {t("connectedOn")} {formatDate(account.createdAt)}
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("connected")}
                    </span>
                </div>

                {/* WABA ID row */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">
                        {t("wabaIdLabel")}
                    </span>
                    <code className="flex-1 min-w-0 text-[12px] font-mono text-foreground/80 truncate px-2 py-1 rounded bg-white border border-border/40">
                        {account.wabaAccountId}
                    </code>
                    <button
                        type="button"
                        onClick={handleCopyWabaId}
                        className="cursor-pointer h-7 px-2 rounded-md text-[11px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE]/60 transition-colors flex items-center gap-1 shrink-0"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3" />
                                {t("copied")}
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                {t("copy")}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Phone numbers section */}
            <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                        {t("phoneNumbersLabel")} ({phoneNumbers.length})
                    </h4>
                </div>

                {phoneNumbers.length > 0 ? (
                    <div className="space-y-2.5">
                        {phoneNumbers.map((phone) => (
                            <WabaPhoneNumberRow key={phone.id} phone={phone} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 py-6 px-4 text-center">
                        <p className="text-[12.5px] text-muted-foreground">
                            {t("noPhoneNumbers")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}