"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Tag } from "lucide-react";
import { toast } from "sonner";
import { register } from "@/features/auth/services/auth-service";
import { useAuth } from "@/features/auth/context/auth-context";

function getPasswordStrength(password: string): { score: number; key: string; color: string } {
    if (!password) return { score: 0, key: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, key: "strengthWeak", color: "bg-red-500" };
    if (score <= 3) return { score, key: "strengthMedium", color: "bg-yellow-500" };
    return { score, key: "strengthStrong", color: "bg-green-500" };
}

export function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loginWithTokens } = useAuth();
    const locale = useLocale();
    const t = useTranslations("SignupForm");

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error(t("errorFillFields"));
            return;
        }
        if (password.length < 8) {
            toast.error(t("errorPasswordLength"));
            return;
        }
        setLoading(true);
        try {
            const result = await register({
                name: name.trim(),
                email: email.trim(),
                password,
                ...(referralCode.trim() && { referralCode: referralCode.trim() }),
            });
            toast.success(t("successCreated"));
            if (result.accessToken && result.refreshToken) {
                await loginWithTokens(result.accessToken, result.refreshToken);
            }
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? t("errorRegistrationFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)] p-7 sm:p-8">
            {/* Header */}
            <div className="mb-7">
                <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-1.5">
                    {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                        {t("fullNameLabel")}
                    </label>
                    <div className="relative">
                        <User
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("fullNamePlaceholder")}
                            className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                            autoComplete="name"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        {t("emailLabel")}
                    </label>
                    <div className="relative">
                        <Mail
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("emailPlaceholder")}
                            className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                    >
                        {t("passwordLabel")}
                    </label>
                    <div className="relative">
                        <Lock
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("passwordPlaceholder")}
                            className="w-full h-11 pl-10 pr-11 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground cursor-pointer transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Password strength indicator */}
                    {password && (
                        <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span
                                className={`text-[11px] font-medium ${strength.score <= 2
                                        ? "text-red-500"
                                        : strength.score <= 3
                                            ? "text-yellow-600"
                                            : "text-green-600"
                                    }`}
                            >
                                {strength.key && t(strength.key as "strengthWeak" | "strengthMedium" | "strengthStrong")}
                            </span>
                        </div>
                    )}
                    {!password && (
                        <p className="text-[11px] text-muted-foreground">
                            {t("passwordHint")}
                        </p>
                    )}
                </div>

                {/* Referral code (optional) */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="referral"
                        className="text-sm font-medium text-foreground"
                    >
                        {t("referralLabel")}{" "}
                        <span className="text-muted-foreground font-normal">
                            {t("referralOptional")}
                        </span>
                    </label>
                    <div className="relative">
                        <Tag
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                        />
                        <input
                            id="referral"
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            placeholder={t("referralPlaceholder")}
                            className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? t("creatingAccount") : t("createAccount")}
                </button>

                {/* Terms */}
                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                    {t("termsText")}{" "}
                    <a
                        href="https://www.nabda-otp.com/terms-of-service"
                        className="text-[#7C3AED] hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("termsOfService")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                        href="https://www.nabda-otp.com/privacy-policy"
                        className="text-[#7C3AED] hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("privacyPolicy")}
                    </a>
                </p>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("haveAccount")}{" "}
                <Link
                    href={`/${locale}/login`}
                    className="text-[#7C3AED] font-semibold hover:text-[#6D28D9] transition-colors"
                >
                    {t("signIn")}
                </Link>
            </p>
        </div>
    );
}
