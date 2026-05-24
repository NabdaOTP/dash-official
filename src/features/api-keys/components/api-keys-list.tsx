"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Key, Plus, Loader2, Trash2, ShieldOff, Calendar, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getProjectApiKeys } from "@/features/projects/services/project-service";
import type { ProjectApiKey } from "@/features/projects/types";
import { CreateApiKeyDialog } from "./create-api-key-dialog";
import { RevokeKeyDialog } from "./revoke-key-dialog";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "Never used";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

export function ApiKeysList() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [keys, setKeys] = useState<ProjectApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<ProjectApiKey | null>(null);

    const fetchKeys = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getProjectApiKeys(projectId);
            setKeys(data);
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to load API keys"
            );
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchKeys();
        })()
    }, [fetchKeys]);


    const handleCreated = () => {
        setShowCreate(false);
        fetchKeys();
    };

    const handleRevoked = () => {
        setKeyToRevoke(null);
        fetchKeys();
    };

    const activeKeys = keys.filter((k) => k.isActive);
    const revokedKeys = keys.filter((k) => !k.isActive);

    return (
        <>
            <div className="bg-background rounded-2xl border border-border/60 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Key size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                API Keys
                            </h2>
                            <p className="text-[12px] text-muted-foreground">
                                {loading
                                    ? "Loading..."
                                    : `${activeKeys.length} active ${activeKeys.length === 1 ? "key" : "keys"}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="h-9 px-3.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                        <Plus size={14} />
                        New Key
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                            <Key size={20} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-foreground mb-1">
                            No API keys yet
                        </h3>
                        <p className="text-[12px] text-muted-foreground mb-4 max-w-xs mx-auto">
                            Create an API key to start integrating Nabda with your applications
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer transition-colors"
                        >
                            <Plus size={14} />
                            Create your first key
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Active keys */}
                        {activeKeys.length > 0 && (
                            <div className="divide-y divide-border/60">
                                {activeKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                            <Key size={15} className="text-[#7C3AED]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[13.5px] font-semibold text-foreground truncate">
                                                    {key.name}
                                                </p>
                                                <span className="inline-flex items-center text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">
                                                    ACTIVE
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    Created {formatDate(key.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {formatDateTime(key.lastUsedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setKeyToRevoke(key)}
                                            className="shrink-0 w-9 h-9 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                                            aria-label={`Revoke ${key.name}`}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Revoked keys */}
                        {revokedKeys.length > 0 && (
                            <>
                                <div className="px-5 py-2.5 bg-muted/30 border-t border-border/60">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Revoked Keys ({revokedKeys.length})
                                    </p>
                                </div>
                                <div className="divide-y divide-border/60">
                                    {revokedKeys.map((key) => (
                                        <div
                                            key={key.id}
                                            className="flex items-center gap-3 p-4 sm:p-5 opacity-60"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <ShieldOff size={15} className="text-muted-foreground" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-[13.5px] font-semibold text-foreground truncate line-through">
                                                        {key.name}
                                                    </p>
                                                    <span className="inline-flex items-center text-[10px] font-semibold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full shrink-0">
                                                        REVOKED
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Created {formatDate(key.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Dialogs */}
            <CreateApiKeyDialog
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={handleCreated}
            />
            <RevokeKeyDialog
                apiKey={keyToRevoke}
                onClose={() => setKeyToRevoke(null)}
                onRevoked={handleRevoked}
            />
        </>
    );
}