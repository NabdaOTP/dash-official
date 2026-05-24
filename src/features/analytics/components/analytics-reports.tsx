"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
    AlertCircle, RefreshCw, FileBarChart, Download, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { getDailyReport } from "@/features/analytics/services/analytics-service";
import type {
    AnalyticsDailyEntry,
    DateRange,
} from "@/features/analytics/types";
import {
    entriesToCsv,
    downloadCsv,
    buildCsvFilename,
} from "@/features/analytics/lib/csv-export";

import { DateRangePicker, getDateRange } from "./date-range-picker";
import { DailyChart } from "./daily-chart";
import { DailyBreakdownTable } from "./daily-breakdown-table";

export function AnalyticsReports() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [range, setRange] = useState<DateRange>(() => getDateRange("30d"));
    const [daily, setDaily] = useState<AnalyticsDailyEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);

        try {
            const data = await getDailyReport(projectId, {
                startDate: range.startDate,
                endDate: range.endDate,
            });
            setDaily(data);
        } catch (err) {
            console.error("Failed to load reports:", err);
            setError("Failed to load reports. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [projectId, range.startDate, range.endDate]);

    useEffect(() => {
        (async () => {
            await fetchData();
        })()
    }, [fetchData]);



    const handleExport = () => {
        if (daily.length === 0) {
            toast.error("No data to export");
            return;
        }
        try {
            const csv = entriesToCsv(daily);
            const filename = buildCsvFilename(range.startDate, range.endDate);
            downloadCsv(filename, csv);
            toast.success("CSV exported");
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Failed to export CSV");
        }
    };

    // ── Error 
    if (error) {
        return (
            <div className="space-y-5">
                <PageHeader projectId={projectId} />
                <DateRangePicker value={range} onChange={setRange} />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={fetchData}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <PageHeader projectId={projectId} />
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={loading || daily.length === 0}
                    className="cursor-pointer h-9 px-3.5 rounded-lg text-[12.5px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#7C3AED]/20"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </button>
            </div>

            {/* Date range */}
            <DateRangePicker
                value={range}
                onChange={setRange}
                disabled={loading}
            />

            {/* Chart */}
            <DailyChart data={daily} loading={loading} />

            {/* Table */}
            <DailyBreakdownTable data={daily} loading={loading} />
        </div>
    );
}

function PageHeader({ projectId }: { projectId: string }) {
    return (
        <div className="space-y-2">
            <Link
                href={`/projects/${projectId}/analytics/overview`}
                className="cursor-pointer inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground hover:text-[#7C3AED] transition-colors"
            >
                <ArrowLeft className="w-3 h-3" />
                Back to overview
            </Link>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                        Reports
                    </h1>
                    <p className="text-[12.5px] text-muted-foreground">
                        Detailed daily breakdown and trends
                    </p>
                </div>
            </div>
        </div>
    );
}