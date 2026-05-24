"use client";

import Image from "next/image";
import { Shield, Zap, Globe, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const t = useTranslations("AuthLayout");

    const features = [
        { icon: Shield, label: t("featureSecurityLabel"), desc: t("featureSecurityDesc") },
        { icon: Zap, label: t("featureSpeedLabel"), desc: t("featureSpeedDesc") },
        { icon: Globe, label: t("featureGlobalLabel"), desc: t("featureGlobalDesc") },
    ];

    const trustPoints = [
        t("trustFreeTrial"),
        t("trustNoCreditCard"),
        t("trustCancelAnytime"),
    ];

    return (
        <div className="min-h-screen flex bg-[#F8F7FF]">
            {/* Left brand panel (desktop only) */}
            <div className="hidden lg:flex w-[44%] xl:w-[48%] flex-col relative overflow-hidden bg-linear-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95]">
                {/* decorative circles */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-white/[0.03] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full space-y-3 p-10 xl:p-14">
                    {/* Logo */}
                    <a
                        href="https://www.nabdaotp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group w-fit"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/10 group-hover:bg-white/20 transition-colors">
                            <Image src="/logo.png" alt="Nabda OTP" width={50} height={50} />
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">
                            Nabda OTP
                        </span>
                    </a>

                    {/* Main copy */}
                    <div className="flex-1 flex flex-col justify-center max-w-md">
                        <h1 className="text-[2rem] xl:text-[2.5rem] font-bold text-white leading-[1.15] tracking-tight mb-5">
                            {t("heroTitle")}
                            <br />
                            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {t("heroTitleHighlight")}
                            </span>
                        </h1>
                        <p className="text-white/70 text-[15px] leading-relaxed mb-10">
                            {t("heroSubtitle")}
                        </p>

                        <div className="space-y-4 mb-10">
                            {features.map(({ icon: Icon, label, desc }) => (
                                <div key={label} className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/10">
                                        <Icon size={16} className="text-white" />
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-white text-[14px] font-semibold leading-tight mb-0.5">
                                            {label}
                                        </p>
                                        <p className="text-white/55 text-xs leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust points */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {trustPoints.map((point) => (
                                <div
                                    key={point}
                                    className="flex items-center gap-1.5 text-white/70 text-xs"
                                >
                                    <Check size={12} strokeWidth={3} className="text-green-300" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-white/35 text-xs">
                        {t("copyright", { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 sm:px-8 py-5 shrink-0">
                    {/* Mobile-only logo */}
                    <a
                        href="https://www.nabdaotp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 lg:hidden"
                    >
                        <Image src="/logo.png" alt="Nabda OTP" width={40} height={40} />
                        <span className="font-bold text-base text-foreground tracking-tight">
                            Nabda OTP
                        </span>
                    </a>
                    <div className="hidden lg:block" />
                    {/* <LanguageSwitcher /> */}
                </div>

                {/* Form area */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 lg:py-10">
                    <div className="w-full max-w-[420px]">{children}</div>
                </div>

                {/* Mobile footer */}
                <p className="lg:hidden text-center text-[11px] text-muted-foreground py-5">
                    © {new Date().getFullYear()} Nabda OTP
                </p>
            </div>
        </div>
    );
}
