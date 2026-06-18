"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    RefreshCw, Trash2, Loader2, Globe2, AlertCircle, Pencil,
} from "lucide-react";
import { toast } from "sonner";

import type { MessageTemplate } from "@/features/templates/types";
import {
    refreshTemplateStatus,
} from "@/features/templates/services/template-service";
import {
    getCategoryStyle,
    SUPPORTED_LANGUAGES,
} from "@/features/templates/lib/template-builder";
import { TemplateStatusBadge } from "./template-status-badge";

interface TemplateCardProps {
    template: MessageTemplate;
    projectId: string;
    wabaAccountId?: string;
    onRefreshed: (updated: MessageTemplate) => void;
    onDelete: (template: MessageTemplate) => void;
    onSelect?: (template: MessageTemplate) => void;
    onEdit?: (template: MessageTemplate) => void;
    selected?: boolean;
}

export function TemplateCard({
    template,
    projectId,
    wabaAccountId,
    onRefreshed,
    onDelete,
    onSelect,
    onEdit,
    selected,
}: TemplateCardProps) {
    const t = useTranslations("templates.card");
    const locale = useLocale();
    const [refreshing, setRefreshing] = useState(false);

    const categoryStyle = getCategoryStyle(template.category);
    const isPending = template.status === "PENDING" || template.status === "IN_APPEAL";
    const isRejected = template.status === "REJECTED";

    // Find body component for preview
    const bodyComponent = template.components?.find((c) => c.type === "BODY");
    const bodyPreview = bodyComponent?.text ?? "";

    // Language display
    const languageLabel =
        SUPPORTED_LANGUAGES.find((l) => l.code === template.language)?.name ??
        template.language;

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            const updated = await refreshTemplateStatus(
                projectId,
                template.id,
                wabaAccountId
            );
            onRefreshed(updated);
            toast.success(t("refreshSuccess"));
        } catch (err) {
            console.error("Failed to refresh status:", err);
            toast.error(t("refreshError"));
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={() => onSelect?.(template)}
            onKeyDown={(e) => {
                if (!onSelect) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(template);
                }
            }}
            className={`rounded-2xl border bg-white p-5 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${selected ? "border-[#7C3AED] ring-1 ring-[#7C3AED]/20" : "border-border/60 hover:border-[#7C3AED]/30"}`}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-mono text-[14px] font-semibold text-foreground truncate">
                            {template.name}
                        </h3>
                        <TemplateStatusBadge status={template.status} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-[11.5px] text-muted-foreground">
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                        >
                            {t(`category.${template.category.toLowerCase()}`)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Globe2 className="w-3 h-3" />
                            {languageLabel}
                        </span>
                        <span>{t("created")} {formatDate(template.createdAt)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {isPending && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRefresh();
                            }}
                            disabled={refreshing}
                            title={t("refreshTooltip")}
                            className="cursor-pointer h-8 px-2.5 rounded-lg text-[12px] font-medium text-[#7C3AED] bg-[#EDE9FE]/60 hover:bg-[#EDE9FE] active:scale-[0.99] transition-all flex items-center gap-1.5 disabled:opacity-60"
                        >
                            {refreshing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            {t("refresh")}
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(template);
                            }}
                            title="Edit draft"
                            className="cursor-pointer h-8 px-2.5 rounded-lg text-[12px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] transition-all flex items-center gap-1.5"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(template);
                        }}
                        title={t("deleteTooltip")}
                        className="cursor-pointer w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 active:scale-[0.99] transition-all flex items-center justify-center"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Body preview */}
            {bodyPreview && (
                <div className="rounded-lg bg-muted/30 border border-border/40 p-3 mt-2">
                    <p className="text-[12.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {bodyPreview}
                    </p>
                </div>
            )}

            {/* Rejection reason */}
            {isRejected && template.rejectedReason && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50/60 border border-red-100 p-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[11.5px] text-red-800 leading-relaxed">
                        <span className="font-semibold">{t("rejectedReason")}:</span>{" "}
                        {template.rejectedReason}
                    </div>
                </div>
            )}
        </div>
    );
}
