"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Megaphone, Plus, Loader2, AlertCircle, RefreshCw,
    Send, Calendar, Filter, Clock,
} from "lucide-react";

import { getWabaStatus } from "@/features/waba/services/waba-service";
import { getTemplates } from "@/features/templates/services/template-service";
import type { MessageTemplate } from "@/features/templates/types";
import type { WabaAccount } from "@/features/waba/types";
import type { Campaign } from "@/features/campaigns/types";

import { PrereqsBlocker } from "./prereqs-blocker";
import { EmptyState } from "./empty-state";
import { CreateCampaignDialog } from "./create-campaign-dialog";

type Stage = "loading" | "prereqs-missing" | "ready" | "error";

export function CampaignsPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [stage, setStage] = useState<Stage>("loading");
    const [wabaAccount, setWabaAccount] = useState<WabaAccount | null>(null);
    const [approvedTemplates, setApprovedTemplates] = useState<MessageTemplate[]>([]);
    const [hasContacts] = useState(true); // TODO: replace with actual check when contacts endpoint exists

    // Local state for created campaigns (since there's no list endpoint yet)
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [createOpen, setCreateOpen] = useState(false);

    const checkPrereqs = useCallback(async () => {
        if (!projectId) return;
        setStage("loading");
        try {
            const [status, templates] = await Promise.all([
                getWabaStatus(projectId),
                getTemplates(projectId).catch(() => [] as MessageTemplate[]),
            ]);

            const approved = templates.filter((t) => t.status === "APPROVED");
            setWabaAccount(status.accounts[0] ?? null);
            setApprovedTemplates(approved);

            const hasWaba = status.isConnected && status.accounts.length > 0;
            const hasApprovedTemplate = approved.length > 0;

            if (!hasWaba || !hasApprovedTemplate) {
                setStage("prereqs-missing");
            } else {
                setStage("ready");
            }
        } catch (err) {
            console.error("Failed to check prereqs:", err);
            setStage("error");
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await checkPrereqs();
        })()
    }, [checkPrereqs]);


    const handleCreated = (campaign: Campaign) => {
        setCampaigns((prev) => [campaign, ...prev]);
    };

    // ── Loading ──────────────────────────────────────────────
    if (stage === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (stage === "error") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">
                        Failed to load. Please try again.
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

    // ── Prereqs missing ──────────────────────────────────────
    if (stage === "prereqs-missing") {
        const hasWaba = !!wabaAccount;
        const hasApprovedTemplate = approvedTemplates.length > 0;
        return (
            <div className="space-y-6">
                <PageHeader />
                <PrereqsBlocker
                    projectId={projectId}
                    hasWaba={hasWaba}
                    hasApprovedTemplate={hasApprovedTemplate}
                    hasContacts={hasContacts}
                />
            </div>
        );
    }

    // ── Ready ────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <PageHeader
                action={
                    campaigns.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    )
                }
            />

            {campaigns.length === 0 ? (
                <EmptyState onCreate={() => setCreateOpen(true)} />
            ) : (
                <div className="space-y-3">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            )}

            {/* Note about list limitation */}
            {campaigns.length > 0 && (
                <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-blue-900 leading-relaxed">
                        <span className="font-semibold">Heads up:</span> Campaigns above are from your current session only. A list view showing all campaigns will be available soon.
                    </p>
                </div>
            )}

            {wabaAccount && (
                <CreateCampaignDialog
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    projectId={projectId}
                    wabaAccountId={wabaAccount.wabaAccountId}
                    approvedTemplates={approvedTemplates}
                    onCreated={handleCreated}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function PageHeader({ action }: { action?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                        Campaigns
                    </h1>
                    <p className="text-[12.5px] text-muted-foreground">
                        Create and manage your WhatsApp broadcasts
                    </p>
                </div>
            </div>
            {action}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function CampaignCard({ campaign }: { campaign: Campaign }) {
    const statusStyle = getStatusStyle(campaign.status);
    const filterCount = campaign.audienceFilter
        ? Object.keys(campaign.audienceFilter).length
        : 0;

    const isScheduled = campaign.scheduledAt && campaign.status === "SCHEDULED";
    const dateLabel = isScheduled
        ? `Scheduled for ${formatDate(campaign.scheduledAt!)}`
        : `Created ${formatDate(campaign.createdAt)}`;

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[15px] font-semibold text-foreground truncate">
                            {campaign.name}
                        </h3>
                        <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {campaign.status}
                        </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateLabel}
                        </span>
                        <span className="text-border">•</span>
                        <span className="font-mono">{campaign.templateName}</span>
                        {filterCount > 0 && (
                            <>
                                <span className="text-border">•</span>
                                <span className="inline-flex items-center gap-1">
                                    <Filter className="w-3 h-3" />
                                    {filterCount} {filterCount === 1 ? "filter" : "filters"}
                                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {isScheduled ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Scheduled
                        </span>
                    ) : campaign.status === "RUNNING" ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] text-[#7C3AED] font-medium">
                            <Send className="w-3 h-3 animate-pulse" />
                            Sending
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Stats if available */}
            {(campaign.recipientCount !== undefined || campaign.sentCount !== undefined) && (
                <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat label="Recipients" value={campaign.recipientCount ?? 0} />
                    <Stat label="Sent" value={campaign.sentCount ?? 0} />
                    <Stat
                        label="Delivered"
                        value={campaign.deliveredCount ?? 0}
                        color="text-green-700"
                    />
                    <Stat
                        label="Failed"
                        value={campaign.failedCount ?? 0}
                        color="text-red-700"
                    />
                </div>
            )}
        </div>
    );
}

function Stat({
    label, value, color,
}: {
    label: string;
    value: number;
    color?: string;
}) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
                {label}
            </p>
            <p className={`text-[15px] font-bold leading-none ${color ?? "text-foreground"}`}>
                {value.toLocaleString()}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function getStatusStyle(status: string) {
    switch (status) {
        case "RUNNING":
            return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
        case "COMPLETED":
            return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" };
        case "SCHEDULED":
            return { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]", dot: "bg-[#7C3AED]" };
        case "FAILED":
        case "CANCELLED":
            return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
        case "DRAFT":
        default:
            return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
    }
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}