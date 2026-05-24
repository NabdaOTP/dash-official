"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MailQuestion, Loader2, Mail, Clock } from "lucide-react";
import { getProjectInvitations } from "@/features/team/services/team-service";
import type { ProjectInvitation } from "@/features/projects/types";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusStyle(status: ProjectInvitation["status"]) {
    switch (status) {
        case "PENDING":
            return "bg-amber-50 text-amber-700";
        case "ACCEPTED":
            return "bg-green-50 text-green-600";
        case "EXPIRED":
            return "bg-muted text-muted-foreground";
        case "REVOKED":
            return "bg-red-50 text-red-500";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function isExpired(invitation: ProjectInvitation) {
    return new Date(invitation.expiresAt).getTime() < Date.now();
}

export function InvitationsList() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getProjectInvitations(projectId);
            setInvitations(data);
        } catch {
            // silent fail — not critical
        } finally {
            setLoading(false);
        }
    }, [projectId]);



    useEffect(() => {
        (async () => {
            await fetchInvitations();
        })()
    }, [fetchInvitations]);

    // Only show pending or recent invitations
    const pendingInvitations = invitations.filter(
        (inv) => inv.status === "PENDING" && !isExpired(inv)
    );

    if (loading) {
        return (
            <div className="bg-background rounded-2xl border border-border/60 p-5">
                <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (pendingInvitations.length === 0) return null;

    return (
        <div className="bg-background rounded-2xl border border-border/60 overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-border/60">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <MailQuestion size={18} className="text-amber-600" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Pending Invitations
                    </h2>
                    <p className="text-[12px] text-muted-foreground">
                        {pendingInvitations.length}{" "}
                        {pendingInvitations.length === 1 ? "invitation" : "invitations"}{" "}
                        awaiting acceptance
                    </p>
                </div>
            </div>

            <div className="divide-y divide-border/60">
                {pendingInvitations.map((invitation) => (
                    <div
                        key={invitation.id}
                        className="flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                            <Mail size={15} className="text-amber-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-semibold text-foreground truncate mb-0.5">
                                {invitation.email}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                <span>Sent {formatDate(invitation.createdAt)}</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={11} />
                                    Expires {formatDate(invitation.expiresAt)}
                                </span>
                            </div>
                        </div>

                        <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${getStatusStyle(invitation.status)}`}
                        >
                            {invitation.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}