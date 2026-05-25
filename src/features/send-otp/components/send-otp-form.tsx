"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Send,
    Loader2,
    Phone,
    FileText,
    KeyRound,
    Target,
    Clock,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import {
    sendOtp,
    getAvailableOtpTemplateNames,
} from "@/features/send-otp/services/otp-service";
import { getProjectApiKeys } from "@/features/projects/services/project-service";
import type { ProjectApiKey } from "@/features/projects/types";
import type { WabaPhoneNumber } from "@/features/waba/types";
import type { SendResult } from "@/features/send-otp/types";

interface SendOtpFormProps {
    projectId: string;
    phoneNumbers: WabaPhoneNumber[];
    onSent: (result: SendResult, apiKeyUsed: string) => void;
}

const PURPOSE_OPTIONS = ["login", "signup", "reset", "verification", "transaction"];

export function SendOtpForm({ projectId, phoneNumbers, onSent }: SendOtpFormProps) {
    // form state
    const [recipient, setRecipient] = useState("");
    const [senderPhoneId, setSenderPhoneId] = useState<string>(
        phoneNumbers[0]?.phoneNumberId ?? ""
    );
    const [templateName, setTemplateName] = useState("");
    const [apiKeyId, setApiKeyId] = useState("");
    const [rawApiKey, setRawApiKey] = useState("");
    const [purpose, setPurpose] = useState("login");
    const [ttl, setTtl] = useState(300);

    // data
    const [availableTemplateNames, setAvailableTemplateNames] = useState<string[]>([]);
    const [apiKeys, setApiKeys] = useState<ProjectApiKey[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [templateLoadError, setTemplateLoadError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const activeApiKeys = useMemo(() => apiKeys.filter((k) => k.isActive), [apiKeys]);

    // load API keys
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const keys = await getProjectApiKeys(projectId).catch(
                    () => [] as ProjectApiKey[]
                );
                if (cancelled) return;
                setApiKeys(keys);

                const firstKey = keys.find((k) => k.isActive);
                if (firstKey) setApiKeyId(firstKey.id);
            } catch (err) {
                console.error("Failed to load API keys:", err);
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [projectId]);

    // load available template names from backend defaults/project templates
    useEffect(() => {
        let cancelled = false;
        const key = rawApiKey.trim();

        if (!key) {
            setAvailableTemplateNames([]);
            setTemplateLoadError(null);
            setLoadingTemplates(false);
            return;
        }

        setLoadingTemplates(true);
        setTemplateLoadError(null);

        (async () => {
            try {
                const names = await getAvailableOtpTemplateNames(key);
                if (cancelled) return;
                setAvailableTemplateNames(names);
                setTemplateName((current) => current || names[0] || "");
            } catch (err) {
                if (cancelled) return;
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load available templates";
                setAvailableTemplateNames([]);
                setTemplateLoadError(message);
            } finally {
                if (!cancelled) setLoadingTemplates(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [rawApiKey]);

    // validation
    const validate = (): string | null => {
        if (!recipient.trim()) return "Recipient phone number is required";
        // Strip + and spaces; require 8-15 digits (E.164 range)
        const digits = recipient.replace(/[^0-9]/g, "");
        if (digits.length < 8 || digits.length > 15)
            return "Phone number must be 8-15 digits in international format";
        if (!senderPhoneId) return "Select a sender phone number";
        if (!templateName.trim()) return "Template name is required";
        if (!rawApiKey.trim()) return "Paste your API key (it's not stored)";
        if (!purpose.trim()) return "Purpose is required";
        if (ttl < 60 || ttl > 900) return "TTL must be between 60 and 900 seconds";
        return null;
    };

    // submit
    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }
        if (submitting) return;

        setSubmitting(true);
        try {
            const cleanRecipient = recipient.replace(/[^0-9]/g, "");
            const chosenTemplate = templateName.trim();
            const response = await sendOtp(senderPhoneId, rawApiKey, {
                to: cleanRecipient,
                purpose: purpose.trim(),
                ttlSeconds: ttl,
                templateName: chosenTemplate,
            });

            const result: SendResult = {
                phoneNumber: cleanRecipient,
                purpose: purpose.trim(),
                templateName: chosenTemplate,
                sentAt: new Date(),
                messageId: response.messageId,
                code: response.code,
            };
            onSent(result, rawApiKey);
            toast.success("OTP sent successfully");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send OTP";
            console.error("Send OTP failed:", err);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    // render flags
    const hasNoActiveKeys = !loadingData && activeApiKeys.length === 0;
    const hasNoSenders = phoneNumbers.length === 0;
    const hasApiKey = rawApiKey.trim().length > 0;

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
                <h2 className="text-base font-semibold text-foreground">Send OTP</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                    Send a real WhatsApp OTP to test your integration
                </p>
            </div>

            {/* Sender phone number */}
            <Field label="From (Phone Number)" icon={<Phone className="w-3.5 h-3.5" />}>
                {hasNoSenders ? (
                    <EmptyHint text="No phone numbers connected to your WABA account." />
                ) : (
                    <SelectWrapper>
                        <select
                            aria-label="select field"
                            value={senderPhoneId}
                            onChange={(e) => setSenderPhoneId(e.target.value)}
                            disabled={submitting}
                            className="appearance-none w-full h-10 px-3.5 pr-9 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        >
                            {phoneNumbers.map((p) => (
                                <option key={p.id} value={p.phoneNumberId}>
                                    {p.displayPhoneNumber || p.phoneNumberId}
                                    {p.verifiedName ? ` - ${p.verifiedName}` : ""}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                )}
            </Field>

            {/* Recipient */}
            <Field
                label="Recipient Phone Number"
                helper="International format with country code (e.g. 201001234567)"
                icon={<Target className="w-3.5 h-3.5" />}
            >
                <input
                    type="tel"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="201001234567"
                    disabled={submitting}
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background font-mono text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                />
            </Field>

            {/* API key */}
            <Field
                label="API Key"
                helper="Paste an active API key. It is used only in this browser and never stored."
                icon={<KeyRound className="w-3.5 h-3.5" />}
            >
                {hasNoActiveKeys && (
                    <EmptyHint text="No active API keys. Create one in the API Keys page." />
                )}
                {!hasNoActiveKeys && (
                    <>
                        <SelectWrapper>
                            <select
                                aria-label="select field"
                                value={apiKeyId}
                                onChange={(e) => setApiKeyId(e.target.value)}
                                disabled={submitting || loadingData}
                                className="appearance-none w-full h-10 px-3.5 pr-9 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 mb-2"
                            >
                                {activeApiKeys.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.name}
                                    </option>
                                ))}
                            </select>
                        </SelectWrapper>
                        <input
                            type="password"
                            value={rawApiKey}
                            onChange={(e) => setRawApiKey(e.target.value)}
                            placeholder="sk_live_..."
                            disabled={submitting}
                            autoComplete="off"
                            className="w-full h-10 px-3.5 rounded-lg border border-border bg-background font-mono text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        />
                    </>
                )}
            </Field>

            {/* Template */}
            <Field
                label="Template"
                helper="Suggestions are loaded from backend Meta defaults and project templates for this API key."
                icon={<FileText className="w-3.5 h-3.5" />}
            >
                <input
                    type="text"
                    list="otp-template-suggestions"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="auth_otp_basic"
                    disabled={submitting}
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background font-mono text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                />
                <datalist id="otp-template-suggestions">
                    {availableTemplateNames.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>

                {!hasApiKey && (
                    <div className="mt-2">
                        <EmptyHint text="Paste API key first to load available Meta template names." />
                    </div>
                )}

                {hasApiKey && loadingTemplates && (
                    <div className="mt-2 text-[11.5px] text-muted-foreground inline-flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading available templates...
                    </div>
                )}

                {hasApiKey && !loadingTemplates && templateLoadError && (
                    <div className="mt-2">
                        <EmptyHint
                            text={`Could not load template suggestions: ${templateLoadError}`}
                        />
                    </div>
                )}

                {hasApiKey && !loadingTemplates && !templateLoadError && availableTemplateNames.length === 0 && (
                    <div className="mt-2">
                        <EmptyHint text="No template suggestions were returned. You can still type a template name manually." />
                    </div>
                )}
            </Field>

            {/* Purpose + TTL */}
            <div className="grid grid-cols-2 gap-3">
                <Field label="Purpose" helper="Used for tracking and verification">
                    <SelectWrapper>
                        <select
                            aria-label="select field"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            disabled={submitting}
                            className="appearance-none w-full h-10 px-3.5 pr-9 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        >
                            {PURPOSE_OPTIONS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                </Field>

                <Field label="TTL (seconds)" helper="Code validity period (60-900)">
                    <div className="relative">
                        <input
                            type="number"
                            value={ttl}
                            onChange={(e) => setTtl(parseInt(e.target.value, 10) || 0)}
                            min={60}
                            max={900}
                            disabled={submitting}
                            aria-label="input field"
                            className="w-full h-10 px-3.5 pr-10 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        />
                        <Clock className="w-3.5 h-3.5 text-muted-foreground absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </Field>
            </div>

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loadingData || hasNoActiveKeys || hasNoSenders}
                className="cursor-pointer w-full h-11 px-4 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#7C3AED]/20"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Send OTP
                    </>
                )}
            </button>
        </div>
    );
}

// -------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------

function Field({
    label,
    helper,
    icon,
    children,
}: {
    label: string;
    helper?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground mb-1.5">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                {label}
            </label>
            {children}
            {helper && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {helper}
                </p>
            )}
        </div>
    );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

function EmptyHint({ text }: { text: string }) {
    return (
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/30 px-3 py-2.5 text-[11.5px] text-amber-800 leading-relaxed">
            {text}
        </div>
    );
}
