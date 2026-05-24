"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    X, Loader2, UserPlus, Mail, Send, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { inviteToProject } from "@/features/team/services/team-service";

interface InviteMemberDialogProps {
    open: boolean;
    onClose: () => void;
    onInvited: () => void;
}

export function InviteMemberDialog({
    open,
    onClose,
    onInvited,
}: InviteMemberDialogProps) {
    const params = useParams();
    const projectId = params.projectId as string;

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await inviteToProject(projectId, email.trim());
            setSent(true);
            toast.success("Invitation sent");
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to send invitation"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setEmail("");
        setSent(false);
        onClose();
    };

    const handleDone = () => {
        setEmail("");
        setSent(false);
        onInvited();
    };

    const handleInviteAnother = () => {
        setEmail("");
        setSent(false);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-background rounded-2xl border border-border w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {sent ? (
                    /* ── Success state ── */
                    <>
                        <div className="flex items-start justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <CheckCircle2 size={18} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Invitation Sent
                                    </h2>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                        They&apos;ll receive an email shortly
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2.5">
                                <Send size={14} className="text-green-600 shrink-0 mt-0.5" />
                                <p className="text-[12.5px] text-green-900 leading-relaxed">
                                    Invitation sent to <span className="font-semibold">{email}</span>.
                                    The invitation will expire in 7 days.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleInviteAnother}
                                    className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
                                >
                                    Invite another
                                </button>
                                <button
                                    onClick={handleDone}
                                    className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ── Form state ── */
                    <>
                        <div className="flex items-start justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                                    <UserPlus size={18} className="text-[#7C3AED]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Invite Member
                                    </h2>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                        Send an invitation by email
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

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="invite-email"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    Email address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                    />
                                    <input
                                        id="invite-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-border bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    The user will be added as a <span className="font-semibold">Member</span> by default.
                                    You can change their role after they accept.
                                </p>
                            </div>

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
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading && <Loader2 size={14} className="animate-spin" />}
                                    {loading ? "Sending..." : "Send Invitation"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}