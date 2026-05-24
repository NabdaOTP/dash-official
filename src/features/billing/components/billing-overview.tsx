"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getProjectBalance } from "@/features/billing/services/billing-service";
import { BalanceCard } from "./balance-card";
import { BillingQuickActions } from "./billing-quick-actions";

export function BillingOverview() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const projectId = params.projectId as string;

    const [balance, setBalance] = useState<number | null>(null);
    const [currency, setCurrency] = useState("USD");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(false);
        try {
            const data = await getProjectBalance(projectId);
            setBalance(data.balance);
            setCurrency(data.currency ?? "USD");
        } catch {
            // ⚠️ Backend bug: balance endpoint returns 500 — known issue, will work once backend is fixed
            setError(true);
            setBalance(0);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchBalance();
        })()
    }, [fetchBalance]);

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Billing</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your project credits, view transactions, and add funds
                </p>
            </div>

            <BalanceCard
                balance={balance}
                currency={currency}
                loading={loading}
                error={error}
                onAddCredits={() => router.push(`/${locale}/projects/${projectId}/pricing`)}
            />

            <BillingQuickActions
                onAddCredits={() => router.push(`/${locale}/projects/${projectId}/pricing`)}
                onViewHistory={() => router.push(`/${locale}/projects/${projectId}/credits/history`)}
            />
        </div>
    );
}
