"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/features/auth/services/auth-service";

const inputClass =
    "w-full h-11 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors";

export function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations("ResetPasswordForm");

    const token = searchParams.get("token") ?? "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error(t("errorMissingToken"));
            return;
        }
        if (!password.trim() || password.length < 8) {
            toast.error(t("errorPasswordLength"));
            return;
        }
        if (password !== confirmPassword) {
            toast.error(t("errorPasswordMatch"));
            return;
        }
        setLoading(true);
        try {
            await resetPassword({ token, password });
            setSuccess(true);
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? t("errorResetFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border shadow-sm p-7 sm:p-8">
            {success ? (
                <>
                    <div className="flex justify-center mb-5">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                        {t("successTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-7">
                        {t("successSubtitle")}
                    </p>
                    <Link
                        href={`/${locale}/login`}
                        className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {t("goToLogin")}
                    </Link>
                </>
            ) : (
                <>
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-foreground mb-1.5">{t("title")}</h1>
                        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{t("newPasswordLabel")}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("newPasswordPlaceholder")}
                                    className={`${inputClass} pr-11`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{t("passwordHint")}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{t("confirmPasswordLabel")}</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    className={`${inputClass} pr-11`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((s) => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? t("resetting") : t("resetPasswordBtn")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={`/${locale}/login`}
                            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            {t("backToLogin")}
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
