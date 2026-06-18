"use client";

import { Link } from "@/i18n/navigation";
import {
    ArrowRight,
    Clock3,
    FileText,
    Globe2,
    MessageCircle,
    ShieldCheck,
    Webhook,
} from "lucide-react";

const STEPS = [
    {
        time: "00:00-00:20",
        title: "Connected WhatsApp account",
        show: "Connected WhatsApp account screen in your app with WABA and phone number",
        narration:
            "This customer business has connected its WhatsApp Business Account to our platform.",
        caption: "whatsapp_business_management: connected WABA",
    },
    {
        time: "00:20-00:40",
        title: "Open Templates",
        show: "Open Templates page in app or WhatsApp Manager",
        narration:
            "We are now managing a WhatsApp business asset: message templates.",
        caption: "Managing WhatsApp asset: templates",
    },
    {
        time: "00:40-01:20",
        title: "Create template",
        show: "Click Create Template; fill name, language, category, body",
        narration:
            "This action creates a message template for the connected business account.",
        caption: "Create template",
    },
    {
        time: "01:20-01:45",
        title: "Template created",
        show: "Submit and show newly created template in list/status",
        narration:
            "The template is now visible on the business account.",
        caption: "Template created on connected WABA",
    },
    {
        time: "01:45-02:20",
        title: "Phone numbers or webhook settings",
        show: "Optional: show Phone Numbers or Webhook settings screen",
        narration:
            "These screens show additional WhatsApp business assets our app manages for the same business account.",
        caption: "Phone number / webhook management",
    },
    {
        time: "02:20-02:45",
        title: "Request log",
        show: "Optional: show request log with endpoint and 200 response",
        narration:
            "Here is the successful management request with credentials redacted.",
        caption: "Request succeeded",
    },
] as const;

export function TemplatesRecordingGuide({ projectId }: { projectId: string }) {
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
                                Template review flow, kept inside the real app
                            </h2>
                            <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-slate-300">
                                Use this page as your capture path for the WhatsApp Business Management permission.
                                The guide stays lightweight so the product still feels like the normal app.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <QuickLink href={`/projects/${projectId}/whatsapp`} label="WhatsApp" icon={<MessageCircle className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/templates`} label="Templates" icon={<FileText className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/sender-ids`} label="Sender IDs" icon={<Globe2 className="w-3.5 h-3.5" />} />
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

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Request log cue
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">
                        If you want a quick proof shot, keep the create-template request visible in your browser devtools or use the success toast and the created template row together.
                    </p>
                    <p className="mt-2 text-[11.5px] font-mono text-slate-600">
                        POST /api/v1/projects/:projectId/waba/templates
                    </p>
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
