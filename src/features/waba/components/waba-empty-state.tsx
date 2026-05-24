"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    MessageCircle, Check, Loader2, ExternalLink, ShieldCheck, Zap, Phone,
} from "lucide-react";
import { toast } from "sonner";

import { getWabaConnectUrl } from "@/features/waba/services/waba-service";

interface WabaEmptyStateProps {
    projectId: string;
}

export function WabaEmptyState({ projectId }: WabaEmptyStateProps) {
    const t = useTranslations("waba.empty");
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        if (connecting) return;
        setConnecting(true);
        try {
            const { connectUrl } = await getWabaConnectUrl(projectId);
            if (!connectUrl) {
                throw new Error("No connect URL returned");
            }
            // Redirect to Meta OAuth dialog
            window.location.href = connectUrl;
        } catch (err) {
            console.error("Failed to get connect URL:", err);
            toast.error(t("connectError"));
            setConnecting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)]">
            {/* Hero gradient */}
            <div className="relative bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] px-6 sm:px-10 py-10 sm:py-14 text-center text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

                <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-4 ring-1 ring-white/20">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-[24px] sm:text-[26px] font-bold tracking-tight">
                        {t("title")}
                    </h2>
                    <p className="text-[13.5px] text-white/85 mt-2 max-w-md mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-10 py-8">
                {/* Feature list */}
                <ul className="space-y-3 mb-7 max-w-md mx-auto">
                    <FeatureItem
                        icon={<ShieldCheck className="w-4 h-4" />}
                        text={t("features.official")}
                    />
                    <FeatureItem
                        icon={<Phone className="w-4 h-4" />}
                        text={t("features.multiNumber")}
                    />
                    <FeatureItem
                        icon={<Zap className="w-4 h-4" />}
                        text={t("features.highVolume")}
                    />
                </ul>

                {/* CTA */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleConnect}
                        disabled={connecting}
                        className="cursor-pointer h-11 px-6 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-lg shadow-[#7C3AED]/25"
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("connecting")}
                            </>
                        ) : (
                            <>
                                <MessageCircle className="w-4 h-4" />
                                {t("connectButton")}
                                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            </>
                        )}
                    </button>
                </div>

                {/* Helper note */}
                <p className="text-[11.5px] text-muted-foreground text-center mt-4 max-w-md mx-auto leading-relaxed">
                    {t("helperNote")}
                </p>
            </div>
        </div>
    );
}

function FeatureItem({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <li className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 text-[13.5px] text-foreground/90 leading-relaxed pt-1">
                {text}
            </div>
            <Check className="w-4 h-4 text-green-600 shrink-0 mt-2" />
        </li>
    );
}