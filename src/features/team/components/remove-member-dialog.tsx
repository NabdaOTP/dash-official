"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "@/features/team/services/team-service";
import type { ProjectMember } from "@/features/projects/types";

interface RemoveMemberDialogProps {
    member: ProjectMember | null;
    onClose: () => void;
    onRemoved: () => void;
}

export function RemoveMemberDialog({
    member,
    onClose,
    onRemoved,
}: RemoveMemberDialogProps) {
    const params = useParams();
    const projectId = params.projectId as string;
    const [loading, setLoading] = useState(false);

    if (!member) return null;

    const handleRemove = async () => {
        setLoading(true);
        try {
            await removeMember(projectId, member.userId);
            toast.success(`${member.user.name} removed from project`);
            onRemoved();
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to remove member"
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
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Remove Member
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                This action cannot be undone
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

                <div className="p-5 space-y-4">
                    <p className="text-[13.5px] text-foreground leading-relaxed">
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">{member.user.name}</span> from this
                        project?
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-[12px] text-red-900 leading-relaxed">
                            They will immediately lose access to this project and all its
                            resources. To restore access, you&apos;ll need to invite them
                            again.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="h-9 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Removing..." : "Remove Member"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}