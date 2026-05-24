"use client";

import { useMemo, useState } from "react";
import {
    Calendar, ArrowUpDown, ArrowUp, ArrowDown, Table as TableIcon,
} from "lucide-react";

import type { AnalyticsDailyEntry } from "@/features/analytics/types";

type SortKey = "date" | "total" | "delivered" | "read" | "failed" | "spent";
type SortDir = "asc" | "desc";

interface DailyBreakdownTableProps {
    data: AnalyticsDailyEntry[];
    loading?: boolean;
}

export function DailyBreakdownTable({
    data,
    loading,
}: DailyBreakdownTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const sorted = useMemo(() => {
        return [...data].sort((a, b) => {
            const aVal = getSortValue(a, sortKey);
            const bVal = getSortValue(b, sortKey);
            if (aVal === bVal) return 0;
            const cmp = aVal < bVal ? -1 : 1;
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir(key === "date" ? "desc" : "desc"); // numeric: high → low
        }
    };

    if (loading) {
        return (
            <TableShell>
                <div className="px-5 py-12 text-center">
                    <p className="text-[12px] text-muted-foreground">Loading…</p>
                </div>
            </TableShell>
        );
    }

    if (data.length === 0) {
        return (
            <TableShell>
                <div className="px-5 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-muted/40 mb-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-[13px] font-semibold text-foreground mb-0.5">
                        No daily data for this period
                    </p>
                    <p className="text-[11.5px] text-muted-foreground max-w-xs mx-auto">
                        Send messages to see day-by-day metrics here.
                    </p>
                </div>
            </TableShell>
        );
    }

    return (
        <TableShell>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/40 bg-muted/20">
                            <Th
                                label="Date"
                                sortKey="date"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                                align="left"
                            />
                            <Th
                                label="Total"
                                sortKey="total"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                            />
                            <Th
                                label="Delivered"
                                sortKey="delivered"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                            />
                            <Th
                                label="Read"
                                sortKey="read"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                            />
                            <Th
                                label="Failed"
                                sortKey="failed"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                            />
                            <Th
                                label="Spent"
                                sortKey="spent"
                                currentSort={sortKey}
                                dir={sortDir}
                                onSort={handleSort}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((entry, i) => {
                            const total = entry.total ?? entry.sent ?? 0;
                            const delivered = entry.delivered ?? 0;
                            const failed = entry.failed ?? 0;
                            const read = entry.read ?? 0;
                            const spent = entry.spent ?? 0;

                            // Calculate rate inline for visual cue
                            const successRate =
                                total > 0 ? (delivered / total) * 100 : 0;

                            return (
                                <tr
                                    key={`${entry.date}-${i}`}
                                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-4 py-3 text-[12.5px] text-foreground whitespace-nowrap">
                                        {formatDate(entry.date)}
                                    </td>
                                    <td className="px-4 py-3 text-[12.5px] font-semibold text-foreground text-right tabular-nums">
                                        {total.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-[12.5px] text-foreground tabular-nums">
                                                {delivered.toLocaleString()}
                                            </span>
                                            {total > 0 && (
                                                <span
                                                    className={`text-[10.5px] font-medium tabular-nums ${successRate >= 95
                                                            ? "text-green-700"
                                                            : successRate >= 85
                                                                ? "text-yellow-700"
                                                                : "text-red-700"
                                                        }`}
                                                >
                                                    {successRate.toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[12.5px] text-foreground text-right tabular-nums">
                                        {read.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span
                                            className={`text-[12.5px] tabular-nums ${failed > 0 ? "text-red-700 font-medium" : "text-foreground"
                                                }`}
                                        >
                                            {failed.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[12.5px] font-mono text-foreground text-right tabular-nums">
                                        ${spent.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer: row count */}
            <div className="px-4 py-2.5 border-t border-border/40 bg-muted/10">
                <p className="text-[11px] text-muted-foreground">
                    {data.length} {data.length === 1 ? "day" : "days"}
                </p>
            </div>
        </TableShell>
    );
}

// ─────────────────────────────────────────────────────────────
function TableShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
                    <TableIcon className="w-3.5 h-3.5 text-[#7C3AED]" />
                </div>
                <div>
                    <h3 className="text-[13.5px] font-semibold text-foreground leading-tight">
                        Daily Breakdown
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                        Day-by-day metrics
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Th({
    label, sortKey, currentSort, dir, onSort, align = "right",
}: {
    label: string;
    sortKey: SortKey;
    currentSort: SortKey;
    dir: SortDir;
    onSort: (key: SortKey) => void;
    align?: "left" | "right";
}) {
    const active = currentSort === sortKey;
    return (
        <th
            className={`px-4 py-2.5 ${align === "right" ? "text-right" : "text-left"
                }`}
        >
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={`cursor-pointer inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wide font-semibold transition-colors ${active ? "text-[#7C3AED]" : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                {label}
                {active ? (
                    dir === "asc" ? (
                        <ArrowUp className="w-3 h-3" />
                    ) : (
                        <ArrowDown className="w-3 h-3" />
                    )
                ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                )}
            </button>
        </th>
    );
}


function getSortValue(entry: AnalyticsDailyEntry, key: SortKey): number | string {
    switch (key) {
        case "date":
            return entry.date;
        case "total":
            return entry.total ?? entry.sent ?? 0;
        case "delivered":
            return entry.delivered ?? 0;
        case "read":
            return entry.read ?? 0;
        case "failed":
            return entry.failed ?? 0;
        case "spent":
            return entry.spent ?? 0;
    }
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}