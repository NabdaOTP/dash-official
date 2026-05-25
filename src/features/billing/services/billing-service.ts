import { api } from "@/lib/api-client";
import type {
    ProjectBalance, Transaction, SandboxStatus, TransactionsResponse, CalculatorRequest, CalculatorResult,
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

export async function calculateCost(
    projectId: string,
    data: CalculatorRequest
): Promise<CalculatorResult> {
    return api.post<CalculatorResult>(
        `/billing/calculator?projectId=${encodeURIComponent(projectId)}`,
        data
    );
}

/**
 * Get the sandbox status for a project.
 * GET /api/v1/billing/sandbox?projectId=xxx
 */
export async function getSandboxStatus(
    projectId: string
): Promise<SandboxStatus> {
    const result = await api.get<SandboxStatus>(
        `/billing/sandbox?projectId=${encodeURIComponent(projectId)}`
    );
    return {
        enabled: result?.enabled ?? false,
        maxMessages: result?.maxMessages ?? 0,
        usedMessages: result?.usedMessages ?? 0,
    };
}

export async function updateSandboxStatus(
    projectId: string,
    enabled: boolean
): Promise<SandboxStatus> {
    const result = await api.post<SandboxStatus>(
        `/billing/sandbox?projectId=${encodeURIComponent(projectId)}`,
        { enabled }
    );
    return {
        enabled: result?.enabled ?? enabled,
        maxMessages: result?.maxMessages ?? 0,
        usedMessages: result?.usedMessages ?? 0,
    };
}