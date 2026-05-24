"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Loader2, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { getSessions, revokeSession, revokeAllSessions } from "@/features/auth/services/auth-service";
import type { Session } from "@/features/auth/types";

const formatSessionDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

export function ActiveSessionsSection() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);

    const fetchSessions = useCallback(async () => {
        setSessionsLoading(true);
        try {
            const data = await getSessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            const errMsg = (err as { message?: string })?.message ?? "";
            if (errMsg.includes("503") || errMsg.toLowerCase().includes("email")) {
                toast.error("Email service is currently unavailable. Please try again later.");
            } else {
                toast.error(errMsg || "Failed to send code");
            }
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            await fetchSessions();;
        })()
    }, [fetchSessions]);

    const handleRevokeSession = async (jti: string) => {
        setRevokingId(jti);
        try {
            await revokeSession(jti);
            toast.success("Session revoked");
            await fetchSessions();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed to revoke session");
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAll = async () => {
        setRevokingAll(true);
        try {
            await revokeAllSessions();
            toast.success("All other sessions revoked");
            await fetchSessions();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed to revoke sessions");
        } finally {
            setRevokingAll(false);
        }
    };

    return (
        <div className="bg-background border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Monitor size={18} className="text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-foreground">Active Sessions</h2>
                    <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
                </div>
                {sessions.length > 1 && (
                    <button
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                        className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer flex items-center gap-1"
                    >
                        {revokingAll && <Loader2 size={12} className="animate-spin" />}
                        Revoke all others
                    </button>
                )}
            </div>

            {sessionsLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p>
            ) : (
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left font-medium text-muted-foreground px-5 py-2 text-xs">Device & Location</th>
                                <th className="text-left font-medium text-muted-foreground px-3 py-2 text-xs hidden sm:table-cell">IP Address</th>
                                <th className="text-left font-medium text-muted-foreground px-3 py-2 text-xs">Last Used</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs">Status</th>
                                <th className="text-center font-medium text-muted-foreground px-5 py-2 text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, index) => {
                                // TODO: Properly detect current session by matching jti from JWT
                                // For now, assume first session in the list is the current one
                                const isCurrent = index === 0;
                                return (
                                    <tr key={session.jti} className={`border-b border-border/50 ${isCurrent ? "bg-purple-50/30" : ""}`}>
                                        <td className="px-5 py-3">
                                            <p className="text-[13px] font-medium text-foreground max-w-[180px]">
                                                {session.userAgent ?? "Unknown device"}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 hidden sm:table-cell">
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {session.ipAddress ?? "—"}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-xs text-muted-foreground">
                                                {formatSessionDate(session.lastUsedAt ?? session.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {isCurrent ? (
                                                <span className="inline-flex text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">CURRENT</span>
                                            ) : (
                                                <span className="inline-flex text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">ACTIVE</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {isCurrent ? (
                                                <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-md text-muted-foreground/70 bg-red-50">
                                                    <Lock size={14} />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRevokeSession(session.jti)}
                                                    disabled={revokingId === session.jti}
                                                    className="w-8 h-8 mx-auto flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                                >
                                                    {revokingId === session.jti ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
