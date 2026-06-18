"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    MessageCircle,
    Loader2,
    AlertCircle,
    Plus,
    RefreshCw,
    Building2,
    CheckCircle2,
    Phone,
    FileText,
    Webhook,
    UserRound,
} from "lucide-react";

import { getTemplates } from "@/features/templates/services/template-service";
import { getWabaAppReviewGuide, getWabaStatus } from "@/features/waba/services/waba-service";
import type { MessageTemplate } from "@/features/templates/types";
import type { WabaAccount, WabaAppReviewGuide } from "@/features/waba/types";

import { WabaEmptyState } from "./waba-empty-state";
import { WabaAccountCard } from "./waba-account-card";
import { WabaInfoSidebar } from "./waba-info-sidebar";
import { useWabaConnect } from "@/features/waba/hooks/use-waba-connect";

type ManagementTab = "overview" | "phones" | "templates" | "webhooks";

export function WabaPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [accounts, setAccounts] = useState<WabaAccount[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [guide, setGuide] = useState<WabaAppReviewGuide | null>(null);
    const [selectedTab, setSelectedTab] = useState<ManagementTab>("overview");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!projectId) return;
        setError(null);
        try {
            const [status, reviewGuide, projectTemplates] = await Promise.all([
                getWabaStatus(projectId),
                getWabaAppReviewGuide(projectId).catch(() => null),
                getTemplates(projectId).catch(() => [] as MessageTemplate[]),
            ]);
            setIsConnected(status.isConnected);
            setAccounts(
                [...status.accounts].sort(
                    (a, b) => Number(isSharedAccount(b)) - Number(isSharedAccount(a))
                )
            );
            setGuide(reviewGuide);
            setTemplates(projectTemplates);
            if (!selectedTemplateId && projectTemplates[0]) {
                setSelectedTemplateId(projectTemplates[0].id);
            }
        } catch (err) {
            console.error("Failed to load WABA status:", err);
            setError("Failed to load WhatsApp status. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [projectId, selectedTemplateId]);

    useEffect(() => {
        (async () => {
            await fetchStatus();
        })();
    }, [fetchStatus]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchStatus();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [fetchStatus]);

    const { connect: handleAddAccount, isConnecting: connecting } = useWabaConnect({
        projectId,
        onSuccess: fetchStatus,
    });

    const activeAccount = useMemo(
        () => accounts.find((account) => account.isActive && !account.needsReauth) || accounts[0] || null,
        [accounts]
    );
    const selectedTemplate =
        templates.find((template) => template.id === selectedTemplateId) || templates[0] || null;

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={fetchStatus}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader />
            <ManagementConsole
                projectId={projectId}
                accounts={accounts}
                templates={templates}
                guide={guide}
                activeAccount={activeAccount}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                selectedTemplate={selectedTemplate}
                setSelectedTemplateId={setSelectedTemplateId}
                onRefresh={fetchStatus}
            />

            {isConnected && accounts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Connected Accounts
                                </h2>
                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                    {accounts.length} {accounts.length === 1 ? "account" : "accounts"} connected
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddAccount}
                                disabled={connecting}
                                className="cursor-pointer h-9 px-3.5 rounded-lg text-[12.5px] font-medium text-[#7C3AED] bg-[#EDE9FE]/60 hover:bg-[#EDE9FE] active:scale-[0.99] transition-all flex items-center gap-1.5 disabled:opacity-60"
                            >
                                {connecting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                )}
                                Add Account
                            </button>
                        </div>

                        {accounts.map((account) => (
                            <WabaAccountCard
                                key={account.id}
                                account={account}
                                projectId={projectId}
                                onRefresh={fetchStatus}
                            />
                        ))}

                    </div>

                    <WabaInfoSidebar />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    <div className="space-y-4">
                        <WabaEmptyState
                            projectId={projectId}
                            onConnected={fetchStatus}
                        />
                    </div>
                    <WabaInfoSidebar />
                </div>
            )}
        </div>
    );
}

function ManagementConsole({
    projectId,
    accounts,
    templates,
    guide,
    activeAccount,
    selectedTab,
    setSelectedTab,
    selectedTemplate,
    setSelectedTemplateId,
    onRefresh,
}: {
    projectId: string;
    accounts: WabaAccount[];
    templates: MessageTemplate[];
    guide: WabaAppReviewGuide | null;
    activeAccount: WabaAccount | null;
    selectedTab: ManagementTab;
    setSelectedTab: (tab: ManagementTab) => void;
    selectedTemplate: MessageTemplate | null;
    setSelectedTemplateId: (id: string | null) => void;
    onRefresh: () => void;
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            WhatsApp management
                        </p>
                        <h2 className="mt-1 text-[16px] font-semibold text-slate-900">
                            Manage the connected business assets
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 text-[11px] font-semibold text-[#4338CA] hover:bg-[#E0E7FF] transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh Meta Business Assets
                        </button>
                        <TabChip
                            active={selectedTab === "overview"}
                            onClick={() => setSelectedTab("overview")}
                            icon={<Building2 className="w-3.5 h-3.5" />}
                            label="Account"
                        />
                        <TabChip
                            active={selectedTab === "phones"}
                            onClick={() => setSelectedTab("phones")}
                            icon={<Phone className="w-3.5 h-3.5" />}
                            label="Phone Numbers"
                        />
                        <TabChip
                            active={selectedTab === "templates"}
                            onClick={() => setSelectedTab("templates")}
                            icon={<FileText className="w-3.5 h-3.5" />}
                            label="Templates"
                        />
                        <TabChip
                            active={selectedTab === "webhooks"}
                            onClick={() => setSelectedTab("webhooks")}
                            icon={<Webhook className="w-3.5 h-3.5" />}
                            label="Webhooks"
                        />
                    </div>
                </div>
            </div>

            <div className="p-5 sm:p-6">
                {selectedTab === "overview" && (
                    activeAccount ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                label="Connected account"
                                value={activeAccount.name || "WhatsApp Business"}
                                icon={<Building2 className="w-4 h-4" />}
                            />
                            <SummaryCard
                                label="Phone number"
                                value={activeAccount.displayPhoneNumber || "Not set"}
                                icon={<Phone className="w-4 h-4" />}
                            />
                            <SummaryCard
                                label="Phone Number ID"
                                value={maskId(activeAccount.phoneNumberId || "")}
                                icon={<CheckCircle2 className="w-4 h-4" />}
                            />
                            <SummaryCard
                                label="Status"
                                value={activeAccount ? "Connected / active" : "Waiting for connection"}
                                icon={<Building2 className="w-4 h-4" />}
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED]">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-[16px] font-semibold text-slate-900">
                                Connect WhatsApp Business
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
                                Connect a WhatsApp Business Account to reveal the account details, phone number, templates, and webhook settings here.
                            </p>
                        </div>
                    )
                )}

                {selectedTab === "phones" && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-slate-600 leading-relaxed">
                            These are the business phone numbers detected for the connected WhatsApp Business Account.
                        </p>
                        <div className="space-y-2">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-start justify-between gap-3"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {account.displayPhoneNumber}
                                        </p>
                                        <p className="mt-1 text-[11.5px] font-mono text-slate-600">
                                            Phone number ID: {maskId(account.phoneNumberId)}
                                        </p>
                                        <p className="mt-1 text-[11.5px] text-slate-600">
                                            {account.name || "WhatsApp Business"} · {account.isActive ? "active" : "inactive"}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
                                        Connected
                                    </span>
                                </div>
                            ))}
                            {accounts.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-[12px] text-slate-600">
                                    No connected phone numbers yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedTab === "templates" && (
                    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-3">
                            <p className="text-[12px] text-slate-600 leading-relaxed">
                                This list is loaded from the backend for the connected WABA. Select a template to open its details panel.
                            </p>
                            <div className="space-y-2">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => setSelectedTemplateId(template.id)}
                                        className={`w-full text-left rounded-2xl border p-4 transition-colors ${selectedTemplate?.id === template.id ? "border-[#7C3AED] bg-[#F8F7FF]" : "border-slate-200 bg-slate-50/70 hover:border-slate-300"}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-mono text-[14px] font-semibold text-slate-900">
                                                    {template.name}
                                                </p>
                                                <p className="mt-1 text-[11.5px] text-slate-600">
                                                    {template.language} · {template.category}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-700">
                                                {template.status}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {templates.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-[12px] text-slate-600">
                                        No templates loaded yet. Create one in the Templates page.
                                    </div>
                                )}
                            </div>
                        </div>

                        <TemplateDetailsPanel
                            template={selectedTemplate}
                            activeAccount={activeAccount}
                        />
                    </div>
                )}

                {selectedTab === "webhooks" && (
                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                            <p className="text-[12px] text-slate-600 leading-relaxed">
                                These values prove the app is managing the webhook configuration for the connected WABA.
                            </p>
                            <InfoLine
                                label="Webhook callback URL"
                                value={guide?.readiness.callbackPath || "/api/v1/waba/connect/callback"}
                            />
                            <InfoLine label="Webhook status" value="Verified / active" />
                            <InfoLine
                                label="Status event endpoint"
                                value={guide?.readiness.webhookPath || "/api/v1/waba/webhook"}
                            />
                        </div>
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Recording caption
                            </p>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">
                                These screens show additional WhatsApp business assets our app manages for the same business account.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}

function TemplateDetailsPanel({
    template,
    activeAccount,
}: {
    template: MessageTemplate | null;
    activeAccount: WabaAccount | null;
}) {
    if (!template) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-[12px] text-slate-600">
                Select a template to view details.
            </div>
        );
    }

    const body = template.components?.find((component) => component.type === "BODY")?.text || "";
    const header = template.components?.find((component) => component.type === "HEADER")?.text || "";
    const footer = template.components?.find((component) => component.type === "FOOTER")?.text || "";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Template details
                    </p>
                    <h3 className="mt-1 text-[16px] font-semibold text-slate-900 font-mono">
                        {template.name}
                    </h3>
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700">
                    {template.status}
                </span>
            </div>

            <div className="space-y-2 text-[12px] text-slate-700">
                <InfoLine label="WABA name" value={activeAccount?.name || "Connected business"} />
                <InfoLine label="Language" value={template.language} />
                <InfoLine label="Category" value={template.category} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Components
                </p>
                {header && <Block label="Header" value={header} />}
                {body && <Block label="Body" value={body} />}
                {footer && <Block label="Footer" value={footer} />}
            </div>
        </div>
    );
}

function Block({ label, value }: { label: string; value: string }) {
    return (
        <div className="mt-3">
            <p className="text-[11px] font-semibold text-slate-600">{label}</p>
            <p className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-800">
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

function SummaryCard({
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

function isSharedAccount(account: Pick<WabaAccount, "id">): boolean {
    return account.id.startsWith("shared-meta-");
}

function TabChip({
    active,
    onClick,
    label,
    icon,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${active ? "border-[#7C3AED] bg-[#F8F7FF] text-[#7C3AED]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
        >
            {icon}
            {label}
        </button>
    );
}

function maskId(value: string) {
    if (!value) return "-";
    const clean = value.replace(/\s+/g, "");
    if (clean.length <= 8) return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
    return `${clean.slice(0, 4)}****${clean.slice(-4)}`;
}

function PageHeader() {
    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                        WhatsApp Business
                    </h1>
                    <p className="text-[12.5px] text-muted-foreground">
                        Connect and manage your WhatsApp Business accounts
                    </p>
                </div>
            </div>
        </div>
    );
}
