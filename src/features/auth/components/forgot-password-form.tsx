"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/features/auth/services/auth-service";

const inputClass =
    "w-full h-11 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const locale = useLocale();
    const t = useTranslations("ForgotPasswordForm");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error(t("errorFillEmail"));
            return;
        }
        setLoading(true);
        try {
            await requestPasswordReset({ email: email.trim() });
            setSent(true);
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? t("errorSendFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border shadow-sm p-7 sm:p-8">
            {sent ? (
                <>
                    <div className="flex justify-center mb-5">
                        <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                            <Mail size={24} className="text-[#7C3AED]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                        {t("successTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-7">
                        {t("successSubtitle")}{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <Link
                        href={`/${locale}/login`}
                        className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={15} />
                        {t("backToLogin")}
                    </Link>
                </>
            ) : (
                <>
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-foreground mb-1.5">{t("title")}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{t("emailLabel")}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("emailPlaceholder")}
                                className={inputClass}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? t("sending") : t("sendResetLink")}
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
