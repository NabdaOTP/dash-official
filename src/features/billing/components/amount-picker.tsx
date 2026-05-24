"use client";

import { Check, Zap } from "lucide-react";

const PRESET_AMOUNTS = [
    { amount: 10, label: "$10", popular: false },
    { amount: 25, label: "$25", popular: false },
    { amount: 50, label: "$50", popular: true },
    { amount: 100, label: "$100", popular: false },
    { amount: 250, label: "$250", popular: false },
    { amount: 500, label: "$500", popular: false },
];

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 10000;

interface AmountPickerProps {
    selectedAmount: number;
    customAmount: string;
    loading: boolean;
    onSelectPreset: (amount: number) => void;
    onCustomChange: (value: string) => void;
}

export function AmountPicker({
    selectedAmount,
    customAmount,
    loading,
    onSelectPreset,
    onCustomChange,
}: AmountPickerProps) {
    return (
        <div className="bg-background border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Choose an amount</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {PRESET_AMOUNTS.map((preset) => {
                    const isSelected = customAmount === "" && selectedAmount === preset.amount;
                    return (
                        <button
                            key={preset.amount}
                            onClick={() => onSelectPreset(preset.amount)}
                            className={`relative h-20 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                ? "border-[#7C3AED] bg-[#F5F3FF]"
                                : "border-border hover:border-[#7C3AED]/50"
                                }`}
                        >
                            {preset.popular && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap size={10} />
                                    POPULAR
                                </span>
                            )}
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className={`text-xl font-bold ${isSelected ? "text-[#7C3AED]" : "text-foreground"}`}>
                                    {preset.label}
                                </span>
                                {isSelected && <Check size={14} className="text-[#7C3AED] mt-1" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Or enter a custom amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={customAmount}
                        onChange={(e) => onCustomChange(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full h-11 pl-7 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                        disabled={loading}
                    />
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Minimum ${MIN_AMOUNT} · Maximum ${MAX_AMOUNT.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
