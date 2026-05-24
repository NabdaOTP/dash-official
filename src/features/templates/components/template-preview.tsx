"use client";

import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import type { TemplateFormState } from "@/features/templates/types";

interface TemplatePreviewProps {
    form: TemplateFormState;
}

export function TemplatePreview({ form }: TemplatePreviewProps) {
    const t = useTranslations("templates.preview");

    // Replace {{1}}, {{2}} placeholders with example values for preview
    const renderText = (text: string) => {
        return text.replace(/\{\{(\d+)\}\}/g, (_, num) => {
            // Common OTP example for {{1}}
            if (num === "1") return "123456";
            return `example${num}`;
        });
    };

    const hasContent = form.bodyText.trim().length > 0;

    return (
        <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                {t("title")}
            </div>

            {/* WhatsApp-style chat bubble */}
            <div className="rounded-2xl bg-[#E5DDD5] p-4 min-h-[280px] relative overflow-hidden">
                {/* Subtle pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #000 1px, transparent 1px)",
                        backgroundSize: "12px 12px",
                    }}
                />

                {hasContent ? (
                    <div className="relative max-w-[280px]">
                        {/* Message bubble */}
                        <div className="bg-white rounded-lg rounded-tl-none shadow-sm overflow-hidden">
                            {/* HEADER */}
                            {form.headerText.trim() && (
                                <div className="px-3 pt-2.5 pb-1">
                                    <p className="text-[13px] font-bold text-black/90 leading-snug whitespace-pre-wrap break-words">
                                        {renderText(form.headerText)}
                                    </p>
                                </div>
                            )}

                            {/* BODY */}
                            <div className="px-3 py-2">
                                <p className="text-[13px] text-black/85 leading-relaxed whitespace-pre-wrap break-words">
                                    {renderText(form.bodyText)}
                                </p>
                            </div>

                            {/* FOOTER */}
                            {form.footerText.trim() && (
                                <div className="px-3 pb-2">
                                    <p className="text-[11px] text-black/50 leading-relaxed whitespace-pre-wrap break-words">
                                        {renderText(form.footerText)}
                                    </p>
                                </div>
                            )}

                            {/* Timestamp */}
                            <div className="px-3 pb-1.5 flex justify-end">
                                <span className="text-[10px] text-black/40">12:34</span>
                            </div>

                            {/* BUTTON */}
                            {form.includeCopyCodeButton &&
                                form.copyCodeButtonText.trim() && (
                                    <div className="border-t border-black/5">
                                        <div className="flex items-center justify-center gap-1.5 py-2.5 text-[#00A5F4] text-[13px] font-medium">
                                            <Copy className="w-3.5 h-3.5" />
                                            {form.copyCodeButtonText}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                ) : (
                    <div className="relative flex items-center justify-center h-full min-h-[260px]">
                        <p className="text-[12.5px] text-black/40 text-center max-w-[200px]">
                            {t("emptyHint")}
                        </p>
                    </div>
                )}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("variableHint")}
            </p>
        </div>
    );
}