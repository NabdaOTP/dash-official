"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { X, Loader2, Shield, User, Check } from "lucide-react";
import { toast } from "sonner";
import { updateMemberRole } from "@/features/team/services/team-service";
import type {
    ProjectMember,
    ProjectRole,
} from "@/features/projects/types";

interface ChangeRoleDialogProps {
    member: ProjectMember | null;
    onClose: () => void;
    onChanged: () => void;
}

const ROLES: {
    value: ProjectRole;
    label: string;
    description: string;
    icon: typeof Shield;
}[] = [
        {
            value: "ADMIN",
            label: "Admin",
            description: "Full access — manage settings, team, and billing",
            icon: Shield,
        },
        {
            value: "MEMBER",
            label: "Member",
            description: "Can use the project but cannot manage settings",
            icon: User,
        },
    ];

export function ChangeRoleDialog({
    member,
    onClose,
    onChanged,
}: ChangeRoleDialogProps) {
    const params = useParams();
    const projectId = params.projectId as string;
    const [selectedRole, setSelectedRole] = useState<ProjectRole>("MEMBER");
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     if (member) setSelectedRole(member.role);
    // }, [member]);

    useEffect(() => {
        (async () => {
            if (member) await setSelectedRole(member.role);
        })()
    }, [member]);

    if (!member) return null;

    const hasChanges = selectedRole !== member.role;

    const handleSubmit = async () => {
        if (!hasChanges) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            await updateMemberRole(projectId, member.userId, selectedRole);
            toast.success(`Role updated to ${selectedRole.toLowerCase()}`);
            onChanged();
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to update role"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-background rounded-2xl border border-border w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                            <Shield size={18} className="text-[#7C3AED]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Change Role
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                                {member.user.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground"
                        disabled={loading}
                        aria-label="close button"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    {ROLES.map((role) => {
                        const isSelected = selectedRole === role.value;
                        return (
                            <button
                                key={role.value}
                                onClick={() => setSelectedRole(role.value)}
                                disabled={loading}
                                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all text-start ${isSelected
                                    ? "border-[#7C3AED] bg-[#F5F3FF]"
                                    : "border-border hover:border-border/80 hover:bg-muted/30"
                                    }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#7C3AED]" : "bg-muted"
                                        }`}
                                >
                                    <role.icon
                                        size={16}
                                        className={isSelected ? "text-white" : "text-muted-foreground"}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-[13.5px] font-semibold text-foreground">
                                            {role.label}
                                        </p>
                                        {isSelected && (
                                            <Check size={14} className="text-[#7C3AED] shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                                        {role.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !hasChanges}
                            className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Updating..." : "Update Role"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}