"use client";

import { useState } from "react";
import {
    CheckCircle2, Copy, Check, Clock, Hash, FileText, Target,
} from "lucide-react";
import { toast } from "sonner";
import type { SendResult } from "@/features/send-otp/types";

interface ResultCardProps {
    result: SendResult;
}

export function ResultCard({ result }: ResultCardProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            toast.success("Copied");
            setTimeout(() => setCopied(null), 1500);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

    return (
        <div className="rounded-2xl border border-green-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="bg-green-50/60 border-b border-green-100 px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                </div>
                <div>
                    <h3 className="text-[13.5px] font-semibold text-green-900">
                        OTP sent successfully
                    </h3>
                    <p className="text-[11.5px] text-green-800/75">
                        Message dispatched to WhatsApp
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3">
                <Detail
                    icon={<Target className="w-3.5 h-3.5" />}
                    label="To"
                    value={`+${result.phoneNumber}`}
                    mono
                    onCopy={() => handleCopy(result.phoneNumber, "to")}
                    copied={copied === "to"}
                />
                <Detail
                    icon={<FileText className="w-3.5 h-3.5" />}
                    label="Template"
                    value={result.templateName}
                    mono
                />
                <Detail
                    icon={<Hash className="w-3.5 h-3.5" />}
                    label="Purpose"
                    value={result.purpose}
                />
                {result.messageId && (
                    <Detail
                        icon={<Hash className="w-3.5 h-3.5" />}
                        label="Message ID"
                        value={result.messageId}
                        mono
                        truncate
                        onCopy={() => handleCopy(result.messageId!, "msgId")}
                        copied={copied === "msgId"}
                    />
                )}
                <Detail
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Sent at"
                    value={formatTime(result.sentAt)}
                />

                {/* Dev-mode code disclosure */}
                {result.code && (
                    <div className="rounded-lg bg-[#EDE9FE]/40 border border-[#7C3AED]/20 p-3 mt-2">
                        <div className="text-[10.5px] uppercase tracking-wide font-semibold text-[#7C3AED] mb-1">
                            Dev Mode Code
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <code className="font-mono text-[20px] font-bold tracking-[0.3em] text-foreground">
                                {result.code}
                            </code>
                            <button
                                type="button"
                                onClick={() => handleCopy(result.code!, "code")}
                                className="cursor-pointer h-8 px-2.5 rounded-md text-[11px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors flex items-center gap-1"
                            >
                                {copied === "code" ? (
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Detail({
    icon, label, value, mono, truncate, onCopy, copied,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
    truncate?: boolean;
    onCopy?: () => void;
    copied?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-[100px] text-[11.5px] text-muted-foreground shrink-0">
                <span>{icon}</span>
                {label}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <span
                    className={`flex-1 text-[12.5px] text-foreground ${mono ? "font-mono" : ""
                        } ${truncate ? "truncate" : ""}`}
                >
                    {value}
                </span>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="cursor-pointer w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                        aria-label={`Copy ${label}`}
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}