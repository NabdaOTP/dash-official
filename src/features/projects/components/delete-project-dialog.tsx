"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteProject } from "@/features/projects/services/project-service";
import { useProjects } from "@/features/projects/context/projects-context";

interface DeleteProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
}

export function DeleteProjectDialog({
    open,
    onClose,
    projectId,
    projectName,
}: DeleteProjectDialogProps) {
    const t = useTranslations("settings.general.deleteDialog");
    const router = useRouter();
    const { refresh: refreshProjects } = useProjects();

    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setConfirmText("");
        setLoading(false);
        onClose();
    };

    const isMatch = confirmText.trim() === projectName.trim();

    const handleDelete = async () => {
        if (!isMatch || loading) return;

        setLoading(true);
        try {
            await deleteProject(projectId);
            toast.success(t("success", { name: projectName }));

            // Refresh projects list in context so it disappears from sidebar/grid
            await refreshProjects();

            // Navigate back to projects list
            router.push("/projects");
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error(t("error"));
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !loading && handleClose()}
        >
            <div
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 sm:p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                {t("title")}
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                {t("subtitle")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 pb-5 space-y-4">
                    {/* Warning callout */}
                    <div className="rounded-xl bg-red-50/60 border border-red-100 p-5">
                        <p className="text-[13px] text-red-900 leading-relaxed">
                            {t.rich("warning", {
                                name: projectName,
                                bold: (chunks) => (
                                    <span className="font-semibold">{chunks}</span>
                                ),
                            })}
                        </p>
                        <ul className="mt-2.5 space-y-1 text-[12.5px] text-red-800/90">
                            <li className="flex gap-1.5">
                                <span className="text-red-400">•</span>
                                <span>{t("items.apiKeys")}</span>
                            </li>
                            <li className="flex gap-1.5">
                                <span className="text-red-400">•</span>
                                <span>{t("items.members")}</span>
                            </li>
                            <li className="flex gap-1.5">
                                <span className="text-red-400">•</span>
                                <span>{t("items.messages")}</span>
                            </li>
                            <li className="flex gap-1.5">
                                <span className="text-red-400">•</span>
                                <span>{t("items.billing")}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Type-to-confirm */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="confirm-input"
                            className="block text-[12.5px] text-foreground"
                        >
                            {t.rich("typeToConfirm", {
                                name: projectName,
                                code: (chunks) => (
                                    <span className="font-mono font-semibold text-[13px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                                        {chunks}
                                    </span>
                                ),
                            })}
                        </label>
                        <input
                            id="confirm-input"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                            autoFocus
                            className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-red-500/30 focus:border-red-500 disabled:opacity-50"
                            placeholder={projectName}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 bg-muted/30 border-t border-border/40">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!isMatch || loading}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all disabled:bg-red-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? t("deleting") : t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}