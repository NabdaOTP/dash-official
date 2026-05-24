"use client";

import {
    Loader2, ArrowDownLeft, ArrowUpRight, RefreshCcw,
    CheckCircle2, Clock, XCircle, History as HistoryIcon,
} from "lucide-react";
import type { Transaction, TransactionType, TransactionStatus } from "@/features/billing/types";

function getTypeIcon(type: TransactionType) {
    switch (type) {
        case "DEPOSIT":
        case "TRANSFER_IN":
        case "REFUND":
            return { icon: ArrowDownLeft, color: "text-green-600", bg: "bg-green-50" };
        case "USAGE":
        case "TRANSFER_OUT":
            return { icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-50" };
        case "ADJUSTMENT":
        default:
            return { icon: RefreshCcw, color: "text-blue-500", bg: "bg-blue-50" };
    }
}

function getStatusBadge(status: TransactionStatus) {
    switch (status) {
        case "COMPLETED":
            return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", label: "Completed" };
        case "PENDING":
            return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pending" };
        case "FAILED":
            return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Failed" };
        case "CANCELLED":
        default:
            return { icon: XCircle, color: "text-gray-600", bg: "bg-gray-100", label: status };
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

interface TransactionsTableProps {
    transactions: Transaction[];
    loading: boolean;
}

export function TransactionsTable({ transactions, loading }: TransactionsTableProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 size={28} className="animate-spin text-[#7C3AED]" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <HistoryIcon size={20} className="text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No transactions yet</h3>
                <p className="text-xs text-muted-foreground">
                    Your transaction history will appear here once you add credits or use services
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-5 py-3 text-xs">Type</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3 text-xs">Description</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3 text-xs">Status</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3 text-xs hidden sm:table-cell">Date</th>
                        <th className="text-right font-medium text-muted-foreground px-5 py-3 text-xs">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => {
                        const typeStyle = getTypeIcon(tx.type);
                        const statusStyle = getStatusBadge(tx.status);
                        const TypeIcon = typeStyle.icon;
                        const StatusIcon = statusStyle.icon;
                        const isPositive = ["DEPOSIT", "TRANSFER_IN", "REFUND"].includes(tx.type);

                        return (
                            <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg ${typeStyle.bg} flex items-center justify-center shrink-0`}>
                                            <TypeIcon size={14} className={typeStyle.color} />
                                        </div>
                                        <span className="text-[13px] font-medium text-foreground capitalize">
                                            {tx.type.toLowerCase().replace("_", " ")}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-3">
                                    <p className="text-[13px] text-muted-foreground line-clamp-1 max-w-[200px]">
                                        {tx.description ?? "—"}
                                    </p>
                                </td>
                                <td className="px-3 py-3">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.color} px-2 py-0.5 rounded-full`}>
                                        <StatusIcon size={10} />
                                        {statusStyle.label}
                                    </span>
                                </td>
                                <td className="px-3 py-3 hidden sm:table-cell">
                                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <span className={`text-[13px] font-semibold ${isPositive ? "text-green-600" : "text-foreground"}`}>
                                        {isPositive ? "+" : "-"}
                                        {tx.currency} {Math.abs(tx.amount).toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
