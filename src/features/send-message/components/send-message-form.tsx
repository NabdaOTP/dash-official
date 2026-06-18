"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Send, Loader2, Phone, FileText, KeyRound, Target,
    ChevronDown, Plus, Trash2, Type,
} from "lucide-react";
import { toast } from "sonner";

import { sendMessage } from "@/features/send-message/services/message-service";
import { getTemplates } from "@/features/templates/services/template-service";
import { getProjectApiKeys } from "@/features/projects/services/project-service";
import type { MessageTemplate } from "@/features/templates/types";
import type { ProjectApiKey } from "@/features/projects/types";
import type { WabaAccount } from "@/features/waba/types";
import type {
    MessageSendEvidence,
    MessageSendResult,
} from "@/features/send-message/types";

interface VariableRow {
    id: string;
    value: string;
}

interface SendMessageFormProps {
    projectId: string;
    accounts: WabaAccount[];
    initialRecipient?: string;
    onSent: (result: MessageSendResult, evidence: MessageSendEvidence) => void;
}

export function SendMessageForm({
    projectId,
    accounts,
    initialRecipient,
    onSent,
}: SendMessageFormProps) {
    // ── form state ───────────────────────────────────────────
    const [recipient, setRecipient] = useState("");
    const [senderAccountId, setSenderAccountId] = useState<string>(
        accounts[0]?.id ?? ""
    );
    const [templateName, setTemplateName] = useState("");
    const [apiKeyId, setApiKeyId] = useState("");
    const [variables, setVariables] = useState<VariableRow[]>([]);

    // ── data ─────────────────────────────────────────────────
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [apiKeys, setApiKeys] = useState<ProjectApiKey[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!initialRecipient) return;
        setRecipient((current) => current.trim() ? current : initialRecipient);
    }, [initialRecipient]);

    const selectedAccount = useMemo(
        () => accounts.find((a) => a.id === senderAccountId),
        [accounts, senderAccountId]
    );

    const selectedTemplate = useMemo(
        () => templates.find((t) => t.name === templateName),
        [templates, templateName]
    );
    const selectedApiKey = useMemo(
        () => apiKeys.find((k) => k.id === apiKeyId) || apiKeys.find((k) => k.isActive),
        [apiKeys, apiKeyId]
    );

    const sendableTemplates = useMemo(
        () => templates.filter((t) => isSendableTemplate(t.status)),
        [templates]
    );
    const activeApiKeys = useMemo(
        () => apiKeys.filter((k) => k.isActive),
        [apiKeys]
    );

    // ── load templates + api keys ────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [tpls, keys] = await Promise.all([
                    getTemplates(projectId).catch(() => [] as MessageTemplate[]),
                    getProjectApiKeys(projectId).catch(() => [] as ProjectApiKey[]),
                ]);
                if (cancelled) return;
                setTemplates(tpls);
                setApiKeys(keys);
                const firstSendable = tpls.find((t) => isSendableTemplate(t.status));
                if (firstSendable) setTemplateName(firstSendable.name);
                const firstKey = keys.find((k) => k.isActive);
                if (firstKey) setApiKeyId(firstKey.id);
            } catch (err) {
                console.error("Failed to load form data:", err);
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [projectId]);

    useEffect(() => {
        if (accounts.length === 0) return;

        const selectedStillExists = accounts.some((account) => account.id === senderAccountId);
        if (!selectedStillExists) {
            setSenderAccountId(accounts[0].id);
        }
    }, [accounts, senderAccountId]);

    // ── extract variable placeholders from the selected template ───
    const variableCount = useMemo(() => {
        if (!selectedTemplate?.components) return 0;
        const bodyComponent = selectedTemplate.components.find(
            (c) => c.type === "BODY"
        );
        if (!bodyComponent?.text) return 0;
        const matches = bodyComponent.text.match(/\{\{(\d+)\}\}/g);
        if (!matches) return 0;
        // Get the highest variable number used
        const numbers = matches
            .map((m) => parseInt(m.replace(/[^0-9]/g, ""), 10))
            .filter((n) => !isNaN(n));
        return Math.max(0, ...numbers);
    }, [selectedTemplate]);

    // Reset variables when template changes
    useEffect(() => {
        (async () => {
            if (variableCount === 0) {
                setVariables([]);
                return;
            }
            setVariables(
                Array.from({ length: variableCount }, (_, i) => ({
                    id: `var-${i}`,
                    value: "",
                }))
            );
        })()
    }, [variableCount]);


    const updateVariable = (id: string, value: string) => {
        setVariables((prev) =>
            prev.map((v) => (v.id === id ? { ...v, value } : v))
        );
    };

    // ── validation ───────────────────────────────────────────
    const validate = (): string | null => {
        if (!recipient.trim()) return "Recipient phone number is required";
        const digits = recipient.replace(/[^0-9]/g, "");
        if (digits.length < 8 || digits.length > 15)
            return "Phone must be 8-15 digits in international format";
        if (!selectedAccount) return "Select a sender account";
        if (!templateName) return "Select an approved template";
        if (!selectedApiKey?.rawKey?.trim()) return "Create or select an active API key";
        // Check that all variables are filled
        for (let i = 0; i < variables.length; i++) {
            if (!variables[i].value.trim()) {
                return `Variable {{${i + 1}}} is required`;
            }
        }
        return null;
    };

    // ── submit ───────────────────────────────────────────────
    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }
        if (submitting || !selectedAccount || !selectedTemplate) return;

        setSubmitting(true);
        try {
            const cleanRecipient = recipient.replace(/[^0-9]/g, "");
            const varsArray = variables.map((v) => v.value.trim());
            const apiKey = selectedApiKey?.rawKey?.trim();
            if (!apiKey) {
                toast.error("Create or select an active API key");
                return;
            }

            const response = await sendMessage(
                selectedAccount.phoneNumberId,
                apiKey,
                {
                    to: cleanRecipient,
                    templateName,
                    language: selectedTemplate.language,
                    variables: varsArray.length > 0 ? varsArray : undefined,
                }
            );

            const result: MessageSendResult = {
                phoneNumber: cleanRecipient,
                templateName,
                language: selectedTemplate.language,
                variables: varsArray,
                sentAt: new Date(),
                messageId: response.messageId,
            };

            const requestBody = {
                to: cleanRecipient,
                templateName,
                language: selectedTemplate.language,
                variables: varsArray.length > 0 ? varsArray : undefined,
            };
            const redactedToken = maskToken(apiKey);
            const requestCurl = buildCurl({
                phoneNumberId: selectedAccount.phoneNumberId,
                requestBody,
                redactedToken,
                baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
            });
            const evidence: MessageSendEvidence = {
                endpoint: `/api/v1/external/waba/${selectedAccount.phoneNumberId}/messages`,
                method: "POST",
                requestBody,
                requestCurl,
                redactedToken,
                responseBody: JSON.stringify(response, null, 2),
            };

            result.evidence = evidence;
            onSent(result, evidence);
            toast.success("Message sent successfully");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send";
            console.error("Send message failed:", err);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const hasNoApprovedTemplates = !loadingData && sendableTemplates.length === 0;
    const hasNoActiveKeys = !loadingData && activeApiKeys.length === 0;

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
                <h2 className="text-base font-semibold text-foreground">
                    Send WhatsApp Message
                </h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                    Send any approved template to a WhatsApp number
                </p>
            </div>

            {/* Sender */}
            <Field label="From (Sender Account)" icon={<Phone className="w-3.5 h-3.5" />}>
                <SelectWrapper>
                    <select
                        aria-label="select"
                        value={senderAccountId}
                        onChange={(e) => setSenderAccountId(e.target.value)}
                        disabled={submitting}
                        className="appearance-none w-full h-10 px-3.5 pe-9 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                    >
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.displayPhoneNumber}
                                {a.name ? ` — ${a.name}` : ""}
                            </option>
                        ))}
                    </select>
                </SelectWrapper>
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

            {/* Template */}
            <Field
                label="Template"
                helper="Sendable templates loaded from Meta. Rejected, disabled, and draft templates are hidden."
                icon={<FileText className="w-3.5 h-3.5" />}
            >
                {hasNoApprovedTemplates ? (
                    <EmptyHint text="No sendable templates yet. Sync templates from Meta or create one first." />
                ) : (
                    <SelectWrapper>
                        <select
                            aria-label="select"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            disabled={submitting || loadingData}
                            className="appearance-none w-full h-10 px-3.5 pe-9 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        >
                            <option value="">Select a template…</option>
                            {sendableTemplates.map((t) => (
                                <option key={t.id} value={t.name}>
                                    {t.name} ({t.language}) — {t.category}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                )}
            </Field>

            {/* Template Preview */}
            {selectedTemplate && (
                <TemplatePreview template={selectedTemplate} variables={variables} />
            )}

            {/* Variables */}
            {variableCount > 0 && (
                <Field
                    label={`Variables (${variableCount})`}
                    helper="Fill in values for each placeholder in the template body"
                    icon={<Type className="w-3.5 h-3.5" />}
                >
                    <div className="space-y-2">
                        {variables.map((v, i) => (
                            <div key={v.id} className="flex items-center gap-2">
                                <code className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded shrink-0">
                                    {`{{${i + 1}}}`}
                                </code>
                                <span className="text-muted-foreground text-[12px]">=</span>
                                <input
                                    type="text"
                                    value={v.value}
                                    onChange={(e) => updateVariable(v.id, e.target.value)}
                                    disabled={submitting}
                                    placeholder={`Value for {{${i + 1}}}`}
                                    className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                />
                            </div>
                        ))}
                    </div>
                </Field>
            )}

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={
                    submitting ||
                    loadingData ||
                    hasNoApprovedTemplates ||
                    hasNoActiveKeys
                }
                className="cursor-pointer w-full h-11 px-4 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#7C3AED]/20"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Send Message
                    </>
                )}
            </button>
        </div>
    );
}

function maskToken(token: string): string {
    const clean = token.trim();
    if (!clean) return "Bearer [redacted]";
    const tail = clean.slice(-4);
    return `Bearer ********${tail}`;
}

function buildCurl({
    phoneNumberId,
    requestBody,
    redactedToken,
    baseUrl,
}: {
    phoneNumberId: string;
    requestBody: {
        to: string;
        templateName: string;
        language?: string;
        variables?: string[];
    };
    redactedToken: string;
    baseUrl: string;
}): string {
    const endpoint = `${baseUrl}/api/v1/external/waba/${phoneNumberId}/messages`;
    const body = JSON.stringify(requestBody);

    return [
        `curl -X POST "${endpoint}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -H "Authorization: ${redactedToken}" \\`,
        `  -H "x-api-key: ${redactedToken.replace(/^Bearer /, "")}" \\`,
        `  -d '${body.replace(/'/g, "'\\''")}'`,
    ].join("\n");
}

function isSendableTemplate(status?: string | null): boolean {
    if (!status) return false;
    const normalized = status.toUpperCase();
    return !["DRAFT", "REJECTED", "DISABLED"].includes(normalized);
}

// ─────────────────────────────────────────────────────────────
function TemplatePreview({
    template,
    variables,
}: {
    template: MessageTemplate;
    variables: VariableRow[];
}) {
    // Render the template body with variables substituted
    const renderBody = () => {
        const body = template.components?.find((c) => c.type === "BODY")?.text ?? "";
        if (!body) return null;

        return body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
            const idx = parseInt(n, 10) - 1;
            const value = variables[idx]?.value?.trim();
            return value || `{{${n}}}`;
        });
    };

    const header = template.components?.find((c) => c.type === "HEADER");
    const footer = template.components?.find((c) => c.type === "FOOTER");
    const body = renderBody();

    return (
        <div>
            <p className="text-[11.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                Preview
            </p>
            <div className="rounded-xl bg-[#E5DDD5] p-3">
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%]">
                    {header?.text && (
                        <p className="text-[13px] font-semibold text-foreground mb-1.5 leading-tight">
                            {header.text}
                        </p>
                    )}
                    {body && (
                        <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                            {body}
                        </p>
                    )}
                    {footer?.text && (
                        <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                            {footer.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({
    label, helper, icon, children,
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
