"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
    FileText, Plus, Loader2, AlertCircle, RefreshCw,
    MessageCircle, ArrowRight,
} from "lucide-react";

import { getTemplates } from "@/features/templates/services/template-service";
import { getWabaStatus } from "@/features/waba/services/waba-service";
import type { MessageTemplate } from "@/features/templates/types";
import type { WabaAccount } from "@/features/waba/types";

import { TemplateCard } from "./template-card";
import { CreateTemplateDialog } from "./create-template-dialog";
import { DeleteTemplateDialog } from "./delete-template-dialog";

export function TemplatesPage() {
    const t = useTranslations("templates");
    const params = useParams();
    const projectId = params?.projectId as string;

    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [wabaAccount, setWabaAccount] = useState<WabaAccount | null>(null);
    const [isWabaConnected, setIsWabaConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] =
        useState<MessageTemplate | null>(null);

    const fetchAll = useCallback(async () => {
        if (!projectId) return;
        setError(null);
        try {
            // Fetch both in parallel
            const [status, templatesResult] = await Promise.all([
                getWabaStatus(projectId),
                getTemplates(projectId).catch(() => [] as MessageTemplate[]),
            ]);
            setIsWabaConnected(status.isConnected);
            setWabaAccount(status.accounts[0] ?? null);
            setTemplates(templatesResult);
        } catch (err) {
            console.error("Failed to load templates:", err);
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [projectId, t]);

    useEffect(() => {
        (async () => {
            await fetchAll();
        })()
    }, [fetchAll]);


    // ── handlers ─────────────────────────────────────────────
    const handleTemplateCreated = (template: MessageTemplate) => {
        setTemplates((prev) => [template, ...prev]);
    };

    const handleTemplateRefreshed = (updated: MessageTemplate) => {
        setTemplates((prev) =>
            prev.map((tpl) => (tpl.id === updated.id ? updated : tpl))
        );
    };

    const handleTemplateDeleted = (templateId: string) => {
        setTemplates((prev) => prev.filter((tpl) => tpl.id !== templateId));
    };

    // ── Loading state ────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────
    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={fetchAll}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t("retry")}
                    </button>
                </div>
            </div>
        );
    }

    // ── No WABA account connected ────────────────────────────
    if (!isWabaConnected || !wabaAccount) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <NoWabaState projectId={projectId} />
            </div>
        );
    }

    // ── Connected — list templates ───────────────────────────
    return (
        <div className="space-y-6">
            <PageHeader
                action={
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                    >
                        <Plus className="w-4 h-4" />
                        {t("newTemplate")}
                    </button>
                }
            />

            {templates.length === 0 ? (
                <EmptyTemplatesState onCreate={() => setCreateOpen(true)} />
            ) : (
                <div className="space-y-3">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            projectId={projectId}
                            wabaAccountId={wabaAccount.id}
                            onRefreshed={handleTemplateRefreshed}
                            onDelete={(tpl) => setTemplateToDelete(tpl)}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <CreateTemplateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                projectId={projectId}
                wabaAccountId={wabaAccount.id}
                onCreated={handleTemplateCreated}
            />
            <DeleteTemplateDialog
                open={templateToDelete !== null}
                onClose={() => setTemplateToDelete(null)}
                template={templateToDelete}
                projectId={projectId}
                onDeleted={handleTemplateDeleted}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Page header
// ─────────────────────────────────────────────────────────────
function PageHeader({ action }: { action?: React.ReactNode }) {
    const t = useTranslations("templates");
    return (
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                        {t("pageTitle")}
                    </h1>
                    <p className="text-[12.5px] text-muted-foreground">
                        {t("pageSubtitle")}
                    </p>
                </div>
            </div>
            {action}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// No WABA account state
// ─────────────────────────────────────────────────────────────
function NoWabaState({ projectId }: { projectId: string }) {
    const t = useTranslations("templates.noWaba");
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDE9FE] mb-4">
                <MessageCircle className="w-7 h-7 text-[#7C3AED]" />
            </div>
            <h2 className="text-[18px] font-bold text-foreground mb-2">
                {t("title")}
            </h2>
            <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed mb-5">
                {t("description")}
            </p>
            <Link
                href={`/projects/${projectId}/whatsapp`}
                className="cursor-pointer h-10 px-5 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
            >
                {t("connectButton")}
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Empty templates state (WABA connected but no templates yet)
// ─────────────────────────────────────────────────────────────
function EmptyTemplatesState({ onCreate }: { onCreate: () => void }) {
    const t = useTranslations("templates.empty");
    return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-border/60 mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground mb-1">
                {t("title")}
            </h3>
            <p className="text-[12.5px] text-muted-foreground max-w-sm mx-auto leading-relaxed mb-4">
                {t("description")}
            </p>
            <button
                type="button"
                onClick={onCreate}
                className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2"
            >
                <Plus className="w-3.5 h-3.5" />
                {t("createButton")}
            </button>
        </div>
    );
}