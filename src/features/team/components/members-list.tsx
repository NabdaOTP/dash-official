"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    getProjectMembers,
} from "@/features/team/services/team-service";
import { getProjectById } from "@/features/projects/services/project-service";
import type {
    ProjectMember,
    Project,
} from "@/features/projects/types";
import { useAuth } from "@/features/auth/context/auth-context";
import { MemberRow } from "./member-row";
import { InviteMemberDialog } from "./invite-member-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

interface MembersListProps {
    onMembersChange?: () => void;
}

export function MembersList({ onMembersChange }: MembersListProps) {
    const params = useParams();
    const projectId = params.projectId as string;
    const { user } = useAuth();

    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const [showInvite, setShowInvite] = useState(false);
    const [memberToChangeRole, setMemberToChangeRole] =
        useState<ProjectMember | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
        null
    );

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [membersData, projectData] = await Promise.all([
                getProjectMembers(projectId),
                getProjectById(projectId),
            ]);
            setMembers(membersData);
            setProject(projectData);
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to load members"
            );
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await fetchData();
        })()
    }, [fetchData]);

    // Check if current user is the project owner
    const isOwner = !!user && !!project && project.ownerId === user.id;

    const handleChanged = () => {
        setMemberToChangeRole(null);
        setMemberToRemove(null);
        fetchData();
        onMembersChange?.();
    };

    const handleInvited = () => {
        setShowInvite(false);
        onMembersChange?.();
    };

    return (
        <>
            <div className="bg-background rounded-2xl border border-border/60">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Users size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Team Members
                            </h2>
                            <p className="text-[12px] text-muted-foreground">
                                {loading
                                    ? "Loading..."
                                    : `${members.length} ${members.length === 1 ? "member" : "members"}`}
                            </p>
                        </div>
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => setShowInvite(true)}
                            className="h-9 px-3.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                            <UserPlus size={14} />
                            Invite
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                            <Users size={20} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-foreground mb-1">
                            No team members yet
                        </h3>
                        <p className="text-[12px] text-muted-foreground mb-4 max-w-xs mx-auto">
                            Invite people to collaborate on this project
                        </p>
                        {isOwner && (
                            <button
                                onClick={() => setShowInvite(true)}
                                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer transition-colors"
                            >
                                <UserPlus size={14} />
                                Invite your first member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {members.map((member) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                isOwner={isOwner}
                                onChangeRole={setMemberToChangeRole}
                                onRemove={setMemberToRemove}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <InviteMemberDialog
                open={showInvite}
                onClose={() => setShowInvite(false)}
                onInvited={handleInvited}
            />
            <ChangeRoleDialog
                member={memberToChangeRole}
                onClose={() => setMemberToChangeRole(null)}
                onChanged={handleChanged}
            />
            <RemoveMemberDialog
                member={memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onRemoved={handleChanged}
            />
        </>
    );
}