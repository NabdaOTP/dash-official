"use client";

const PAGE_SIZE = 20;

interface TransactionsPaginationProps {
    page: number;
    total: number;
    loading: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export function TransactionsPagination({ page, total, loading, onPrev, onNext }: TransactionsPaginationProps) {
    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={page === 0 || loading}
                    className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={onNext}
                    disabled={page >= totalPages - 1 || loading}
                    className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
