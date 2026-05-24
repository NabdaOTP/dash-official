"use client";

import { useState } from "react";
import { MoreVertical, Shield, User, Trash2 } from "lucide-react";
import type { ProjectMember } from "@/features/projects/types";
import { useAuth } from "@/features/auth/context/auth-context";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface MemberRowProps {
    member: ProjectMember;
    isOwner: boolean;
    onChangeRole: (member: ProjectMember) => void;
    onRemove: (member: ProjectMember) => void;
}

export function MemberRow({
    member,
    isOwner,
    onChangeRole,
    onRemove,
}: MemberRowProps) {
    const { user: currentUser } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const isCurrentUser = currentUser?.id === member.userId;
    const canManage = isOwner && !isCurrentUser; // owner can't manage themselves

    return (
        <div className="flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0 overflow-hidden">
                {member.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={member.user.avatarUrl}
                        alt={member.user.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-[12px] font-bold text-[#7C3AED]">
                        {getInitials(member.user.name)}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-[13.5px] font-semibold text-foreground truncate">
                        {member.user.name}
                    </p>
                    {isCurrentUser && (
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                            YOU
                        </span>
                    )}
                </div>
                <p className="text-[12px] text-muted-foreground truncate">
                    {member.user.email}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                    Joined {formatDate(member.joinedAt)}
                </p>
            </div>

            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {member.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EDE9FE] text-[#7C3AED] px-2 py-1 rounded-full">
                        <Shield size={11} />
                        Admin
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        <User size={11} />
                        Member
                    </span>
                )}
            </div>

            {/* Actions menu */}
            {canManage && (
                <div className="relative shrink-0">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-muted-foreground"
                        aria-label="Member actions"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute end-0 top-10 z-20 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onChangeRole(member);
                                    }}
                                    className="w-full text-start px-3 py-2.5 hover:bg-muted text-[13px] text-foreground flex items-center gap-2 cursor-pointer"
                                >
                                    <Shield size={13} className="text-muted-foreground" />
                                    Change role
                                </button>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onRemove(member);
                                    }}
                                    className="w-full text-start px-3 py-2.5 hover:bg-red-50 text-[13px] text-red-600 flex items-center gap-2 cursor-pointer border-t border-border"
                                >
                                    <Trash2 size={13} />
                                    Remove member
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}