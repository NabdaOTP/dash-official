"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Phone, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import type { WabaPhoneNumber, WabaQualityRating } from "@/features/waba/types";

interface WabaPhoneNumberRowProps {
    phone: WabaPhoneNumber;
}

export function WabaPhoneNumberRow({ phone }: WabaPhoneNumberRowProps) {
    const t = useTranslations("waba.phone");
    const [copied, setCopied] = useState<"id" | "number" | null>(null);

    const handleCopy = async (value: string, field: "id" | "number") => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            toast.success(t("copied"));
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    const quality = phone.qualityRating ?? "UNKNOWN";
    const qualityStyle = getQualityStyle(quality);

    return (
        <div className="rounded-xl border border-border/60 bg-white p-4 hover:border-[#7C3AED]/30 transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Left: number + name */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[14px] font-semibold text-foreground">
                                {phone.displayPhoneNumber || t("noNumber")}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(phone.displayPhoneNumber, "number")
                                }
                                className="cursor-pointer w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label={t("copyNumber")}
                            >
                                {copied === "number" ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                    <Copy className="w-3 h-3 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                        {phone.verifiedName && (
                            <div className="text-[11.5px] text-muted-foreground mt-0.5">
                                {t("verifiedAs")}: <span className="text-foreground/80">{phone.verifiedName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: quality badge */}
                <div className="shrink-0">
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase tracking-wide ${qualityStyle.bg} ${qualityStyle.text}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${qualityStyle.dot}`} />
                        {t(`quality.${quality.toLowerCase()}`)}
                    </span>
                </div>
            </div>

            {/* Phone number ID — small dev-facing detail */}
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                <span className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">
                    {t("phoneIdLabel")}
                </span>
                <code className="flex-1 text-[11.5px] font-mono text-foreground/70 truncate">
                    {phone.phoneNumberId}
                </code>
                <button
                    type="button"
                    onClick={() => handleCopy(phone.phoneNumberId, "id")}
                    className="cursor-pointer text-[11px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors flex items-center gap-1 shrink-0"
                >
                    {copied === "id" ? (
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
    );
}

function getQualityStyle(quality: WabaQualityRating) {
    switch (quality) {
        case "GREEN":
            return {
                bg: "bg-green-50",
                text: "text-green-700",
                dot: "bg-green-500",
            };
        case "YELLOW":
            return {
                bg: "bg-yellow-50",
                text: "text-yellow-700",
                dot: "bg-yellow-500",
            };
        case "RED":
            return {
                bg: "bg-red-50",
                text: "text-red-700",
                dot: "bg-red-500",
            };
        default:
            return {
                bg: "bg-gray-100",
                text: "text-gray-600",
                dot: "bg-gray-400",
            };
    }
}