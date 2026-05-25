"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { verifyOtp } from "@/features/send-otp/services/otp-service";
import type { SendResult } from "@/features/send-otp/types";

interface VerifyOtpFormProps {
    sendResult: SendResult;
    apiKey: string;
}

type VerifyStatus = "idle" | "loading" | "success" | "failed";

export function VerifyOtpForm({ sendResult, apiKey }: VerifyOtpFormProps) {
    const [code, setCode] = useState(sendResult.code ?? "");
    const [status, setStatus] = useState<VerifyStatus>("idle");

    const handleVerify = async () => {
        if (!code.trim() || status === "loading") return;
        setStatus("loading");
        try {
            const res = await verifyOtp(apiKey, {
                to: sendResult.phoneNumber,
                code: code.trim(),
                purpose: sendResult.purpose,
            });
            if (res.verified || res.success) {
                setStatus("success");
            } else {
                setStatus("failed");
            }
        } catch (err) {
            console.error("Verify OTP failed:", err);
            toast.error(err instanceof Error ? err.message : "Verification failed");
            setStatus("failed");
        }
    };

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                    <h2 className="text-[13.5px] font-semibold text-foreground">Verify OTP</h2>
                    <p className="text-[11.5px] text-muted-foreground">
                        Enter the code sent to {sendResult.phoneNumber}
                    </p>
                </div>
            </div>

            {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3.5 py-2.5 text-[13px] text-green-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    Code verified successfully
                </div>
            )}

            {status === "failed" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-800 font-medium">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Invalid or expired code
                </div>
            )}

            {status !== "success" && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            if (status === "failed") setStatus("idle");
                        }}
                        placeholder="Enter OTP code…"
                        maxLength={10}
                        className="flex-1 h-10 px-3.5 rounded-lg border border-border bg-background font-mono text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={!code.trim() || status === "loading"}
                        className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Verify"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
