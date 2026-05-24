"use client";

import { useState } from "react";
import { Gift, Copy, Check, Coins, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/features/auth/context/auth-context";

export function ProfileReferralCard() {
    const { user } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const [copied, setCopied] = useState(false);

    if (!user) return null;

    const handleCopy = () => {
        if (!user.referralCode) return;
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!user.referralCode) return;
        const shareText = `Join me on Nabda OTP! Use my referral code: ${user.referralCode}`;
        const shareUrl = `${window.location.origin}/${locale}/signup?ref=${user.referralCode}`;

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
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            toast.success("Share link copied!");
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center">
                        <Gift size={16} className="text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                        Referrals
                    </h2>
                </div>
                <button
                    onClick={() => router.push(`/${locale}/referrals`)}
                    className="text-[12px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer transition-colors"
                >
                    View all
                </button>
            </div>

            {/* Points display */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-medium text-[#7C3AED]/70 mb-0.5">
                        Total Points
                    </p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-[#7C3AED]">
                            {user.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium text-[#7C3AED]/70">
                            points
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Coins size={20} className="text-[#7C3AED]" />
                </div>
            </div>

            {/* Referral code */}
            {user.referralCode ? (
                <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                        Your referral code
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted/60 rounded-lg px-3 py-2.5 font-mono text-sm font-semibold text-foreground tracking-wider text-center border border-border/50">
                            {user.referralCode}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-10 h-10 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center cursor-pointer transition-colors shrink-0"
                            aria-label="Copy referral code"
                        >
                            {copied ? (
                                <Check size={15} className="text-green-600" />
                            ) : (
                                <Copy size={15} className="text-muted-foreground" />
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                            aria-label="Share referral"
                        >
                            <Share2 size={15} className="text-white" />
                        </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Share your code with friends and earn points when they sign up
                    </p>
                </div>
            ) : (
                <p className="text-[12px] text-muted-foreground text-center py-2">
                    No referral code yet
                </p>
            )}
        </div>
    );
}