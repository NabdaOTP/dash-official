"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import { enable2FA, confirm2FA, disable2FA } from "@/features/auth/services/auth-service";

const inputClass =
    "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors";

export function TwoFactorSection() {
    const { user, refreshUser } = useAuth();

    const [twoFALoading, setTwoFALoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [twoFAAction, setTwoFAAction] = useState<"enable" | "disable">("enable");

    const handleStart2FA = async (action: "enable" | "disable") => {
        setTwoFAAction(action);
        if (action === "enable") {
            setTwoFALoading(true);
            try {
                await enable2FA();
                toast.success("Verification code sent to your email");
                setShowOtpInput(true);
            } catch (err: unknown) {
                toast.error((err as { message?: string })?.message ?? "Failed to send code");
            } finally {
                setTwoFALoading(false);
            }
        } else {
            setShowOtpInput(true);
        }
    };

    const handleConfirm2FA = async () => {
        if (!otpCode.trim() || otpCode.length !== 6) {
            toast.error("Please enter a 6-digit code");
            return;
        }
        setTwoFALoading(true);
        try {
            if (twoFAAction === "enable") {
                await confirm2FA(otpCode);
                toast.success("Two-factor authentication enabled");
            } else {
                await disable2FA(otpCode);
                toast.success("Two-factor authentication disabled");
            }
            await refreshUser();
            setShowOtpInput(false);
            setOtpCode("");
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Invalid code");
        } finally {
            setTwoFALoading(false);
        }
    };

    return (
        <div className="bg-background border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-green-600" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">Two-Factor Authentication</h2>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
            </div>

            {!showOtpInput ? (
                <>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-orange-800">
                            Protect your account by requiring a code from your authenticator app (like Google Authenticator or Authy) when you sign in.
                        </p>
                    </div>
                    <button
                        onClick={() => handleStart2FA(user?.twoFactorEnabled ? "disable" : "enable")}
                        disabled={twoFALoading}
                        className={`h-9 px-4 rounded-lg text-sm font-medium text-white cursor-pointer flex items-center gap-2 transition-colors ${user?.twoFactorEnabled
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-[#7C3AED] hover:bg-[#6D28D9]"
                            }`}
                    >
                        {twoFALoading && <Loader2 size={14} className="animate-spin" />}
                        <Shield size={14} />
                        {user?.twoFactorEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                    </button>
                </>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Enter the 6-digit verification code:</p>
                    <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        className={inputClass}
                        maxLength={6}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleConfirm2FA}
                            disabled={twoFALoading}
                            className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                            {twoFALoading && <Loader2 size={14} className="animate-spin" />}
                            Confirm
                        </button>
                        <button
                            onClick={() => { setShowOtpInput(false); setOtpCode(""); }}
                            className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
