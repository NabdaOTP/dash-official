"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BellOff,
    Clock3,
    MessageSquareText,
    Phone,
    ShieldCheck,
    ThumbsUp,
} from "lucide-react";

import type { Contact } from "@/features/contacts/types";
import type { MessageSendResult } from "@/features/send-message/types";
import type { WabaAccount } from "@/features/waba/types";

type ProofEventType = "sent" | "delivered" | "read" | "reply" | "opt-out";

interface ProofEvent {
    id: string;
    type: ProofEventType;
    title: string;
    detail: string;
    at: string;
}

interface MessagingProofPanelProps {
    contact: Contact | null;
    account: WabaAccount | null;
    result: MessageSendResult | null;
}

export function MessagingProofPanel({
    contact,
    account,
    result,
}: MessagingProofPanelProps) {
    const [events, setEvents] = useState<ProofEvent[]>([]);

    useEffect(() => {
        if (!result) {
            setEvents([]);
            return;
        }

        setEvents([
            {
                id: `sent-${result.sentAt.getTime()}`,
                type: "sent",
                title: "Message sent from app",
                detail: `${result.templateName} dispatched to ${result.phoneNumber}`,
                at: result.sentAt.toLocaleString(),
            },
        ]);
    }, [result]);

    const lastState = useMemo(() => {
        if (events.some((event) => event.type === "opt-out")) return "Opted out";
        if (events.some((event) => event.type === "reply")) return "Inbound reply received";
        if (events.some((event) => event.type === "read")) return "Read";
        if (events.some((event) => event.type === "delivered")) return "Delivered";
        if (events.some((event) => event.type === "sent")) return "Sent";
        return "Waiting";
    }, [events]);

    const appendEvent = (type: ProofEventType, title: string, detail: string) => {
        const now = new Date();
        setEvents((prev) => [
            ...prev,
            {
                id: `${type}-${now.getTime()}`,
                type,
                title,
                detail,
                at: now.toLocaleString(),
            },
        ]);
    };

    const optInSource =
        contact?.attributes?.whatsappOptInSource ||
        contact?.attributes?.optInSource ||
        contact?.attributes?.consentSource ||
        "Website form";
    const optInAt =
        contact?.attributes?.whatsappOptInAt ||
        contact?.attributes?.optInAt ||
        contact?.attributes?.consentAt ||
        contact?.createdAt ||
        null;
    const serviceWindowEndsAt =
        contact?.attributes?.serviceWindowEndsAt ||
        contact?.attributes?.serviceWindowUntil ||
        null;
    const lastInboundAt =
        contact?.attributes?.lastInboundAt ||
        contact?.attributes?.lastReplyAt ||
        contact?.attributes?.replyAt ||
        null;
    const optOutAt =
        contact?.attributes?.optOutAt ||
        contact?.attributes?.unsubscribedAt ||
        null;

    return (
        <section className="rounded-2xl border border-border/60 bg-white p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Messaging proof
                    </p>
                    <h3 className="mt-1 text-[15px] font-semibold text-foreground">
                        Optional review steps
                    </h3>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
                    {lastState}
                </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <CompactInfo label="Customer" value={contact?.name?.trim() || "Test customer"} icon={<Phone className="w-3.5 h-3.5" />} />
                <CompactInfo label="Business" value={account?.name || "Connected WABA"} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                <CompactInfo label="Opt-in source" value={String(optInSource)} icon={<ThumbsUp className="w-3.5 h-3.5" />} />
                <CompactInfo label="Opt-in time" value={formatDate(optInAt)} icon={<Clock3 className="w-3.5 h-3.5" />} />
                <CompactInfo label="Service window" value={formatDate(serviceWindowEndsAt) || "Not shown"} icon={<MessageSquareText className="w-3.5 h-3.5" />} />
                <CompactInfo label="Opt-out" value={formatDate(optOutAt) || "Not opted out"} icon={<BellOff className="w-3.5 h-3.5" />} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Conversation timeline
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <ActionButton onClick={() => appendEvent("delivered", "Delivery webhook", "Status updated to delivered")} label="Delivered" />
                        <ActionButton onClick={() => appendEvent("read", "Read webhook", "Status updated to read")} label="Read" />
                        <ActionButton onClick={() => appendEvent("reply", "Inbound reply", "Customer replied: Thanks")} label="Reply" />
                        <ActionButton onClick={() => appendEvent("opt-out", "Customer opt-out", "Customer sent STOP and was marked unsubscribed")} label="STOP" danger />
                    </div>
                </div>

                <div className="mt-3 space-y-2">
                    {events.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-[12px] text-slate-600">
                            Send a message to populate the timeline, then click the optional buttons to show delivery, reply, or opt-out proof.
                        </div>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[12.5px] font-semibold text-slate-900">
                                            {event.title}
                                        </p>
                                        <p className="mt-0.5 text-[11.5px] text-slate-600 leading-relaxed">
                                            {event.detail}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700">
                                        {event.at}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Backend evidence
                </p>
                <div className="mt-2 space-y-2 text-[12px] text-slate-700">
                    <Line label="Message ID" value={result?.messageId || "Pending send"} />
                    <Line label="Recipient" value={result ? `+${result.phoneNumber}` : "Waiting"} />
                    <Line label="Webhook path" value="/api/v1/waba/webhook" />
                    <Line label="Service window" value={serviceWindowEndsAt ? `Ends ${formatDate(serviceWindowEndsAt)}` : "Shown in customer record"} />
                </div>
            </div>
        </section>
    );
}

function ActionButton({
    onClick,
    label,
    danger,
}: {
    onClick: () => void;
    label: string;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                danger
                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
        >
            {label}
        </button>
    );
}

function CompactInfo({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="text-slate-500">{icon}</span>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                </p>
            </div>
            <p className="text-[12px] text-slate-900 leading-relaxed break-words">
                {value}
            </p>
        </div>
    );
}

function Line({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </p>
            <p className="max-w-[70%] text-right text-[12px] text-slate-800 break-words">
                {value}
            </p>
        </div>
    );
}

function formatDate(value: string | number | boolean | null | undefined): string {
    if (!value) return "";
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
