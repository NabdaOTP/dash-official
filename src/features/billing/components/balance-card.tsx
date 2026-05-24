"use client";

import { Loader2, Wallet, Plus } from "lucide-react";

interface BalanceCardProps {
    balance: number | null;
    currency: string;
    loading: boolean;
    error: boolean;
    onAddCredits: () => void;
}

export function BalanceCard({ balance, currency, loading, error, onAddCredits }: BalanceCardProps) {
    return (
        <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[13px] font-medium text-white/80 mb-1">Current Balance</p>
                    {loading ? (
                        <Loader2 size={28} className="animate-spin text-white" />
                    ) : (
                        <p className="text-4xl font-bold">
                            {currency} {balance?.toLocaleString() ?? "0"}
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Wallet size={22} className="text-white" />
                </div>
            </div>

            {error && (
                <p className="text-xs text-white/70 mb-3">
                    Balance temporarily unavailable. Please try again later.
                </p>
            )}

            <button
                onClick={onAddCredits}
                className="h-10 px-5 rounded-lg bg-white text-[#7C3AED] text-sm font-semibold hover:bg-white/90 cursor-pointer flex items-center gap-2 transition-colors"
            >
                <Plus size={16} />
                Add Credits
            </button>
        </div>
    );
}
