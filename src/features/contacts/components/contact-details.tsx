"use client";

import { useState } from "react";
import {
    User, Phone, Copy, Check, Hash, Calendar,
    BellOff, CheckCircle2, Plus, Info,
    ShieldCheck, Clock3, MessageSquareText, HandHeart,
} from "lucide-react";
import { toast } from "sonner";

import {
    formatPhone, getInitials, getAvatarColor,
} from "@/features/contacts/lib/contact-helpers";
import type { Contact } from "@/features/contacts/types";

interface ContactDetailsProps {
    contact: Contact | null;
    onAddNew: () => void;
}

export function ContactDetails({ contact, onAddNew }: ContactDetailsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            toast.success("Copied");
            setTimeout(() => setCopiedField(null), 1500);
        } catch {
            toast.error("Failed to copy");
        }
    };

    if (!contact) {
        return (
            <div className="rounded-2xl border border-border/60 bg-white p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                    <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-[16px] font-bold text-foreground mb-1.5">
                    No contact selected
                </h3>
                <p className="text-[13px] text-muted-foreground mb-5 max-w-xs">
                    Select a contact from the list to view details
                </p>
                <button
                    type="button"
                    onClick={onAddNew}
                    className="cursor-pointer h-10 px-5 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                >
                    <Plus className="w-4 h-4" />
                    Add New Contact
                </button>
            </div>
        );
    }

    const initials = getInitials(contact);
    const colors = getAvatarColor(contact.id);
    const attributes = contact.attributes
        ? Object.entries(contact.attributes).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
        )
        : [];
    const consentItems = buildConsentItems(attributes);

    return (
        <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Header with avatar */}
            <div className="px-6 py-6 border-b border-border/40 bg-gradient-to-br from-[#F8F7FF] to-white">
                <div className="flex items-start gap-4 flex-wrap">
                    <div
                        className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center text-[20px] font-bold shrink-0`}
                    >
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[20px] font-bold text-foreground leading-tight">
                            {contact.name?.trim() || "Unnamed contact"}
                        </h2>
                        <p className="text-[13px] text-muted-foreground font-mono mt-1">
                            {formatPhone(contact.phoneNumber)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {contact.isSubscribed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-green-50 text-green-700">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    SUBSCRIBED
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-700">
                                    <BellOff className="w-2.5 h-2.5" />
                                    UNSUBSCRIBED
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons (disabled, no endpoints yet) */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* <button
                            type="button"
                            disabled
                            title="Editing contacts will be available soon"
                            className="cursor-not-allowed w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center opacity-40"
                            aria-label="Edit"
                        >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                            type="button"
                            disabled
                            title="Deleting contacts will be available soon"
                            className="cursor-not-allowed w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center opacity-40"
                            aria-label="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
                {/* Contact ID */}
                <DetailRow
                    label="Contact ID"
                    icon={<Hash className="w-3 h-3" />}
                    value={contact.id}
                    onCopy={() => handleCopy(contact.id, "id")}
                    copied={copiedField === "id"}
                    mono
                />

                {/* Phone */}
                <DetailRow
                    label="Phone Number"
                    icon={<Phone className="w-3 h-3" />}
                    value={formatPhone(contact.phoneNumber)}
                    onCopy={() => handleCopy(contact.phoneNumber, "phone")}
                    copied={copiedField === "phone"}
                    mono
                />

                {/* Created */}
                <DetailRow
                    label="Added on"
                    icon={<Calendar className="w-3 h-3" />}
                    value={formatFullDate(contact.createdAt)}
                />

                {consentItems.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <label className="text-[10.5px] uppercase tracking-wide font-semibold text-emerald-800">
                                Consent and service proof
                            </label>
                        </div>
                        <div className="space-y-2">
                            {consentItems.map((item) => (
                                <ConsentRow
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    icon={item.icon}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Attributes */}
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Info className="w-3 h-3 text-muted-foreground" />
                        <label className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">
                            Attributes
                        </label>
                    </div>
                    {attributes.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-center">
                            <p className="text-[11.5px] text-muted-foreground">
                                No attributes set
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
                            {attributes.map(([key, value], i) => (
                                <div
                                    key={key}
                                    className={`flex items-center gap-3 px-3 py-2 ${i > 0 ? "border-t border-border/30" : ""
                                        }`}
                                >
                                    <span className="text-[11px] font-mono text-muted-foreground min-w-[80px]">
                                        {key}
                                    </span>
                                    <span className="text-[12px] text-foreground flex-1 truncate">
                                        {String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function DetailRow({
    label, icon, value, onCopy, copied, mono,
}: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onCopy?: () => void;
    copied?: boolean;
    mono?: boolean;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-muted-foreground">{icon}</span>
                <label className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">
                    {label}
                </label>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                    <span
                        className={`text-[12.5px] text-foreground truncate block ${mono ? "font-mono" : ""
                            }`}
                    >
                        {value}
                    </span>
                </div>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="cursor-pointer h-9 w-9 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted/40 transition-colors"
                        aria-label={`Copy ${label}`}
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function ConsentRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-emerald-200/70 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="text-emerald-600">{icon}</span>
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-emerald-700">
                    {label}
                </p>
            </div>
            <p className="text-[12px] text-foreground break-words leading-relaxed">
                {value}
            </p>
        </div>
    );
}

function buildConsentItems(
    attributes: Array<[string, string | number | boolean | undefined]>
): Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
}> {
    const map = new Map(
        attributes.map(([key, value]) => [key, String(value ?? "")])
    );
    const items: Array<{
        label: string;
        value: string;
        icon: React.ReactNode;
    }> = [];

    const optInSource = getFirstValue(map, ["whatsappOptInSource", "optInSource", "consentSource"]);
    const optInAt = getFirstValue(map, ["whatsappOptInAt", "optInAt", "consentAt"]);
    const serviceWindowEndsAt = getFirstValue(map, ["serviceWindowEndsAt", "serviceWindowUntil"]);
    const lastInboundAt = getFirstValue(map, ["lastInboundAt", "lastReplyAt", "replyAt"]);
    const optOutAt = getFirstValue(map, ["optOutAt", "unsubscribedAt"]);

    if (optInSource) {
        items.push({
            label: "Opt-in source",
            value: optInSource,
            icon: <HandHeart className="w-3.5 h-3.5" />,
        });
    }
    if (optInAt) {
        items.push({
            label: "Opt-in timestamp",
            value: formatFlexibleDate(optInAt),
            icon: <Clock3 className="w-3.5 h-3.5" />,
        });
    }
    if (serviceWindowEndsAt) {
        items.push({
            label: "Service window ends",
            value: formatFlexibleDate(serviceWindowEndsAt),
            icon: <MessageSquareText className="w-3.5 h-3.5" />,
        });
    }
    if (lastInboundAt) {
        items.push({
            label: "Last inbound reply",
            value: formatFlexibleDate(lastInboundAt),
            icon: <MessageSquareText className="w-3.5 h-3.5" />,
        });
    }
    if (optOutAt) {
        items.push({
            label: "Opt-out timestamp",
            value: formatFlexibleDate(optOutAt),
            icon: <BellOff className="w-3.5 h-3.5" />,
        });
    }

    return items;
}

function getFirstValue(
    map: Map<string, string>,
    keys: string[]
): string | null {
    for (const key of keys) {
        const value = map.get(key)?.trim();
        if (value) return value;
    }
    return null;
}

function formatFlexibleDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFullDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}
