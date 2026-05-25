"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    MessageCircle, Loader2, AlertCircle, Plus, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { getWabaStatus, getWabaConnectUrl } from "@/features/waba/services/waba-service";
import { openOAuthPopup } from "@/features/waba/lib/oauth-popup";
import type { WabaAccount } from "@/features/waba/types";

import { WabaEmptyState } from "./waba-empty-state";
import { WabaAccountCard } from "./waba-account-card";
import { WabaInfoSidebar } from "./waba-info-sidebar";

export function WabaPage() {
    const params = useParams();
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
            setError("Failed to load WhatsApp status. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchStatus();
        })()
    }, [fetchStatus]);

    // Refetch when tab gains focus (in case state changed elsewhere)
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

    // Add account via popup
    const handleAddAccount = async () => {
        if (connecting) return;
        setConnecting(true);
        try {
            const { connectUrl } = await getWabaConnectUrl(projectId);
            if (!connectUrl) throw new Error("No connect URL returned");

            const result = await openOAuthPopup(connectUrl, "Connect WhatsApp");

            if (result.completed) {
                toast.success("WhatsApp connection in progress…");
                // Refetch a few times to catch the new account
                // (backend might take a moment to process)
                await fetchStatus();
                window.setTimeout(fetchStatus, 1500);
                window.setTimeout(fetchStatus, 3500);
            } else if (result.error) {
                toast.error(result.error);
            }
            // If cancelled, stay silent
        } catch (err) {
            console.error("Failed to add account:", err);
            toast.error("Couldn't start the connection. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    // Loading 
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

    // Error
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

    // Empty state 
    if (!isConnected || accounts.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    <WabaEmptyState
                        projectId={projectId}
                        onConnected={fetchStatus}
                    />
                    <WabaInfoSidebar />
                </div>
            </div>
        );
    }

    // Connected 
    return (
        <div className="space-y-6">
            <PageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Connected Accounts
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                {accounts.length}{" "}
                                {accounts.length === 1 ? "account" : "accounts"} connected
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
        </div>
    );
}

function PageHeader() {
    return (
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
    );
}