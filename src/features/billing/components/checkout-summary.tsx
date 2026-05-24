"use client";

import { Loader2, CreditCard } from "lucide-react";

const MIN_AMOUNT = 5;

interface CheckoutSummaryProps {
    finalAmount: number;
    loading: boolean;
    onCheckout: () => void;
}

export function CheckoutSummary({ finalAmount, loading, onCheckout }: CheckoutSummaryProps) {
    return (
        <div className="bg-background border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Total amount</span>
                <span className="text-2xl font-bold text-foreground">
                    ${isNaN(finalAmount) ? "0" : finalAmount.toLocaleString()}
                </span>
            </div>

            <button
                onClick={onCheckout}
                disabled={loading || isNaN(finalAmount) || finalAmount < MIN_AMOUNT}
                className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {loading ? "Redirecting to Stripe..." : "Proceed to Checkout"}
            </button>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
                You will be redirected to Stripe to complete your payment securely
            </p>
        </div>
    );
}
