"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    MessageCircle, Loader2, AlertCircle, Plus, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { getWabaStatus, getWabaConnectUrl } from "@/features/waba/services/waba-service";
import type { WabaAccount } from "@/features/waba/types";
import { WabaEmptyState } from "./waba-empty-state";
import { WabaAccountCard } from "./waba-account-card";
import { WabaInfoSidebar } from "./waba-info-sidebar";

export function WabaPage() {
    const t = useTranslations("waba");
    const params = useParams();
    const searchParams = useSearchParams();
    const projectId = params?.projectId as string;

    const [accounts, setAccounts] = useState<WabaAccount[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (!projectId) return;
        setError(null);
        try {
            const status = await getWabaStatus(projectId);
            setIsConnected(status.isConnected);
            setAccounts(status.accounts);
        } catch (err) {
            console.error("Failed to load WABA status:", err);
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Initial fetch
    useEffect(() => {
        (async () => {
            await fetchStatus();
        })()
    }, [fetchStatus]);


    // Refetch when tab becomes visible (e.g. user comes back from Meta OAuth)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchStatus();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleVisibility);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleVisibility);
        };
    }, [fetchStatus]);

    // Detect success callback from Meta OAuth (e.g. /whatsapp?connected=true)
    useEffect(() => {
        const connected = searchParams?.get("connected");
        const callbackError = searchParams?.get("error");

        if (connected === "true") {
            toast.success(t("connectSuccess"));
            // Clean the URL so the toast doesn't replay on refresh
            window.history.replaceState({}, "", window.location.pathname);
        } else if (callbackError) {
            toast.error(t("connectError"));
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [searchParams, t]);

    const handleAddAccount = async () => {
        if (connecting) return;
        setConnecting(true);
        try {
            const { connectUrl } = await getWabaConnectUrl(projectId);
            if (!connectUrl) throw new Error("No connect URL returned");
            window.location.href = connectUrl;
        } catch (err) {
            console.error("Failed to get connect URL:", err);
            toast.error(t("empty.connectError"));
            setConnecting(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────
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

    // ── Error ────────────────────────────────────────────────
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
                        {t("retry")}
                    </button>
                </div>
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────
    if (!isConnected || accounts.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    <WabaEmptyState projectId={projectId} />
                    <WabaInfoSidebar />
                </div>
            </div>
        );
    }

    // ── Connected: list accounts ─────────────────────────────
    return (
        <div className="space-y-6">
            <PageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Main column */}
                <div className="space-y-4">
                    {/* Section header with Add button */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                {t("connected.title")}
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                {t("connected.subtitle", { count: accounts.length })}
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
                            {t("connected.addAccount")}
                        </button>
                    </div>

                    {/* Accounts */}
                    {accounts.map((account) => (
                        <WabaAccountCard key={account.id} account={account} />
                    ))}
                </div>

                {/* Sidebar */}
                <WabaInfoSidebar />
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Page header
// ────────────────────────────────────────────────────────────
function PageHeader() {
    const t = useTranslations("waba");
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    {t("pageTitle")}
                </h1>
                <p className="text-[12.5px] text-muted-foreground">
                    {t("pageSubtitle")}
                </p>
            </div>
        </div>
    );
}