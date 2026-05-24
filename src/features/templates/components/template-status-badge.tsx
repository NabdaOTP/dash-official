"use client";

import { useTranslations } from "next-intl";
import { getStatusStyle } from "@/features/templates/lib/template-builder";
import type { TemplateStatus } from "@/features/templates/types";

interface TemplateStatusBadgeProps {
    status: TemplateStatus;
    size?: "sm" | "md";
}

export function TemplateStatusBadge({ status, size = "md" }: TemplateStatusBadgeProps) {
    const t = useTranslations("templates.status");
    const style = getStatusStyle(status);

    const sizeClasses =
        size === "sm"
            ? "text-[10px] px-2 py-0.5"
            : "text-[11px] px-2.5 py-1";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${style.bg} ${style.text} ${sizeClasses}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {t(status.toLowerCase())}
        </span>
    );
}