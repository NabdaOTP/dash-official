"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteTemplate } from "@/features/templates/services/template-service";
import type { MessageTemplate } from "@/features/templates/types";

interface DeleteTemplateDialogProps {
    open: boolean;
    onClose: () => void;
    template: MessageTemplate | null;
    projectId: string;
    onDeleted: (templateId: string) => void;
}

export function DeleteTemplateDialog({
    open,
    onClose,
    template,
    projectId,
    onDeleted,
}: DeleteTemplateDialogProps) {
    const t = useTranslations("templates.deleteDialog");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async() => {
            if (!open) setLoading(false);
        })()
    }, [open]);

    if (!open || !template) return null;

    const handleDelete = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await deleteTemplate(projectId, template.id);
            toast.success(t("success", { name: template.name }));
            onDeleted(template.id);
            onClose();
        } catch (err) {
            console.error("Failed to delete template:", err);
            toast.error(t("error"));
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !loading && onClose()}
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
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 pb-5">
                    <div className="rounded-xl bg-red-50/60 border border-red-100 p-3.5">
                        <p className="text-[13px] text-red-900 leading-relaxed">
                            {t.rich("warning", {
                                name: template.name,
                                bold: (chunks) => (
                                    <span className="font-mono font-semibold">{chunks}</span>
                                ),
                            })}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 bg-muted/30 border-t border-border/40">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all disabled:bg-red-300 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? t("deleting") : t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}