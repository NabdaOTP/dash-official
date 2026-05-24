// Balance 
// Expected response shape (waiting on backend to confirm — currently returns 500)
export interface ProjectBalance {
    projectId: string;
    balance: number;
    currency: string;
}

// Transactions 

export type TransactionType =
    | "DEPOSIT"
    | "USAGE"
    | "REFUND"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "ADJUSTMENT";

export type TransactionStatus =
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

export interface Transaction {
    id: string;
    projectId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    description: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionsResponse {
    items: Transaction[];
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}

// Checkout

export interface CheckoutRequest {
    amount: number;
}

export interface CheckoutResponse {
    id: string;
    url: string;
    amount_total: number;
    amount_subtotal: number;
    currency: string;
    status: string;
    payment_status: string;
    expires_at: number;
    mode: string;
    cancel_url: string;
    success_url: string;
    livemode: boolean;
    payment_method_types: string[];
    metadata?: {
        amount?: string;
        projectId?: string;
        userId?: string;
    };
}