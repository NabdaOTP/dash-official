// ─────────────────────────────────────────────────────────────
// File: src/features/templates/lib/template-builder.ts
// ─────────────────────────────────────────────────────────────

import type {
    TemplateComponent,
    TemplateFormState,
    TemplateStatus,
    TemplateCategory,
} from "../types";

/**
 * Convert the UI form state into Meta's expected `components` array.
 * Drops empty optional sections.
 */
export function buildComponents(form: TemplateFormState): TemplateComponent[] {
    const components: TemplateComponent[] = [];

    // HEADER (optional, text only for now)
    if (form.headerText.trim()) {
        components.push({
            type: "HEADER",
            format: "TEXT",
            text: form.headerText.trim(),
        });
    }

    // BODY (required)
    components.push({
        type: "BODY",
        text: form.bodyText.trim(),
    });

    // FOOTER (optional)
    if (form.footerText.trim()) {
        components.push({
            type: "FOOTER",
            text: form.footerText.trim(),
        });
    }

    // BUTTONS — Copy Code button (mainly for OTP templates)
    if (form.includeCopyCodeButton && form.copyCodeButtonText.trim()) {
        components.push({
            type: "BUTTONS",
            buttons: [
                {
                    type: "OTP",
                    otp_type: "COPY_CODE",
                    text: form.copyCodeButtonText.trim(),
                },
            ],
        });
    }

    return components;
}

/**
 * Validate the template name follows Meta's rules:
 * - lowercase letters, numbers, underscores only
 * - 1-512 chars
 */
export function validateTemplateName(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) return "Name is required";
    if (trimmed.length > 512) return "Name must be 512 characters or fewer";
    if (!/^[a-z0-9_]+$/.test(trimmed))
        return "Name must contain only lowercase letters, numbers, and underscores";
    return null;
}

/**
 * Validate the body text. Meta requires non-empty body, max 1024 chars.
 */
export function validateBody(body: string): string | null {
    const trimmed = body.trim();
    if (!trimmed) return "Body is required";
    if (trimmed.length > 1024) return "Body must be 1024 characters or fewer";
    return null;
}

/**
 * Count `{{1}}, {{2}}` placeholders in a string.
 */
export function countVariables(text: string): number {
    const matches = text.match(/\{\{(\d+)\}\}/g);
    if (!matches) return 0;
    // Return the highest number used (Meta requires sequential numbering)
    return Math.max(
        ...matches.map((m) => parseInt(m.replace(/[{}]/g, ""), 10))
    );
}

/**
 * Preset starter templates the user can pick from.
 */
export const TEMPLATE_PRESETS: Record<
    "otp_basic" | "otp_with_button" | "blank",
    {
        id: "otp_basic" | "otp_with_button" | "blank";
        titleKey: string;
        descriptionKey: string;
        form: TemplateFormState;
    }
> = {
    otp_basic: {
        id: "otp_basic",
        titleKey: "presets.otp_basic.title",
        descriptionKey: "presets.otp_basic.description",
        form: {
            name: "auth_otp_basic",
            category: "AUTHENTICATION",
            language: "en_US",
            headerText: "",
            bodyText: "Your verification code is {{1}}. Do not share this code with anyone.",
            footerText: "This code expires in 10 minutes.",
            includeCopyCodeButton: false,
            copyCodeButtonText: "Copy Code",
        },
    },
    otp_with_button: {
        id: "otp_with_button",
        titleKey: "presets.otp_with_button.title",
        descriptionKey: "presets.otp_with_button.description",
        form: {
            name: "auth_otp_basic",
            category: "AUTHENTICATION",
            language: "en_US",
            headerText: "",
            bodyText: "Your verification code is {{1}}. Do not share this code with anyone.",
            footerText: "This code expires in 10 minutes.",
            includeCopyCodeButton: true,
            copyCodeButtonText: "Copy Code",
        },
    },
    blank: {
        id: "blank",
        titleKey: "presets.blank.title",
        descriptionKey: "presets.blank.description",
        form: {
            name: "",
            category: "AUTHENTICATION",
            language: "en_US",
            headerText: "",
            bodyText: "",
            footerText: "",
            includeCopyCodeButton: false,
            copyCodeButtonText: "Copy Code",
        },
    },
};

/**
 * Default empty form state.
 */
export const EMPTY_FORM: TemplateFormState = TEMPLATE_PRESETS.blank.form;

/**
 * Get the visual styling for a template status badge.
 */
export function getStatusStyle(status: TemplateStatus) {
    switch (status) {
        case "APPROVED":
            return {
                bg: "bg-green-50",
                text: "text-green-700",
                dot: "bg-green-500",
                border: "border-green-200",
            };
        case "PENDING":
        case "IN_APPEAL":
            return {
                bg: "bg-yellow-50",
                text: "text-yellow-700",
                dot: "bg-yellow-500",
                border: "border-yellow-200",
            };
        case "REJECTED":
        case "DISABLED":
            return {
                bg: "bg-red-50",
                text: "text-red-700",
                dot: "bg-red-500",
                border: "border-red-200",
            };
        case "PAUSED":
            return {
                bg: "bg-orange-50",
                text: "text-orange-700",
                dot: "bg-orange-500",
                border: "border-orange-200",
            };
        case "DRAFT":
        default:
            return {
                bg: "bg-gray-100",
                text: "text-gray-600",
                dot: "bg-gray-400",
                border: "border-gray-200",
            };
    }
}

/**
 * Get the visual styling for a category badge.
 */
export function getCategoryStyle(category: TemplateCategory) {
    switch (category) {
        case "AUTHENTICATION":
            return { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" };
        case "UTILITY":
            return { bg: "bg-blue-50", text: "text-blue-700" };
        case "MARKETING":
            return { bg: "bg-pink-50", text: "text-pink-700" };
    }
}

/**
 * Supported languages for templates.
 * Limited list focused on Nabda's primary markets.
 */
export const SUPPORTED_LANGUAGES: { code: string; name: string }[] = [
    { code: "en_US", name: "English (US)" },
    { code: "en_GB", name: "English (UK)" },
    { code: "ar", name: "Arabic" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt_BR", name: "Portuguese (BR)" },
    { code: "tr", name: "Turkish" },
    { code: "ru", name: "Russian" },
    { code: "hi", name: "Hindi" },
    { code: "id", name: "Indonesian" },
    { code: "zh_CN", name: "Chinese (Simplified)" },
];
