"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { login } from "@/features/auth/services/auth-service";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loginWithTokens } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("LoginForm");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error(t("errorFillFields"));
            return;
        }
        setLoading(true);
        try {
            const result = await login({ email: email.trim(), password });
            if (result.requires2fa) {
                sessionStorage.setItem("nabda-otp-email", email.trim());
                router.push(`/${locale}/verify-otp`);
                return;
            }
            if (result.accessToken && result.refreshToken) {
                await loginWithTokens(result.accessToken, result.refreshToken);
            }
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? t("errorLoginFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)] p-6 sm:p-7">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[22px] font-bold text-foreground tracking-tight mb-1">
                    {t("title")}
                </h1>
                <p className="text-[13px] text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[13px] font-medium text-foreground">
                        {t("emailLabel")}
                    </label>
                    <div className="relative">
                        <Mail
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("emailPlaceholder")}
                            className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-border bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-[13px] font-medium text-foreground"
                        >
                            {t("passwordLabel")}
                        </label>
                        <Link
                            href={`/${locale}/forgot-password`}
                            className="text-[11.5px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                        >
                            {t("forgotPassword")}
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground cursor-pointer transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 mt-1 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13.5px] font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
                >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? t("signingIn") : t("signIn")}
                </button>
            </form>

            {/* Footer */}
            <p className="mt-5 text-center text-[13px] text-muted-foreground">
                {t("noAccount")}{" "}
                <Link
                    href={`/${locale}/signup`}
                    className="text-[#7C3AED] font-semibold hover:text-[#6D28D9] transition-colors"
                >
                    {t("signUp")}
                </Link>
            </p>
        </div>
    );
}
