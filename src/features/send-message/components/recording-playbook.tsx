"use client";

import { Link } from "@/i18n/navigation";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    FileText,
    MessagesSquare,
    PhoneCall,
    ShieldCheck,
} from "lucide-react";

const STEPS = [
    {
        time: "00:00-00:15",
        title: "Customer record",
        show: "Customer record in your app with WhatsApp number, opt-in source, and timestamp",
        narration:
            'This customer has explicitly opted in to receive WhatsApp updates from our business.',
        caption: "whatsapp_business_messaging: opted-in customer",
    },
    {
        time: "00:15-00:35",
        title: "Service window or template",
        show: "If using service reply: show inbound message history. If using template: show approved template selector",
        narration:
            "We are now sending a service reply inside the customer service window.",
        caption: "Service window proof or Using approved template",
    },
    {
        time: "00:35-01:00",
        title: "Compose and send",
        show: "Compose and send message in your app",
        narration:
            "This send action uses the connected WhatsApp Business Account.",
        caption: "Send message from app",
    },
    {
        time: "01:00-01:20",
        title: "Request and response",
        show: "Show cURL/network request and success response, token redacted",
        narration: "Here is the successful API request and response.",
        caption: "HTTP request/response shown",
    },
    {
        time: "01:20-01:45",
        title: "WhatsApp client",
        show: "Switch to WhatsApp client and show incoming message",
        narration:
            "The customer receives and can view the same message in WhatsApp.",
        caption: "Message received in WhatsApp client",
    },
    {
        time: "01:45-02:15",
        title: "Webhook logs",
        show: "Show webhook/status logs with timestamps",
        narration:
            "Our webhook receives the delivery event without errors.",
        caption: "Webhook status received",
    },
    {
        time: "02:15-02:35",
        title: "Reply or opt-out",
        show: "Show customer reply or opt-out action in app",
        narration:
            "An inbound reply or opt-out is ingested and stored in the customer record.",
        caption: "Inbound event / opt-out handling",
    },
] as const;

export function RecordingPlaybook({ projectId }: { projectId: string }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="relative px-5 sm:px-6 py-5 border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
                <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_30%)]" />
                <div className="relative flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-emerald-200">
                                <ShieldCheck className="w-3 h-3" />
                                Recording checklist
                            </div>
                            <h2 className="mt-3 text-[18px] font-semibold tracking-tight">
                                Keep the normal app flow, but make every review moment easy to show
                            </h2>
                            <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-slate-300">
                                These are the exact beats to capture while you stay inside the production UI.
                                The helper is here to keep you prepared, not to replace the real flow.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <QuickLink href={`/projects/${projectId}/contacts`} label="Contacts" icon={<PhoneCall className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/templates`} label="Templates" icon={<FileText className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/messaging/send-message`} label="Send message" icon={<MessagesSquare className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/whatsapp`} label="WhatsApp" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
                    <Clock3 className="w-3.5 h-3.5 text-[#7C3AED]" />
                    Recording steps
                </div>

                <div className="grid gap-3">
                    {STEPS.map((step) => (
                        <article
                            key={step.time}
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {step.time}
                                    </p>
                                    <h3 className="mt-1 text-[14px] font-semibold text-slate-900">
                                        {step.title}
                                    </h3>
                                </div>
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-700">
                                    {step.caption}
                                </span>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <InfoBlock label="What to show" value={step.show} />
                                <InfoBlock label="Suggested narration" value={step.narration} />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function QuickLink({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/15 transition-colors"
        >
            {icon}
            {label}
            <ArrowRight className="w-3 h-3" />
        </Link>
    );
}

function InfoBlock({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">
                {value}
            </p>
        </div>
    );
}
