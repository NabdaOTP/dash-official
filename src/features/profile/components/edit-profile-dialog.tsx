"use client";

import { useState } from "react";
import { X, Loader2, User as UserIcon, Mail, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import { updateProfile } from "@/features/auth/services/auth-service";
import type { User } from "@/features/auth/types";

interface EditProfileDialogProps {
    open: boolean;
    onClose: () => void;
}

interface DialogInnerProps {
    user: User;
    onClose: () => void;
}

function EditProfileDialogInner({ user, onClose }: DialogInnerProps) {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
    const [loading, setLoading] = useState(false);

    const hasChanges =
        name.trim() !== user.name ||
        email.trim() !== user.email ||
        avatarUrl.trim() !== (user.avatarUrl ?? "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (avatarUrl.trim() && !avatarUrl.trim().startsWith("http")) {
            toast.error("Avatar URL must start with http:// or https://");
            return;
        }

        setLoading(true);
        try {
            const payload: Record<string, string> = {};
            if (name.trim() !== user.name) payload.name = name.trim();
            if (email.trim() !== user.email) payload.email = email.trim();
            if (avatarUrl.trim() !== (user.avatarUrl ?? "")) {
                payload.avatarUrl = avatarUrl.trim();
            }

            await updateProfile(payload);
            await refreshUser();
            toast.success("Profile updated successfully");
            onClose();
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    const inputClass =
        "w-full h-10 pl-10 pr-3.5 rounded-lg border border-border bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all";

    return (
        <div
            className="fixed inset-0 h-full bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-background rounded-2xl border border-border w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">
                            Edit Profile
                        </h2>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                            Update your personal information
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground"
                        disabled={loading}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Avatar preview */}
                    {avatarUrl.trim() && (
                        <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={avatarUrl.trim()}
                                alt="Avatar preview"
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    {/* Full name */}
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-[13px] font-medium text-foreground">
                            Full name
                        </label>
                        <div className="relative">
                            <UserIcon
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                            />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className={inputClass}
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[13px] font-medium text-foreground">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Changing your email may require re-verification
                        </p>
                    </div>

                    {/* Avatar URL */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="avatar"
                            className="text-[13px] font-medium text-foreground"
                        >
                            Avatar URL{" "}
                            <span className="text-muted-foreground font-normal text-[11.5px]">
                                (optional)
                            </span>
                        </label>
                        <div className="relative">
                            <ImageIcon
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                            />
                            <input
                                id="avatar"
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className={inputClass}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-3">
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
                            disabled={loading || !hasChanges}
                            className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditProfileDialog({ open, onClose }: EditProfileDialogProps) {
    const { user } = useAuth();

    if (!open || !user) return null;

    return <EditProfileDialogInner user={user} onClose={onClose} />;
}
