"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import {
    CATEGORIES,
    COUNTRIES,
    findCountry,
    formatCurrency,
} from "@/features/billing/lib/calculator-helpers";
import type {
    MessageCategory,
    CalculatorResult,
} from "@/features/billing/types";

interface EstimatorCustomizerProps {
    category: MessageCategory;
    country: string;
    result: CalculatorResult | null;
    onCategoryChange: (category: MessageCategory) => void;
    onCountryChange: (country: string) => void;
}

export function EstimatorCustomizer({
    category,
    country,
    result,
    onCategoryChange,
    onCountryChange,
}: EstimatorCustomizerProps) {
    return (
        <div className="space-y-4 pt-4 mt-4 border-t border-border/40">
            {/* Category pills */}
            <div>
                <label className="block text-[11.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORIES.map((cat) => {
                        const active = cat.id === category;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onCategoryChange(cat.id)}
                                className={`cursor-pointer rounded-lg px-2.5 py-2 text-left transition-all border ${active
                                        ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                                        : "bg-white border-border/60 hover:border-[#7C3AED]/40 text-foreground"
                                    }`}
                            >
                                <div className="text-[12px] font-semibold leading-tight">
                                    {cat.label}
                                </div>
                                <div
                                    className={`text-[10.5px] mt-0.5 leading-tight ${active ? "text-white/80" : "text-muted-foreground"
                                        }`}
                                >
                                    {cat.description}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Country picker */}
            <div>
                <label className="block text-[11.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Country
                </label>
                <CountrySelect value={country} onChange={onCountryChange} />
            </div>

            {/* Cost breakdown */}
            {result && (
                <div className="rounded-xl bg-muted/30 border border-border/40 p-3 space-y-2">
                    <CostRow
                        label="Base cost per message"
                        value={formatCurrency(result.baseCostPerMessage, result.currency)}
                    />
                    {result.pricing.markupPercent > 0 && (
                        <CostRow
                            label={`Markup (${result.pricing.markupPercent}%)`}
                            value={formatCurrency(
                                result.finalCostPerMessage - result.baseCostPerMessage,
                                result.currency
                            )}
                            muted
                        />
                    )}
                    <div className="border-t border-border/40 pt-2">
                        <CostRow
                            label="Final cost per message"
                            value={formatCurrency(
                                result.finalCostPerMessage,
                                result.currency
                            )}
                            highlight
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Cost row
// ─────────────────────────────────────────────────────────────
function CostRow({
    label,
    value,
    highlight,
    muted,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span
                className={`text-[12px] ${muted ? "text-muted-foreground" : "text-foreground"
                    }`}
            >
                {label}
            </span>
            <span
                className={`font-mono text-[12.5px] ${highlight
                        ? "font-bold text-[#7C3AED]"
                        : muted
                            ? "text-muted-foreground"
                            : "font-semibold text-foreground"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Country select with search
// ─────────────────────────────────────────────────────────────
function CountrySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (code: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selected = findCountry(value);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return COUNTRIES;
        return COUNTRIES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q)
        );
    }, [search]);

    const handleSelect = (code: string) => {
        onChange(code);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="cursor-pointer w-full h-10 px-3 rounded-lg border border-border bg-background flex items-center justify-between gap-2 text-[13.5px] outline-none transition-colors hover:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] leading-none">{selected.flag}</span>
                    <span className="truncate text-foreground">{selected.name}</span>
                    <span className="text-[10.5px] uppercase font-mono text-muted-foreground shrink-0">
                        {selected.code}
                    </span>
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />

                    {/* Popover */}
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                        {/* Search */}
                        <div className="relative p-2 border-b border-border/40">
                            <Search className="w-3.5 h-3.5 text-muted-foreground absolute start-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search countries..."
                                autoFocus
                                className="w-full h-8 ps-8 pe-3 rounded-md border border-border/60 bg-background text-[12.5px] outline-none focus:ring-1 focus:ring-[#7C3AED]/30"
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-60 overflow-y-auto py-1">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                                    No countries found
                                </div>
                            ) : (
                                filtered.map((c) => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => handleSelect(c.code)}
                                        className={`cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors ${c.code === value ? "bg-[#EDE9FE]/40" : ""
                                            }`}
                                    >
                                        <span className="text-[16px] leading-none">{c.flag}</span>
                                        <span className="text-[13px] text-foreground flex-1 truncate">
                                            {c.name}
                                        </span>
                                        <span className="text-[10.5px] uppercase font-mono text-muted-foreground">
                                            {c.code}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}