"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { verifyOtp } from "@/features/send-otp/services/otp-service";
import type { SendResult } from "@/features/send-otp/types";

type VerifyState =
    | { status: "idle" }
    | { status: "verifying" }
    | { status: "verified"; message: string }
    | { status: "failed"; message: string };

interface VerifyOtpFormProps {
    sendResult: SendResult;
    apiKey: string;
}

const CODE_LENGTH = 6;

export function VerifyOtpForm({ sendResult, apiKey }: VerifyOtpFormProps) {
    const [code, setCode] = useState("");
    const [state, setState] = useState<VerifyState>({ status: "idle" });

    const handleChange = (value: string) => {
        // Only allow digits, max CODE_LENGTH
        const cleaned = value.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
        setCode(cleaned);
        // Reset error state when user types
        if (state.status === "failed") setState({ status: "idle" });
    };

    const handleVerify = async () => {
        if (code.length < CODE_LENGTH) {
            toast.error(`Please enter the full ${CODE_LENGTH}-digit code`);
            return;
        }
        setState({ status: "verifying" });
        try {
            const result = await verifyOtp(apiKey, {
                to: sendResult.phoneNumber,
                code,
                purpose: sendResult.purpose,
            });
            const verified = result.verified ?? result.success ?? false;
            if (verified) {
                setState({
                    status: "verified",
                    message: result.message || "Code verified successfully",
                });
                toast.success("Code verified");
            } else {
                setState({
                    status: "failed",
                    message: result.message || "Invalid or expired code",
                });
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to verify code";
            setState({ status: "failed", message });
        }
    };

    const handleReset = () => {
        setCode("");
        setState({ status: "idle" });
    };

    const isVerified = state.status === "verified";
    const isFailed = state.status === "failed";
    const isVerifying = state.status === "verifying";

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-foreground">
                        Verify the code
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        Enter the code your recipient received to test verification
                    </p>
                </div>
            </div>

            {/* Code input — segmented style */}
            <div>
                <label className="block text-[12.5px] font-semibold text-foreground mb-2">
                    Verification code
                </label>
                <div className="relative">
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) => handleChange(e.target.value)}
                        disabled={isVerifying || isVerified}
                        maxLength={CODE_LENGTH}
                        placeholder="000000"
                        className={`w-full h-12 px-4 rounded-lg border bg-background text-center font-mono text-[20px] font-semibold tracking-[0.5em] outline-none transition-colors focus:ring-2 disabled:opacity-60 ${isVerified
                                ? "border-green-300 bg-green-50/30 focus:ring-green-500/20"
                                : isFailed
                                    ? "border-red-300 bg-red-50/30 focus:ring-red-500/20"
                                    : "border-border focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                            }`}
                    />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                    Recipient: <span className="font-mono">+{sendResult.phoneNumber}</span>
                </p>
            </div>

            {/* Status messages */}
            {isVerified && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-[12.5px] font-semibold text-green-900">
                            Verified successfully
                        </p>
                        <p className="text-[11.5px] text-green-800/85 mt-0.5">
                            {state.message}
                        </p>
                    </div>
                </div>
            )}

            {isFailed && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-[12.5px] font-semibold text-red-900">
                            Verification failed
                        </p>
                        <p className="text-[11.5px] text-red-800/85 mt-0.5">
                            {state.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                {!isVerified ? (
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={isVerifying || code.length < CODE_LENGTH}
                        className="cursor-pointer flex-1 h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying…
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4" />
                                Verify Code
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="cursor-pointer flex-1 h-10 px-4 rounded-lg text-[13px] font-medium text-foreground bg-muted/40 hover:bg-muted transition-colors"
                    >
                        Try Another Code
                    </button>
                )}
            </div>
        </div>
    );
}