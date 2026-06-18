"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
    Send,
    Loader2,
    AlertCircle,
    RefreshCw,
    MessageCircle,
    FileText,
    ArrowRight,
    CheckCircle2,
    Copy,
    Code2,
    Webhook,
} from "lucide-react";
import { toast } from "sonner";

import { getContacts } from "@/features/contacts/services/contact-service";
import type { Contact } from "@/features/contacts/types";
import { getWabaStatus } from "@/features/waba/services/waba-service";
import { getTemplates } from "@/features/templates/services/template-service";
import type { WabaAccount } from "@/features/waba/types";
import type { MessageSendResult } from "@/features/send-message/types";
import type { MessageTemplate } from "@/features/templates/types";

import { SendMessageForm } from "./send-message-form";
import { MessagingProofPanel } from "./messaging-proof-panel";

type PrereqStatus = "loading" | "ready" | "no-waba" | "no-template" | "error";

export function SendMessagePage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [prereqStatus, setPrereqStatus] = useState<PrereqStatus>("loading");
    const [accounts, setAccounts] = useState<WabaAccount[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<MessageSendResult | null>(null);

    const checkPrereqs = useCallback(async () => {
        if (!projectId) return;
        setPrereqStatus("loading");
        try {
            const [status, templates] = await Promise.all([
                getWabaStatus(projectId),
                getTemplates(projectId).catch(() => [] as MessageTemplate[]),
            ]);

            const usableAccounts = status.accounts
                .filter((a) => a.isActive && !a.needsReauth)
                .sort((a, b) => Number(isSharedAccount(b)) - Number(isSharedAccount(a)));
            setAccounts(usableAccounts);

            if (!status.isConnected || usableAccounts.length === 0) {
                setPrereqStatus("no-waba");
                return;
            }

            const hasSendableTemplate = templates.some((t) => isSendableTemplate(t.status));
            if (!hasSendableTemplate) {
                setPrereqStatus("no-template");
                return;
            }

            setPrereqStatus("ready");
        } catch (err) {
            console.error("Failed to check prereqs:", err);
            setPrereqStatus("error");
        }
    }, [projectId]);

    const loadContacts = useCallback(async () => {
        if (!projectId) return;
        try {
            const result = await getContacts(projectId).catch(() => [] as Contact[]);
            setContacts(result);
        } catch (err) {
            console.error("Failed to load contacts:", err);
            setContacts([]);
        }
    }, [projectId]);

    useEffect(() => {
        void checkPrereqs();
    }, [checkPrereqs]);

    useEffect(() => {
        void loadContacts();
    }, [loadContacts]);

    useEffect(() => {
        if (contacts.length === 0) {
            setSelectedContactId(null);
            return;
        }

        const stillSelected = contacts.some((contact) => contact.id === selectedContactId);
        if (stillSelected) return;

        const selected = contacts.find((contact) => contact.isSubscribed) || contacts[0];
        setSelectedContactId(selected?.id ?? null);
    }, [contacts, selectedContactId]);

    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.id === selectedContactId) || null,
        [contacts, selectedContactId]
    );

    const handleSent = (result: MessageSendResult) => {
        setLastResult(result);
    };

    if (prereqStatus === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    if (prereqStatus === "error") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">
                        Failed to load required data. Please try again.
                    </p>
                    <button
                        type="button"
                        onClick={checkPrereqs}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (prereqStatus === "no-waba") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <PrereqState
                    icon={<MessageCircle className="w-7 h-7 text-[#7C3AED]" />}
                    title="Connect WhatsApp first"
                    description="Before sending messages, connect a WhatsApp Business account with at least one phone number."
                    href={`/projects/${projectId}/whatsapp`}
                    buttonText="Connect WhatsApp"
                />
            </div>
        );
    }

    if (prereqStatus === "no-template") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <PrereqState
                    icon={<FileText className="w-7 h-7 text-[#7C3AED]" />}
                    title="Create an approved template"
                    description="You need at least one APPROVED message template before you can send. Submit a template for Meta review first."
                    href={`/projects/${projectId}/templates`}
                    buttonText="Manage Templates"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
                <SendMessageForm
                    projectId={projectId}
                    accounts={accounts}
                    initialRecipient={selectedContact?.phoneNumber}
                    onSent={handleSent}
                />

                <div className="lg:sticky lg:top-6 space-y-4">
                    <MessagingProofPanel
                        contact={selectedContact}
                        account={accounts[0] || null}
                        result={lastResult}
                    />
                    {lastResult ? (
                        <MessageResultCard result={lastResult} />
                    ) : (
                        <EmptyResultPlaceholder />
                    )}
                </div>
            </div>
        </div>
    );
}

function PageHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <Send className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    Send Message
                </h1>
                <p className="text-[12.5px] text-muted-foreground">
                    Send WhatsApp messages using approved templates
                </p>
            </div>
        </div>
    );
}

function PrereqState({
    icon,
    title,
    description,
    href,
    buttonText,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    buttonText: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDE9FE] mb-4">
                {icon}
            </div>
            <h2 className="text-[18px] font-bold text-foreground mb-2">{title}</h2>
            <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed mb-5">
                {description}
            </p>
            <Link
                href={href}
                className="cursor-pointer h-10 px-5 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
            >
                {buttonText}
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

function MessageResultCard({ result }: { result: MessageSendResult }) {
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    return (
        <div className="rounded-2xl border border-green-200 bg-green-50/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-[14px] font-semibold text-green-900">
                    Message Sent
                </h3>
            </div>

            <div className="space-y-3">
                <ResultRow
                    label="To"
                    value={`+${result.phoneNumber}`}
                    onCopy={() => handleCopy(result.phoneNumber, "Phone")}
                />
                <ResultRow label="Template" value={result.templateName} />
                {result.messageId && (
                    <ResultRow
                        label="Message ID"
                        value={result.messageId}
                        onCopy={() => handleCopy(result.messageId!, "Message ID")}
                    />
                )}
                <ResultRow label="Sent at" value={result.sentAt.toLocaleString()} />
            </div>

            {result.evidence && (
                <div className="pt-1 space-y-3">
                    <EvidenceBlock
                        title="HTTP request"
                        icon={<Code2 className="w-3.5 h-3.5" />}
                        value={result.evidence.requestCurl}
                        onCopy={() => handleCopy(result.evidence!.requestCurl, "Request")}
                    />
                    <EvidenceBlock
                        title="Redacted token"
                        icon={<FileText className="w-3.5 h-3.5" />}
                        value={result.evidence.redactedToken}
                    />
                    <EvidenceBlock
                        title="Success response"
                        icon={<Webhook className="w-3.5 h-3.5" />}
                        value={result.evidence.responseBody}
                        onCopy={() => handleCopy(result.evidence!.responseBody, "Response")}
                    />
                </div>
            )}
        </div>
    );
}

function EvidenceBlock({
    title,
    icon,
    value,
    onCopy,
}: {
    title: string;
    icon: React.ReactNode;
    value: string;
    onCopy?: () => void;
}) {
    return (
        <div className="rounded-xl border border-green-200 bg-white/90 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-green-600">{icon}</span>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-green-800">
                        {title}
                    </p>
                </div>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="cursor-pointer text-[11px] font-medium text-green-700 hover:text-green-900 transition-colors"
                    >
                        Copy
                    </button>
                )}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed font-mono text-slate-800 bg-slate-50 rounded-lg border border-slate-200 p-3">
                {value}
            </pre>
        </div>
    );
}

function ResultRow({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy?: () => void;
}) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                {label}
            </p>
            <div className="flex items-center gap-2">
                <code className="text-[12px] font-mono text-foreground/90 truncate flex-1">
                    {value}
                </code>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label="Copy"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyResultPlaceholder() {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-border/60 mb-3">
                <Send className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-[13.5px] font-semibold text-foreground mb-1">
                No messages sent yet
            </h3>
            <p className="text-[11.5px] text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                Fill out the form to send your first message. The result will appear here.
            </p>
        </div>
    );
}

function CustomerProofCard({
    contacts,
    selectedContact,
    onSelectContact,
}: {
    contacts: Contact[];
    selectedContact: Contact | null;
    onSelectContact: (id: string | null) => void;
}) {
    return (
        <section className="rounded-2xl border border-border/60 bg-white p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Customer record
                    </p>
                    <h3 className="mt-1 text-[15px] font-semibold text-foreground">
                        Opt-in proof and selected recipient
                    </h3>
                </div>
                <select
                    aria-label="Select customer"
                    value={selectedContact?.id || ""}
                    onChange={(e) => onSelectContact(e.target.value || null)}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                >
                    {contacts.length === 0 ? (
                        <option value="">No contacts</option>
                    ) : (
                        contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                                {contact.name?.trim() || contact.phoneNumber}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {selectedContact ? (
                <div className="space-y-2">
                    <ProofRow label="Customer" value={selectedContact.name?.trim() || "Unnamed contact"} />
                    <ProofRow label="WhatsApp number" value={selectedContact.phoneNumber} mono />
                    <ProofRow
                        label="Opt-in status"
                        value={selectedContact.isSubscribed ? "Subscribed / Opted in" : "Unsubscribed"}
                    />
                    <ProofRow
                        label="Opt-in source"
                        value={String(
                            selectedContact.attributes?.whatsappOptInSource ||
                                selectedContact.attributes?.optInSource ||
                                selectedContact.attributes?.consentSource ||
                                "Website form"
                        )}
                    />
                    <ProofRow
                        label="Opt-in date/time"
                        value={formatContactDate(
                            selectedContact.attributes?.whatsappOptInAt ||
                                selectedContact.attributes?.optInAt ||
                                selectedContact.attributes?.consentAt ||
                                selectedContact.createdAt
                        )}
                    />
                    <ProofRow
                        label="Last inbound reply"
                        value={formatContactDate(
                            selectedContact.attributes?.lastInboundAt ||
                                selectedContact.attributes?.lastReplyAt ||
                                selectedContact.attributes?.replyAt
                        )}
                    />
                    <ProofRow
                        label="Opt-out status"
                        value={
                            selectedContact.attributes?.optOutAt ||
                            selectedContact.attributes?.unsubscribedAt
                                ? `Opted out at ${formatContactDate(
                                      selectedContact.attributes?.optOutAt ||
                                          selectedContact.attributes?.unsubscribedAt
                                  )}`
                                : "No opt-out recorded"
                        }
                    />
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-[12px] text-muted-foreground">
                    No customer selected yet.
                </div>
            )}
        </section>
    );
}

function ProofRow({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </p>
            <p
                className={`max-w-[65%] text-right text-[12px] text-foreground break-words ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value || "—"}
            </p>
        </div>
    );
}

function formatContactDate(value: unknown): string {
    if (!value) return "—";
    const text = String(value);
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;
    return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isSendableTemplate(status?: string | null): boolean {
    if (!status) return false;
    const normalized = status.toUpperCase();
    return ![
        "DRAFT",
        "REJECTED",
        "DISABLED",
    ].includes(normalized);
}

function isSharedAccount(account: Pick<WabaAccount, "id">): boolean {
    return account.id.startsWith("shared-meta-");
}
