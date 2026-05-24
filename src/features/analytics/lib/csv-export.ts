import type { AnalyticsDailyEntry } from "../types";

/**
 * Convert daily analytics entries into a CSV string.
 */
export function entriesToCsv(entries: AnalyticsDailyEntry[]): string {
  const headers = [
    "Date",
    "Total",
    "Sent",
    "Delivered",
    "Read",
    "Failed",
    "Spent (USD)",
  ];

  const rows = entries.map((entry) => {
    const total = entry.total ?? entry.sent ?? 0;
    return [
      entry.date,
      total,
      entry.sent ?? 0,
      entry.delivered ?? 0,
      entry.read ?? 0,
      entry.failed ?? 0,
      (entry.spent ?? 0).toFixed(4),
    ];
  });

  // Escape values that contain commas or quotes
  const escape = (value: unknown): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ];

  return lines.join("\n");
}

/**
 * Trigger a browser download of the CSV string.
 */
export function downloadCsv(filename: string, csv: string): void {
  // Add UTF-8 BOM so Excel handles non-ASCII correctly
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Free up memory
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Build a filename like "analytics_2026-05-01_to_2026-05-30.csv"
 */
export function buildCsvFilename(
  startDate: string,
  endDate: string
): string {
  return `analytics_${startDate}_to_${endDate}.csv`;
}