"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    X, Loader2, FileText, Sparkles, Pencil, ArrowLeft,
    Plus, Minus, Send,
} from "lucide-react";
import { toast } from "sonner";

import { createTemplate } from "@/features/templates/services/template-service";
import {
    buildComponents, validateTemplateName, validateBody, countVariables,
    TEMPLATE_PRESETS, EMPTY_FORM, SUPPORTED_LANGUAGES,
} from "@/features/templates/lib/template-builder";
import type {
    MessageTemplate, TemplateCategory, TemplateFormState,
} from "@/features/templates/types";

import { TemplatePreview } from "./template-preview";

interface CreateTemplateDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    wabaAccountId: string;
    onCreated: (template: MessageTemplate) => void;
}

type Step = "presets" | "builder";

const CATEGORIES = [
    {
        id: "AUTHENTICATION" as const,
        label: "Authentication",
        description: "OTP and verification codes",
        icon: "🔐",
    },
    {
        id: "UTILITY" as const,
        label: "Utility",
        description: "Order updates, appointments",
        icon: "📦",
        comingSoon: true,  // ← ADD this flag
    },
    {
        id: "MARKETING" as const,
        label: "Marketing",
        description: "Promotional messages",
        icon: "📣",
        comingSoon: true,  // ← ADD this flag
    },
];

export function CreateTemplateDialog({
    open,
    onClose,
    projectId,
    wabaAccountId,
    onCreated,
}: CreateTemplateDialogProps) {
    const t = useTranslations("templates.createDialog");
    const tPresets = useTranslations("templates.createDialog.presets");

    const [step, setStep] = useState<Step>("presets");
    const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset when dialog opens

    useEffect(() => {
        (async () => {
            if (open) {
                setStep("presets");
                setForm(EMPTY_FORM);
                setErrors({});
                setSubmitting(false);
            }
        })()
    }, [open]);

    if (!open) return null;

    const handlePresetSelect = (presetId: keyof typeof TEMPLATE_PRESETS) => {
        setForm(TEMPLATE_PRESETS[presetId].form);
        setStep("builder");
    };

    const updateForm = <K extends keyof TemplateFormState>(
        key: K,
        value: TemplateFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        // Clear field error on change
        if (errors[key as string]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key as string];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const nameError = validateTemplateName(form.name);
        if (nameError) newErrors.name = nameError;
        const bodyError = validateBody(form.bodyText);
        if (bodyError) newErrors.bodyText = bodyError;
        if (form.includeCopyCodeButton && !form.copyCodeButtonText.trim()) {
            newErrors.copyCodeButtonText = t("errors.buttonTextRequired");
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || submitting) return;
        setSubmitting(true);
        try {
            const components = buildComponents(form);
            const created = await createTemplate(projectId, {
                name: form.name.trim(),
                category: form.category,
                language: form.language,
                components,
                wabaAccountId,
                options: { allow_category_change: true },
            });
            toast.success(t("submitSuccess", { name: form.name }));
            onCreated(created);
            onClose();
        } catch (err) {
            console.error("Failed to create template:", err);
            const msg =
                err instanceof Error ? err.message : t("submitError");
            toast.error(msg);
            setSubmitting(false);
        }
    };

    const bodyVarCount = countVariables(form.bodyText);
    const headerVarCount = countVariables(form.headerText);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !submitting && onClose()}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/40 shrink-0">
                    <div className="flex items-center gap-3">
                        {step === "builder" && (
                            <button
                                type="button"
                                onClick={() => setStep("presets")}
                                disabled={submitting}
                                className="cursor-pointer w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50"
                                aria-label={t("back")}
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                {step === "presets" ? t("title") : t("builderTitle")}
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                {step === "presets" ? t("subtitle") : t("builderSubtitle")}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ─── Body ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    {step === "presets" ? (
                        <div className="p-5 sm:p-6 space-y-3">
                            <PresetCard
                                icon={<Sparkles className="w-5 h-5 text-[#7C3AED]" />}
                                title={tPresets("otp_with_button.title")}
                                description={tPresets("otp_with_button.description")}
                                badge={t("recommended")}
                                onClick={() => handlePresetSelect("otp_with_button")}
                            />
                            <PresetCard
                                icon={<FileText className="w-5 h-5 text-blue-600" />}
                                iconBg="bg-blue-50"
                                title={tPresets("otp_basic.title")}
                                description={tPresets("otp_basic.description")}
                                onClick={() => handlePresetSelect("otp_basic")}
                            />
                            <PresetCard
                                icon={<Pencil className="w-5 h-5 text-gray-600" />}
                                iconBg="bg-gray-100"
                                title={tPresets("blank.title")}
                                description={tPresets("blank.description")}
                                onClick={() => handlePresetSelect("blank")}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-5 sm:p-6">
                            {/* ─── Builder form ─── */}
                            <div className="space-y-5">
                                {/* Name */}
                                <Field
                                    label={t("fields.name")}
                                    helper={t("fields.nameHelper")}
                                    error={errors.name}
                                    required
                                >
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateForm("name", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
                                        }
                                        disabled={submitting}
                                        placeholder="auth_otp_basic"
                                        className="w-full h-10 px-3.5 rounded-lg border border-border bg-background font-mono text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                    />
                                </Field>

                                {/* Category + Language */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label={t("fields.category")} required>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {CATEGORIES.map((cat) => {
                                                const isDisabled = cat.comingSoon;
                                                const isActive = form.category === cat.id && !isDisabled;

                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => !isDisabled && updateForm("category", cat.id)}
                                                        disabled={isDisabled}
                                                        title={isDisabled ? "Coming soon" : undefined}
                                                        className={`relative rounded-lg p-3 text-left border transition-all ${isDisabled
                                                            ? "bg-muted/30 border-border/40 cursor-not-allowed opacity-60"
                                                            : isActive
                                                                ? "bg-[#F8F7FF] border-[#7C3AED] cursor-pointer"
                                                                : "bg-white border-border/60 hover:border-[#7C3AED]/40 cursor-pointer"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <div className="text-[18px] leading-none mt-0.5">{cat.icon}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <p className={`text-[13px] font-semibold leading-tight ${isActive ? "text-[#7C3AED]" : "text-foreground"
                                                                        }`}>
                                                                        {cat.label}
                                                                    </p>
                                                                    {isDisabled && (
                                                                        <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                                            <Lock className="w-2 h-2" />
                                                                            Soon
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                                                    {cat.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Field>

                                    <Field label={t("fields.language")} required>
                                        <select
                                            value={form.language}
                                            onChange={(e) => updateForm("language", e.target.value)}
                                            disabled={submitting}
                                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                            aria-label="select lang"
                                        >
                                            {SUPPORTED_LANGUAGES.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Header — optional toggle */}
                                <ToggleSection
                                    label={t("fields.header")}
                                    helper={t("fields.headerHelper")}
                                    enabled={form.headerText.length > 0}
                                    onToggle={(enabled) =>
                                        updateForm("headerText", enabled ? "Hello {{1}}!" : "")
                                    }
                                    disabled={submitting}
                                >
                                    <input
                                        type="text"
                                        value={form.headerText}
                                        onChange={(e) => updateForm("headerText", e.target.value)}
                                        disabled={submitting}
                                        maxLength={60}
                                        placeholder={t("fields.headerPlaceholder")}
                                        className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                    />
                                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                        <span>
                                            {headerVarCount > 0 && t("variableCount", { count: headerVarCount })}
                                        </span>
                                        <span>{form.headerText.length}/60</span>
                                    </div>
                                </ToggleSection>

                                {/* Body — required */}
                                <Field
                                    label={t("fields.body")}
                                    helper={t("fields.bodyHelper")}
                                    error={errors.bodyText}
                                    required
                                >
                                    <textarea
                                        value={form.bodyText}
                                        onChange={(e) => updateForm("bodyText", e.target.value)}
                                        disabled={submitting}
                                        rows={4}
                                        maxLength={1024}
                                        placeholder={t("fields.bodyPlaceholder")}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 resize-none leading-relaxed"
                                    />
                                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                        <span>
                                            {bodyVarCount > 0 && t("variableCount", { count: bodyVarCount })}
                                        </span>
                                        <span>{form.bodyText.length}/1024</span>
                                    </div>
                                </Field>

                                {/* Footer — optional toggle */}
                                <ToggleSection
                                    label={t("fields.footer")}
                                    helper={t("fields.footerHelper")}
                                    enabled={form.footerText.length > 0}
                                    onToggle={(enabled) =>
                                        updateForm("footerText", enabled ? "Code expires in 10 minutes." : "")
                                    }
                                    disabled={submitting}
                                >
                                    <input
                                        type="text"
                                        value={form.footerText}
                                        onChange={(e) => updateForm("footerText", e.target.value)}
                                        disabled={submitting}
                                        maxLength={60}
                                        placeholder={t("fields.footerPlaceholder")}
                                        className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                    />
                                    <div className="flex justify-end text-[11px] text-muted-foreground mt-1">
                                        <span>{form.footerText.length}/60</span>
                                    </div>
                                </ToggleSection>

                                {/* Copy Code button — optional toggle */}
                                <ToggleSection
                                    label={t("fields.copyCodeButton")}
                                    helper={t("fields.copyCodeHelper")}
                                    enabled={form.includeCopyCodeButton}
                                    onToggle={(enabled) =>
                                        updateForm("includeCopyCodeButton", enabled)
                                    }
                                    disabled={submitting}
                                >
                                    <input
                                        type="text"
                                        value={form.copyCodeButtonText}
                                        onChange={(e) =>
                                            updateForm("copyCodeButtonText", e.target.value)
                                        }
                                        disabled={submitting}
                                        maxLength={25}
                                        placeholder="Copy Code"
                                        className={`w-full h-10 px-3.5 rounded-lg border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 ${errors.copyCodeButtonText ? "border-red-300" : "border-border"
                                            }`}
                                    />
                                    {errors.copyCodeButtonText && (
                                        <p className="text-[11px] text-red-600 mt-1">
                                            {errors.copyCodeButtonText}
                                        </p>
                                    )}
                                </ToggleSection>
                            </div>

                            {/* ─── Live preview ─── */}
                            <div className="lg:sticky lg:top-0 self-start">
                                <TemplatePreview form={form} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Footer (builder step only)  */}
                {step === "builder" && (
                    <div className="flex items-center justify-between gap-2 px-5 sm:px-6 py-4 bg-muted/30 border-t border-border/40 shrink-0">
                        <p className="text-[11.5px] text-muted-foreground">
                            {t("submitInfo")}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                                {submitting ? t("submitting") : t("submit")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function PresetCard({
    icon,
    iconBg = "bg-[#EDE9FE]",
    title,
    description,
    badge,
    onClick,
}: {
    icon: React.ReactNode;
    iconBg?: string;
    title: string;
    description: string;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="cursor-pointer w-full text-left rounded-2xl border border-border/60 bg-white p-4 hover:border-[#7C3AED]/40 hover:shadow-[0_4px_12px_rgba(124,58,237,0.08)] active:scale-[0.99] transition-all group"
        >
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[14px] font-semibold text-foreground">
                            {title}
                        </h3>
                        {badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] uppercase tracking-wide font-bold bg-[#7C3AED] text-white">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

function Field({
    label, helper, error, required, children,
}: {
    label: string;
    helper?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[12.5px] font-semibold text-foreground mb-1.5">
                {label}
                {required && <span className="text-red-500 ms-1">*</span>}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
            {!error && helper && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {helper}
                </p>
            )}
        </div>
    );
}

function ToggleSection({
    label, helper, enabled, onToggle, children, disabled,
}: {
    label: string;
    helper?: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <button
                type="button"
                onClick={() => onToggle(!enabled)}
                disabled={disabled}
                className="cursor-pointer w-full flex items-center justify-between gap-3 disabled:opacity-50"
            >
                <div className="text-left min-w-0">
                    <div className="text-[12.5px] font-semibold text-foreground">
                        {label}
                    </div>
                    {helper && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            {helper}
                        </div>
                    )}
                </div>
                <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${enabled
                        ? "bg-[#7C3AED] text-white"
                        : "bg-white border border-border text-muted-foreground"
                        }`}
                >
                    {enabled ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
            </button>
            {enabled && <div className="mt-3">{children}</div>}
        </div>
    );
}