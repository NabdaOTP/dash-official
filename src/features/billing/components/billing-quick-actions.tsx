"use client";

import { CreditCard, History, ArrowRight } from "lucide-react";

interface BillingQuickActionsProps {
    onAddCredits: () => void;
    onViewHistory: () => void;
}

export function BillingQuickActions({ onAddCredits, onViewHistory }: BillingQuickActionsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
                onClick={onAddCredits}
                className="bg-background border border-border rounded-2xl p-5 text-left cursor-pointer hover:border-[#7C3AED] transition-all group"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                        <CreditCard size={18} className="text-[#7C3AED]" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Add Credits</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                    Top up your balance with a one-time payment via Stripe
                </p>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] group-hover:gap-2.5 transition-all">
                    Purchase credits
                    <ArrowRight size={14} />
                </div>
            </button>

            <button
                onClick={onViewHistory}
                className="bg-background border border-border rounded-2xl p-5 text-left cursor-pointer hover:border-[#7C3AED] transition-all group"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <History size={18} className="text-blue-600" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                    View all credit additions, usage, and adjustments
                </p>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] group-hover:gap-2.5 transition-all">
                    View history
                    <ArrowRight size={14} />
                </div>
            </button>
        </div>
    );
}
