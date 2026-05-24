"use client";

import { Calendar } from "lucide-react";
import type { DateRange, DateRangePreset } from "@/features/analytics/types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function toIsoDate(d: Date): string {
    // YYYY-MM-DD format (no time)
    return d.toISOString().split("T")[0];
}

export function getDateRange(preset: DateRangePreset): DateRange {
    const today = new Date();
    const end = new Date(today);

    let start: Date;
    switch (preset) {
        case "7d":
            start = new Date(today);
            start.setDate(today.getDate() - 6);
            break;
        case "30d":
            start = new Date(today);
            start.setDate(today.getDate() - 29);
            break;
        case "90d":
            start = new Date(today);
            start.setDate(today.getDate() - 89);
            break;
        case "custom":
        default:
            start = new Date(today);
            start.setDate(today.getDate() - 29);
            break;
    }

    return {
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
        preset,
    };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    disabled?: boolean;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "Last 90 days" },
];

export function DateRangePicker({
    value,
    onChange,
    disabled,
}: DateRangePickerProps) {
    const handlePresetClick = (preset: DateRangePreset) => {
        onChange(getDateRange(preset));
    };

    const formatRange = () => {
        try {
            const start = new Date(value.startDate);
            const end = new Date(value.endDate);
            const fmt = (d: Date) =>
                d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year:
                        start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
                });
            return `${fmt(start)} – ${fmt(end)}`;
        } catch {
            return `${value.startDate} – ${value.endDate}`;
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Preset pills */}
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border/40">
                {PRESETS.map((preset) => {
                    const active = value.preset === preset.id;
                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetClick(preset.id)}
                            disabled={disabled}
                            className={`cursor-pointer h-7 px-2.5 rounded-md text-[11.5px] font-medium transition-all disabled:opacity-50 ${active
                                    ? "bg-white text-[#7C3AED] shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Current range display */}
            <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white border border-border/60 text-[11.5px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatRange()}
            </div>
        </div>
    );
}