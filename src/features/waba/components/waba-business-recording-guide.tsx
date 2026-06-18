"use client";

import { Link } from "@/i18n/navigation";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Copy,
    Database,
    Globe2,
    RefreshCw,
    ShieldCheck,
    Building2,
    Phone,
    BadgeCheck,
    Workflow,
} from "lucide-react";
import { toast } from "sonner";

import type { WabaAppReviewGuide, WabaAccount } from "@/features/waba/types";

interface WabaBusinessRecordingGuideProps {
    projectId: string;
    guide?: WabaAppReviewGuide | null;
    accounts: WabaAccount[];
}

export function WabaBusinessRecordingGuide({
    projectId,
    guide,
    accounts,
}: WabaBusinessRecordingGuideProps) {
    const activeAccount = accounts.find((account) => account.isActive && !account.needsReauth);
    const businessId = guide?.sampleValues.businessId || "123456789012345";
    const businessName = guide?.sampleValues.businessName || "Acme Store Business";
    const wabaId = guide?.sampleValues.wabaId || "4419551288316559";
    const phoneNumberId =
        guide?.sampleValues.phoneNumberId || activeAccount?.phoneNumberId || "999372706599985";

    return (
        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="relative px-5 sm:px-6 py-5 border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
                <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_30%)]" />
                <div className="relative flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-sky-200">
                                <ShieldCheck className="w-3 h-3" />
                                Recording checklist
                            </div>
                            <h2 className="mt-3 text-[18px] font-semibold tracking-tight">
                                Facebook Login for Business flow, kept inside the normal WhatsApp page
                            </h2>
                            <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-slate-300">
                                Use the real connect button, then show the returned business-linked identifiers and the owned WABA lookup on the same screen.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <QuickLink href={`/projects/${projectId}/whatsapp`} label="WhatsApp" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/templates`} label="Templates" icon={<Globe2 className="w-3.5 h-3.5" />} />
                            <QuickLink href={`/projects/${projectId}/messaging/send-message`} label="Send" icon={<Workflow className="w-3.5 h-3.5" />} />
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
                    {[
                        {
                            time: "00:00-00:25",
                            title: "Connect WhatsApp Business",
                            show: "User clicks Connect WhatsApp Business and enters Facebook Login for Business flow",
                            narration:
                                "A business admin grants our app access to the customer’s business assets through Facebook Login for Business.",
                            caption: "business_management: grant flow",
                        },
                        {
                            time: "00:25-00:50",
                            title: "Grant completed",
                            show: "Complete grant and return to app",
                            narration:
                                "The onboarding completes and our app receives the connected business identifiers.",
                            caption: "Grant completed",
                        },
                        {
                            time: "00:50-01:15",
                            title: "Debug/result panel",
                            show: "Show debug/result panel with WABA ID, phone number ID, and redacted code",
                            narration:
                                "These are the returned business-linked identifiers captured from Embedded Signup.",
                            caption: "Returned IDs and token code",
                        },
                        {
                            time: "01:15-01:50",
                            title: "Business-scoped operation",
                            show: "Run owned WABA listing or equivalent business-scoped operation",
                            narration:
                                "We now use business access to retrieve the customer’s WhatsApp business assets.",
                            caption: "Business asset operation",
                        },
                        {
                            time: "01:50-02:15",
                            title: "Successful response",
                            show: "Show successful response with selected business context",
                            narration:
                                "The response confirms access to this customer business’s WhatsApp account.",
                            caption: "Owned/shared WABA retrieved",
                        },
                        {
                            time: "02:15-02:30",
                            title: "Business token flow",
                            show: "Optional: show system-user/business-token success log",
                            narration:
                                "Our backend exchanges the code for business integration access used by the platform.",
                            caption: "Business integration token flow",
                        },
                    ].map((step) => (
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

                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                            <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
                            Business asset connection proof
                        </div>
                        <div className="mt-3 space-y-2">
                            <DebugRow label="Business ID" value={maskId(businessId)} onCopy={() => copyValue(businessId, "Business ID")} />
                            <DebugRow label="Business name" value={businessName} />
                            <DebugRow label="WABA ID" value={wabaId} onCopy={() => copyValue(wabaId, "WABA ID")} />
                            <DebugRow label="Phone Number ID" value={phoneNumberId} onCopy={() => copyValue(phoneNumberId, "Phone Number ID")} />
                            <DebugRow label="Code" value="************" />
                        </div>
                        <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
                            Show this right after Meta returns to your app so the reviewer sees the business portfolio, connected WABA, and phone asset in one place.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                            <RefreshCw className="w-3.5 h-3.5 text-[#7C3AED]" />
                            Sync and backend proof
                        </div>
                        <div className="mt-3 space-y-2">
                            <InfoLine label="Backend proof" value="Embedded Signup completed" />
                            <InfoLine label="Backend proof" value="Business ID received" />
                            <InfoLine label="Backend proof" value="WABA ID received" />
                            <InfoLine label="Backend proof" value="Phone Number ID received" />
                            <InfoLine label="Backend proof" value="Token stored securely / redacted" />
                        </div>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 space-y-1.5">
                            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Selected business context
                            </p>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">
                                {accounts.length > 0
                                    ? `${accounts.length} connected account${accounts.length === 1 ? "" : "s"} available for this business`
                                    : "Waiting for the Meta grant to return business assets to the app"}
                            </p>
                            <p className="text-[11.5px] text-slate-600">
                                Owner business: {businessName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <ProofCard
                        label="Connected Meta Business"
                        value={businessName}
                        icon={<Building2 className="w-3.5 h-3.5" />}
                    />
                    <ProofCard
                        label="Connected WABA"
                        value={activeAccount?.name || "Selected WABA"}
                        icon={<BadgeCheck className="w-3.5 h-3.5" />}
                    />
                    <ProofCard
                        label="Connected phone"
                        value={activeAccount?.displayPhoneNumber || phoneNumberId}
                        icon={<Phone className="w-3.5 h-3.5" />}
                    />
                </div>
            </div>
        </section>
    );
}

function copyValue(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
}

function maskId(value: string): string {
    const clean = value.trim();
    if (!clean) return "—";
    if (clean.length <= 8) return clean;
    return `${clean.slice(0, 4)}…${clean.slice(-4)}`;
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

function InfoLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </p>
            <p className="max-w-[70%] text-right text-[12.5px] text-slate-800 break-words">
                {value}
            </p>
        </div>
    );
}

function DebugRow({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy?: () => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                </p>
                <p className="mt-1 truncate font-mono text-[12.5px] text-slate-900">
                    {value}
                </p>
            </div>
            {onCopy && (
                <button
                    type="button"
                    onClick={onCopy}
                    className="cursor-pointer h-9 px-3 rounded-lg text-[11px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE]/60 transition-colors inline-flex items-center gap-1.5"
                >
                    <Copy className="w-3 h-3" />
                    Copy
                </button>
            )}
        </div>
    );
}

function ProofCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-slate-500">
                {icon}
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]">{label}</p>
            </div>
            <p className="mt-2 text-[13px] font-semibold text-slate-900 break-words">
                {value}
            </p>
        </div>
    );
}
