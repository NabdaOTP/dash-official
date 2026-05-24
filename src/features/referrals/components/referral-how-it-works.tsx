"use client";

import { Share2, UserPlus, Coins } from "lucide-react";

const steps = [
    {
        icon: Share2,
        title: "Share your code",
        description:
            "Send your unique referral code or link to friends and colleagues",
        color: "bg-purple-50",
        iconColor: "text-[#7C3AED]",
    },
    {
        icon: UserPlus,
        title: "They sign up",
        description:
            "Your friends create an account using your code and start using Nabda",
        color: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        icon: Coins,
        title: "Earn points",
        description:
            "Get rewarded with points that you can redeem for credits and benefits",
        color: "bg-amber-50",
        iconColor: "text-amber-600",
    },
];

export function ReferralHowItWorks() {
    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground mb-1">
                How it works
            </h2>
            <p className="text-[12.5px] text-muted-foreground mb-5">
                Earn rewards in three simple steps
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map((step, index) => (
                    <div key={step.title} className="relative">
                        {/* Step number */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                        </div>

                        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-muted/30 border border-border/40 h-full">
                            <div
                                className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}
                            >
                                <step.icon size={18} className={step.iconColor} />
                            </div>
                            <h3 className="text-[13.5px] font-semibold text-foreground">
                                {step.title}
                            </h3>
                            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}