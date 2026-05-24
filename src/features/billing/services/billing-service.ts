import { api } from "@/lib/api-client";
import type {
    ProjectBalance, Transaction, TransactionsResponse,
    CheckoutRequest, CheckoutResponse,
} from "../types";

// ── Balance ──
// ⚠️ Currently returns 500 from backend (Cannot read 'projectId').
//    Endpoint signature is correct on Swagger — waiting on backend fix.
//    Will work as soon as backend is patched, no frontend changes needed.
export async function getProjectBalance(projectId: string): Promise<ProjectBalance> {
    return api.get<ProjectBalance>(`/billing/balance?projectId=${projectId}`);
}

// Transactions

export async function getProjectTransactions(
    projectId: string,
    params?: { limit?: number; offset?: number }
): Promise<TransactionsResponse> {
    const query = new URLSearchParams();
    query.set("projectId", projectId);
    query.set("limit", String(params?.limit ?? 20));
    query.set("offset", String(params?.offset ?? 0));

    return api.get<TransactionsResponse>(`/billing/transactions?${query}`);
}

// ── Checkout ──

export async function createCheckoutSession(
    projectId: string,
    amount: number
): Promise<CheckoutResponse> {
    return api.post<CheckoutResponse>(
        `/billing/checkout?projectId=${projectId}`,
        { amount } satisfies CheckoutRequest
    );
}