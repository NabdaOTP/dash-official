"use client";

import { useState } from "react";
import { Copy, Check, Share2, Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { useAuth } from "@/features/auth/context/auth-context";

export function ReferralHero() {
    const { user } = useAuth();
    const locale = useLocale();
    const [copied, setCopied] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    if (!user) return null;

    const shareUrl =
        typeof window !== "undefined" && user.referralCode
            ? `${window.location.origin}/${locale}/signup?ref=${user.referralCode}`
            : "";

    const handleCopyCode = () => {
        if (!user.referralCode) return;
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        toast.success("Share link copied!");
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleShare = async () => {
        if (!user.referralCode || !shareUrl) return;
        const shareText = `Join me on Nabda OTP! Use my referral code: ${user.referralCode}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Join Nabda OTP",
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // user cancelled
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-2xl p-6 sm:p-8 overflow-hidden">
            {/* Decorative pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-fuchsia-400/10 blur-2xl pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Points */}
                <div className="text-center md:text-start">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full ring-1 ring-white/10 mb-3">
                        <Coins size={11} />
                        REWARDS
                    </div>
                    <h1 className="text-white/70 text-sm mb-1">Your total points</h1>
                    <div className="flex items-baseline justify-center md:justify-start gap-2 mb-3">
                        <span className="text-4xl sm:text-5xl font-bold text-white">
                            {user.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-base font-medium text-white/70">points</span>
                    </div>
                    <p className="text-white/70 text-[13px] leading-relaxed max-w-xs mx-auto md:mx-0">
                        Earn points by referring friends. The more they use Nabda, the more you earn.
                    </p>
                </div>

                {/* Right: Referral code + actions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-white/10">
                    {user.referralCode ? (
                        <>
                            <p className="text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-wider">
                                Your referral code
                            </p>
                            <div className="bg-white/15 rounded-xl px-4 py-3 mb-3 font-mono text-lg font-bold text-white tracking-widest text-center">
                                {user.referralCode}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="h-9 rounded-lg bg-white/15 hover:bg-white/20 text-white text-[12.5px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={14} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            Copy Code
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="h-9 rounded-lg bg-white text-[#7C3AED] text-[12.5px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-white/95 transition-colors"
                                >
                                    <Share2 size={14} />
                                    Share
                                </button>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="w-full mt-2 text-[11px] text-white/70 hover:text-white transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                                {copiedLink ? (
                                    <>
                                        <Check size={11} />
                                        Link copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={11} />
                                        Copy invite link
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <Gift size={28} className="text-white/40 mx-auto mb-2" />
                            <p className="text-white/70 text-[13px]">
                                You don&apos;t have a referral code yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}