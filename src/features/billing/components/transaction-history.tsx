"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getProjectTransactions } from "@/features/billing/services/billing-service";
import type { Transaction } from "@/features/billing/types";
import { TransactionsTable } from "./transactions-table";
import { TransactionsPagination } from "./transactions-pagination";

const PAGE_SIZE = 20;

export function TransactionHistory() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchTransactions = useCallback(
        async (pageNum: number) => {
            if (!projectId) return;
            setLoading(true);
            try {
                const data = await getProjectTransactions(projectId, {
                    limit: PAGE_SIZE,
                    offset: pageNum * PAGE_SIZE,
                });
                setTransactions(data.items ?? []);
                setTotal(data.meta?.total ?? 0);
            } catch (err: unknown) {
                // ⚠️ Backend bug: balance endpoint returns 500 — known issue, will work once backend is fixed
                toast.error((err as { message?: string })?.message ?? "Failed to load transactions");
            } finally {
                setLoading(false);
            }
        },
        [projectId]
    );

    useEffect(() => {
        (async () => {
            await fetchTransactions(page);
        })()
    }, [fetchTransactions, page]);

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">Transaction History</h1>
                <p className="text-sm text-muted-foreground">
                    View all credit additions, usage, and adjustments for this project
                </p>
            </div>

            <div className="bg-background border border-border rounded-2xl overflow-hidden">
                <TransactionsTable transactions={transactions} loading={loading} />
                <TransactionsPagination
                    page={page}
                    total={total}
                    loading={loading}
                    onPrev={() => setPage((p) => Math.max(0, p - 1))}
                    onNext={() => setPage((p) => p + 1)}
                />
            </div>
        </div>
    );
}
