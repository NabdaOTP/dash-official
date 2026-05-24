"use client";

import { Users, Coins, TrendingUp } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";

export function ReferralStats() {
    const { user } = useAuth();
    if (!user) return null;

    const stats = [
        {
            icon: Coins,
            label: "Total Points",
            value: user.totalPoints.toLocaleString(),
            color: "bg-purple-50",
            iconColor: "text-[#7C3AED]",
            note: "Points earned overall",
        },
        {
            icon: Users,
            label: "Friends Referred",
            // ⏳ Waiting on backend endpoint for referred users count
            value: "—",
            color: "bg-blue-50",
            iconColor: "text-blue-600",
            note: "Coming soon",
        },
        {
            icon: TrendingUp,
            label: "Points This Month",
            // ⏳ Waiting on backend endpoint for points history
            value: "—",
            color: "bg-green-50",
            iconColor: "text-green-600",
            note: "Coming soon",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-background rounded-2xl border border-border/60 p-4 sm:p-5"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}
                        >
                            <stat.icon size={16} className={stat.iconColor} />
                        </div>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">
                        {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{stat.note}</p>
                </div>
            ))}
        </div>
    );
}