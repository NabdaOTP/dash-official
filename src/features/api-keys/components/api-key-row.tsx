"use client";

import { Calendar, Clock, Trash2, Key, ShieldOff } from "lucide-react";
import type { ProjectApiKey } from "@/features/projects/types";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatLastUsed(dateStr: string | null) {
    if (!dateStr) return "Never used";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just used";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

interface ApiKeyRowProps {
    apiKey: ProjectApiKey;
    onRevoke: (key: ProjectApiKey) => void;
}

export function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
    const isActive = apiKey.isActive;

    return (
        <div
            className={`flex items-start sm:items-center gap-3 p-4 sm:p-5 transition-colors ${isActive ? "hover:bg-muted/30" : "opacity-60"
                }`}
        >
            {/* Icon */}
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-[#EDE9FE]" : "bg-muted"
                    }`}
            >
                {isActive ? (
                    <Key size={16} className="text-[#7C3AED]" />
                ) : (
                    <ShieldOff size={16} className="text-muted-foreground" />
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p
                        className={`text-[14px] font-semibold text-foreground truncate ${!isActive ? "line-through" : ""
                            }`}
                    >
                        {apiKey.name}
                    </p>
                    <span
                        className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                    >
                        {isActive ? "ACTIVE" : "REVOKED"}
                    </span>
                </div>

                {/* Masked key display */}
                {isActive && (
                    <div className="mb-2">
                        <code className="text-[12px] font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded-md inline-block">
                            sk_live••••••••••••••••••••••••
                        </code>
                    </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Created {formatDate(apiKey.createdAt)}
                    </span>
                    {isActive && (
                        <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatLastUsed(apiKey.lastUsedAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            {isActive && (
                <button
                    onClick={() => onRevoke(apiKey)}
                    className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer transition-colors text-[12px] font-semibold"
                    aria-label={`Revoke ${apiKey.name}`}
                >
                    <Trash2 size={13} />
                    Revoke
                </button>
            )}
        </div>
    );
}