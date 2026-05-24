"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { verifyOtp } from "@/features/auth/services/auth-service";
import { useAuth } from "@/features/auth/context/auth-context";
import { Input } from "@/components/ui/input";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { loginWithTokens } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("VerifyOtpPage");

    const [email, setEmail] = useState("");

    useEffect(() => {
        (async () => {
            const storedEmail = sessionStorage.getItem("nabda-otp-email");
            if (!storedEmail) {
                router.replace(`/${locale}/login`);
                return;
            }
            setEmail(storedEmail);
            inputRefs.current[0]?.focus();
        })()
    }, [router, locale]);

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every((d) => d !== "")) {
            handleSubmit(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!text) return;

        const newOtp = [...otp];
        for (let i = 0; i < text.length; i++) {
            newOtp[i] = text[i];
        }
        setOtp(newOtp);

        const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();

        if (newOtp.every((d) => d !== "")) {
            handleSubmit(newOtp.join(""));
        }
    };

    const handleSubmit = async (code?: string) => {
        const otpCode = code ?? otp.join("");

        if (otpCode.length !== OTP_LENGTH) {
            toast.error(t("errorIncomplete"));
            return;
        }

        setLoading(true);
        try {
            const result = await verifyOtp({ email, code: otpCode });

            sessionStorage.removeItem("nabda-otp-email");

            if (result.accessToken && result.refreshToken) {
                await loginWithTokens(result.accessToken, result.refreshToken);
            }
        } catch (err: unknown) {
            const message =
                (err as { message?: string })?.message ?? t("errorInvalidCode");
            toast.error(message);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">N</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-foreground text-center mb-1">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                        {t("subtitle")}{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </p>

                    {/* OTP inputs */}
                    <div className="flex justify-center gap-2.5 mb-6">
                        {otp.map((digit, i) => (
                            <Input
                                key={i}
                                ref={(el) => {
                                    inputRefs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                disabled={loading}
                                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || otp.some((d) => !d)}
                        className="w-full h-10 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? t("verifying") : t("verify")}
                    </button>

                    {/* Back to login */}
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem("nabda-otp-email");
                            router.push(`/${locale}/login`);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={14} />
                        {t("backToLogin")}
                    </button>
                </div>
            </div>
        </div>
    );
}
