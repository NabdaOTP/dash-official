"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ChevronDown, Loader2, Info } from "lucide-react";

import { calculateCost } from "@/features/billing/services/billing-service";
import {
    DEFAULT_CATEGORY,
    DEFAULT_COUNTRY,
    CATEGORIES,
    findCountry,
    formatMessageCount,
    formatCurrency,
    calculateMessageCount,
} from "@/features/billing/lib/calculator-helpers";
import type {
    CalculatorResult,
    MessageCategory,
} from "@/features/billing/types";

import { EstimatorCustomizer } from "./estimator-customizer";

const DEBOUNCE_MS = 350;

interface CreditEstimatorProps {
    /** The amount in USD the user is about to charge. */
    amount: number;
}

export function CreditEstimator({ amount }: CreditEstimatorProps) {
    const params = useParams();
    const projectId = params?.projectId as string;

    // settings 
    const [category, setCategory] = useState<MessageCategory>(DEFAULT_CATEGORY);
    const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
    const [expanded, setExpanded] = useState(false);

    // result + cache 
    const [result, setResult] = useState<CalculatorResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    // Cache: key = `${category}-${country}` (amount doesn't affect cost-per-msg)
    const cacheRef = useRef<Map<string, CalculatorResult>>(new Map());

    // Debounce
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Abort outdated requests
    const requestIdRef = useRef(0);

    // ── fetch logic 
    const fetchEstimate = useCallback(async () => {
        if (!projectId) return;

        const cacheKey = `${category}-${country}`;
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
            setResult(cached);
            setLoading(false);
            setFailed(false);
            return;
        }

        const myRequestId = ++requestIdRef.current;
        setLoading(true);
        setFailed(false);

        try {
            const res = await calculateCost(projectId, {
                category,
                country,
                // Use a fixed reference count of 100 to get cost-per-message.
                // We compute the actual estimated count locally from `amount`.
                messageCount: 100,
            });

            // Drop response if a newer request started after us
            if (myRequestId !== requestIdRef.current) return;

            cacheRef.current.set(cacheKey, res);
            setResult(res);
        } catch (err) {
            if (myRequestId !== requestIdRef.current) return;
            console.error("Calculator failed:", err);
            setFailed(true);
            setResult(null);
        } finally {
            if (myRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [projectId, category, country]);

    // Debounce on category/country changes
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchEstimate();
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [fetchEstimate]);

    // derived 
    const estimatedMessages = useMemo(() => {
        if (!result || amount <= 0 || isNaN(amount)) return 0;
        return calculateMessageCount(amount, result.finalCostPerMessage);
    }, [result, amount]);

    const selectedCountry = findCountry(country);
    const selectedCategory = CATEGORIES.find((c) => c.id === category);

    // empty state — no amount entered 
    if (amount <= 0 || isNaN(amount)) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-4 flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white border border-border/60 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                    Enter an amount above to see how many messages you can send.
                </p>
            </div>
        );
    }

    // failed silently — hide widget but don't bother user ──
    if (failed && !result) {
        return null;
    }

    // ready 
    return (
        <div className="rounded-2xl border border-[#7C3AED]/15 bg-linear-to-br from-[#F8F7FF] to-white p-5 mb-6">
            {/* Top: estimate */}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#7C3AED]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                        What you will get
                    </p>

                    {loading && !result ? (
                        <div className="h-7 w-32 bg-muted/50 rounded animate-pulse" />
                    ) : (
                        <p className="text-[22px] font-bold tracking-tight text-foreground leading-tight">
                            ~{formatMessageCount(estimatedMessages)}{" "}
                            <span className="text-[14px] font-medium text-muted-foreground">
                                messages
                            </span>
                        </p>
                    )}

                    <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Based on</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#EDE9FE]/60 text-[#7C3AED] font-semibold text-[11px]">
                            {selectedCategory?.label}
                        </span>
                        <span>to</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-border/60 font-medium text-foreground text-[11px]">
                            <span className="text-[13px] leading-none">{selectedCountry.flag}</span>
                            {selectedCountry.name}
                        </span>
                        {result && (
                            <span className="text-muted-foreground/80">
                                at {formatCurrency(result.finalCostPerMessage, result.currency)}/msg
                            </span>
                        )}
                    </p>
                </div>

                {loading && result && (
                    <Loader2 className="w-3.5 h-3.5 text-[#7C3AED] animate-spin shrink-0 mt-2" />
                )}
            </div>

            {/* Customize toggle */}
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="cursor-pointer mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
                {expanded ? "Hide details" : "Customize estimate"}
                <ChevronDown
                    className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Expandable customizer */}
            {expanded && (
                <EstimatorCustomizer
                    category={category}
                    country={country}
                    result={result}
                    onCategoryChange={setCategory}
                    onCountryChange={setCountry}
                />
            )}
        </div>
    );
}