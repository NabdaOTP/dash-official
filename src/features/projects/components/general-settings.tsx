"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useProjects } from "@/features/projects/context/projects-context";
import { useAuth } from "@/features/auth/context/auth-context";
import { DeleteProjectDialog } from "@/features/projects/components/delete-project-dialog";

export function GeneralSettings() {
    const t = useTranslations("settings.general");
    const locale = useLocale();
    const params = useParams();
    const projectId = params?.projectId as string;

    const { projects } = useProjects();
    const { user } = useAuth();

    const project = projects.find((p) => p.id === projectId);

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Owner check — only the owner can delete the project
    const isOwner = !!project && !!user && project.ownerId === user.id;

    // ── TEMP DEBUG — remove after fixing ──
    if (typeof window !== "undefined") {
        console.log("[GeneralSettings] debug:", {
            hasProject: !!project,
            hasUser: !!user,
            projectOwnerId: project?.ownerId,
            userId: user?.id,
            isOwner,
        });
    }

    if (!project) {
        return (
            <div className="rounded-2xl border border-border/60 p-8 bg-white text-center">
                <div className="text-sm text-muted-foreground">{t("loading")}</div>
            </div>
        );
    }

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            toast.success(t("copied"));
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    return (
        <div className="space-y-6">
            {/* ─── Page header ───────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-[#7C3AED]" />
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

            {/* ─── Project Information card ──────────────────────── */}
            <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)]">
                <div className="mb-5">
                    <h2 className="text-base font-semibold text-foreground">
                        {t("info.title")}
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        {t("info.subtitle")}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Project Name */}
                    <InfoRow
                        label={t("info.name")}
                        value={project.name}
                        helper={t("info.nameHelper")}
                        readonly
                    />

                    {/* Project ID */}
                    <InfoRow
                        label={t("info.id")}
                        value={project.id}
                        mono
                        copyable
                        isCopied={copiedField === "id"}
                        onCopy={() => handleCopy(project.id, "id")}
                        helper={t("info.idHelper")}
                    />

                    {/* Created date */}
                    <InfoRow
                        label={t("info.created")}
                        value={formatDate(project.createdAt)}
                    />

                    {/* Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-center">
                        <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                            {t("info.status")}
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium ${project.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${project.isActive ? "bg-green-500" : "bg-gray-400"
                                        }`}
                                />
                                {project.isActive ? t("info.statusActive") : t("info.statusInactive")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone (owner only)  */}
            {isOwner ? (
                <div className="rounded-2xl border border-red-200 bg-white overflow-hidden">
                    {/* Header strip */}
                    <div className="border-b border-red-100 bg-red-50/40 px-5 sm:px-6 py-4">
                        <h2 className="text-base font-semibold text-red-900">
                            {t("danger.title")}
                        </h2>
                        <p className="text-[12px] text-red-700/80 mt-0.5">
                            {t("danger.subtitle")}
                        </p>
                    </div>

                    {/* Body — stacked on mobile, side-by-side on md+ */}
                    <div className="px-5 sm:px-6 py-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[14px] font-semibold text-foreground">
                                    {t("danger.deleteTitle")}
                                </h3>
                                <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                                    {t("danger.deleteDescription")}
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteDialogOpen(true)}
                                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                                className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-medium active:scale-[0.99] transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t("danger.deleteButton")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 sm:p-6">
                    <p className="text-[12.5px] text-muted-foreground">
                        {t("nonOwnerNotice")}
                    </p>
                </div>
            )}

            {/* ─── Delete dialog ─────────────────────────────────── */}
            <DeleteProjectDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                projectId={project.id}
                projectName={project.name}
            />
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Sub-component: InfoRow
// ────────────────────────────────────────────────────────────
interface InfoRowProps {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
    isCopied?: boolean;
    onCopy?: () => void;
    helper?: string;
    readonly?: boolean;
}

function InfoRow({
    label,
    value,
    mono,
    copyable,
    isCopied,
    onCopy,
    helper,
    readonly,
}: InfoRowProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground pt-2">
                {label}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div
                        className={`flex-1 h-10 px-3.5 rounded-lg bg-muted/40 border border-border/40 flex items-center text-[13.5px] text-foreground ${mono ? "font-mono text-[12.5px]" : ""
                            } ${readonly ? "select-text" : ""}`}
                    >
                        <span className="truncate">{value}</span>
                    </div>
                    {copyable && (
                        <button
                            type="button"
                            onClick={onCopy}
                            className="cursor-pointer w-10 h-10 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Copy"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>
                {helper && (
                    <p className="text-[11.5px] text-muted-foreground">{helper}</p>
                )}
            </div>
        </div>
    );
}