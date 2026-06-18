"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    BookOpen,
    ClipboardList,
    KeyRound,
    Loader2,
    PlugZap,
    Send,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
    attachWabaSender,
    getWabaAppReviewGuide,
    sendWabaTestMessage,
} from "@/features/waba/services/waba-service";
import type {
    WabaAccount,
    WabaAppReviewGuide,
    WabaAppReviewPermissionGuide,
} from "@/features/waba/types";

interface WabaReviewToolsProps {
    projectId: string;
    accounts: WabaAccount[];
    onRefresh: () => void;
}

export function WabaReviewTools({
    projectId,
    accounts,
    onRefresh,
}: WabaReviewToolsProps) {
    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [wabaId, setWabaId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [recipient, setRecipient] = useState("");
    const [selectedSenderId, setSelectedSenderId] = useState("");
    const [attaching, setAttaching] = useState(false);
    const [sending, setSending] = useState(false);
    const [guide, setGuide] = useState<WabaAppReviewGuide | null>(null);
    const [guideLoading, setGuideLoading] = useState(true);
    const [guideError, setGuideError] = useState<string | null>(null);

    const senderOptions = useMemo(
        () => accounts.filter((account) => account.isActive && !account.needsReauth),
        [accounts]
    );
    const senderPhoneNumberId = selectedSenderId || senderOptions[0]?.phoneNumberId || "";

    useEffect(() => {
        let active = true;

        getWabaAppReviewGuide(projectId)
            .then((data) => {
                if (!active) return;
                setGuide(data);
            })
            .catch((err) => {
                if (!active) return;
                console.error("Failed to load app review guide:", err);
                setGuideError("We could not load the review guide, but the sender tools still work.");
            })
            .finally(() => {
                if (!active) return;
                setGuideLoading(false);
            });

        return () => {
            active = false;
        };
    }, [projectId]);

    useEffect(() => {
        if (senderOptions.length === 0) return;

        const firstSender = senderOptions[0];
        setSelectedSenderId((current) => current || firstSender.phoneNumberId);
    }, [senderOptions]);

    useEffect(() => {
        if (!guide) return;

        setPhoneNumberId((current) => current || guide.sampleValues.phoneNumberId);
        setWabaId((current) => current || guide.sampleValues.wabaId);
        setRecipient((current) => current || guide.sampleValues.recipient);
    }, [guide]);

    const loadReviewDemoValues = () => {
        if (!guide) {
            toast.error("Review guide is still loading");
            return;
        }

        setPhoneNumberId(guide.sampleValues.phoneNumberId);
        setWabaId(guide.sampleValues.wabaId);
        setRecipient(guide.sampleValues.recipient);
        toast.success("Review demo values loaded");
    };

    const handleAttach = async () => {
        if (attaching) return;
        if (!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim()) {
            toast.error("Phone Number ID, WABA ID, and access token are required");
            return;
        }

        setAttaching(true);
        try {
            await attachWabaSender(projectId, {
                phoneNumberId: phoneNumberId.trim(),
                wabaId: wabaId.trim(),
                accessToken: accessToken.trim(),
            });
            toast.success("WhatsApp sender attached");
            setAccessToken("");
            onRefresh();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to attach sender";
            toast.error(message);
        } finally {
            setAttaching(false);
        }
    };

    const handleSendTest = async () => {
        if (sending) return;
        if (!senderPhoneNumberId) {
            toast.error("Attach or connect a sender first");
            return;
        }
        if (!recipient.trim()) {
            toast.error("Recipient phone number is required");
            return;
        }

        setSending(true);
        try {
            await sendWabaTestMessage(projectId, senderPhoneNumberId, {
                to: recipient.trim(),
                templateName: "hello_world",
                language: "en_US",
            });
            toast.success("Test message sent");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to send test message";
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950 text-white overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.35)]">
                <div className="relative px-5 sm:px-6 py-5 sm:py-6 border-b border-white/10 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.3),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_30%)]" />
                    <div className="relative flex flex-col gap-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-emerald-200">
                                    <Sparkles className="w-3 h-3" />
                                    Test Number Setup
                                </div>
                                <h2 className="mt-3 text-[18px] font-semibold tracking-tight">
                                    Connect a test number and send a real WhatsApp message
                                </h2>
                                <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-slate-300">
                                    Use the normal app flow, connect the Meta test number or your test sender, and prove the end-to-end WhatsApp path with a real send action.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <StatusPill
                                    label={`Accounts: ${guide?.readiness.activeAccounts ?? 0}`}
                                    tone="emerald"
                                />
                                <StatusPill
                                    label={`Templates: ${guide?.readiness.totalTemplates ?? 0}`}
                                    tone="indigo"
                                />
                                <StatusPill
                                    label={`Approved: ${guide?.readiness.approvedTemplates ?? 0}`}
                                    tone="amber"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-3">
                            {guideLoading ? (
                                <LoadingCard />
                            ) : guide?.permissions?.length ? (
                                guide.permissions.map((permission) => (
                                    <PermissionCard
                                        key={permission.permission}
                                        permission={permission}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[12.5px] text-slate-300 lg:col-span-3">
                                    {guideError || "Permission guidance will appear here once the review guide loads."}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                                    <ClipboardList className="w-3.5 h-3.5 text-sky-300" />
                                    Simple walkthrough
                                </div>
                                <ol className="mt-3 space-y-2 text-[12.5px] text-slate-200">
                                    {(guide?.demoScript || []).map((step) => (
                                        <li key={step.title} className="rounded-xl border border-white/8 bg-slate-900/60 px-3 py-2">
                                            <p className="font-semibold text-white">{step.title}</p>
                                            <p className="mt-0.5 leading-relaxed text-slate-300">{step.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                                Flow readiness
                                </div>
                                <dl className="mt-3 space-y-3 text-[12.25px]">
                                    <InfoRow label="Webhook" value={guide?.readiness.webhookPath || "/api/v1/waba/webhook"} />
                                    <InfoRow label="Callback" value={guide?.readiness.callbackPath || "/api/v1/waba/connect/callback"} />
                                    <InfoRow
                                        label="Send test"
                                        value={guide?.readiness.canSendTestMessage ? "Yes, a sender is connected" : "Connect or attach a sender first"}
                                    />
                                </dl>
                                <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">
                                    {guide?.sampleValues.accessTokenNote || "Paste a real Meta access token during the demo."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                            <KeyRound className="w-3.5 h-3.5 text-sky-300" />
                            Backend-loaded test identifiers
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                            <InfoRow label="Test WABA ID" value={guide?.sampleValues.wabaId || "4419551288316559"} />
                            <InfoRow label="Test Phone Number ID" value={guide?.sampleValues.phoneNumberId || senderPhoneNumberId || "999372706599985"} />
                        </div>
                        <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">
                            These values are prefilled from the backend guide and the connected sender. You only enter the test access token when you send.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Test Number Sender
                        </h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                            Attach a sender, then send hello_world from Nabda to prove messaging works.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadReviewDemoValues}
                        className="cursor-pointer h-9 px-3.5 rounded-lg text-[12px] font-semibold text-[#0F172A] bg-[#E2E8F0] hover:bg-[#CBD5E1] active:scale-[0.99] transition-all inline-flex items-center gap-2"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Load test values
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Phone Number ID">
                        <input
                            value={phoneNumberId}
                            onChange={(e) => setPhoneNumberId(e.target.value)}
                            placeholder={guide?.sampleValues.phoneNumberId || "999372706599985"}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                        />
                    </Field>

                    <Field label="WABA ID">
                        <input
                            value={wabaId}
                            onChange={(e) => setWabaId(e.target.value)}
                            placeholder={guide?.sampleValues.wabaId || "4419551288316559"}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                        />
                    </Field>

                    <Field label="Meta Access Token">
                        <div className="relative">
                            <KeyRound className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="password"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                placeholder="EAA..."
                                autoComplete="off"
                                className="w-full h-10 ps-9 pe-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            Use the test number access token here. It stays in this browser and is never stored.
                        </p>
                    </Field>
                </div>

                <button
                    type="button"
                    onClick={handleAttach}
                    disabled={attaching}
                    className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 disabled:opacity-60"
                >
                    {attaching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <PlugZap className="w-4 h-4" />
                    )}
                    Attach Sender
                </button>

                <div className="border-t border-border/60 pt-5 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <Field label="Sender">
                            <select
                                value={senderPhoneNumberId}
                                onChange={(e) => setSelectedSenderId(e.target.value)}
                                disabled={senderOptions.length === 0}
                                className="appearance-none w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                            >
                                {senderOptions.length === 0 ? (
                                    <option value="">No sender connected</option>
                                ) : (
                                    senderOptions.map((account) => (
                                        <option
                                            key={account.id}
                                            value={account.phoneNumberId}
                                        >
                                            {account.displayPhoneNumber || account.phoneNumberId}
                                        </option>
                                    ))
                                )}
                            </select>
                        </Field>

                        <Field label="Recipient">
                            <input
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder={guide?.sampleValues.recipient || "201099811370"}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                            />
                        </Field>

                        <button
                            type="button"
                            onClick={handleSendTest}
                            disabled={sending || !senderPhoneNumberId}
                            className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#111827] hover:bg-[#030712] active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Send Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PermissionCard({
    permission,
}: {
    permission: WabaAppReviewPermissionGuide;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
                        {permission.permission}
                    </p>
                    <h3 className="mt-1 text-[14px] font-semibold text-white">
                        {permission.title}
                    </h3>
                </div>
            </div>

            <p className="mt-3 text-[12.25px] leading-relaxed text-slate-300">
                {permission.purpose}
            </p>

            <div className="mt-4 space-y-3 text-[12px] text-slate-200">
                <MiniBlock label="Why we need it" value={permission.whyNeeded} />
                <MiniBlock label="What the reviewer sees" value={permission.reviewerSees} />
                <MiniBlock label="Demo action" value={permission.demoAction} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {permission.backendProof.map((proof) => (
                    <span
                        key={proof}
                        className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1 text-[10.5px] font-medium text-slate-200"
                    >
                        {proof}
                    </span>
                ))}
            </div>
        </div>
    );
}

function LoadingCard() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-3">
            <div className="flex items-center gap-2 text-[12px] text-slate-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading review guide...
            </div>
        </div>
    );
}

function MiniBlock({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 leading-relaxed text-slate-200">{value}</p>
        </div>
    );
}

function StatusPill({
    label,
    tone,
}: {
    label: string;
    tone: "emerald" | "indigo" | "amber";
}) {
    const classes = {
        emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
        indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100",
        amber: "border-amber-400/20 bg-amber-500/10 text-amber-100",
    }[tone];

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${classes}`}>
            {label}
        </span>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
            </dt>
            <dd className="max-w-[70%] text-right font-mono text-[11.5px] text-slate-100">
                {value}
            </dd>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-[12px] font-semibold text-foreground mb-1.5">
                {label}
            </span>
            {children}
        </label>
    );
}
