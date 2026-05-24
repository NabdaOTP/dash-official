"use client";

import { useState } from "react";
import {
    Calendar, Clock, ShieldCheck, ShieldOff, Mail, User as UserIcon, Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/features/auth/context/auth-context";
import { EditProfileDialog } from "./edit-profile-dialog";

function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "Never";
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

export function ProfileInfoCard() {
    const { user } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const [editOpen, setEditOpen] = useState(false);

    if (!user) return null;

    const items = [
        { icon: UserIcon, label: "Full name", value: user.name },
        { icon: Mail, label: "Email", value: user.email },
        { icon: Calendar, label: "Joined", value: formatDate(user.createdAt) },
        { icon: Clock, label: "Last login", value: formatDateTime(user.lastLoginAt) },
    ];

    return (
        <>
            <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground">
                        Account Information
                    </h2>
                    <button
                        onClick={() => setEditOpen(true)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer transition-colors"
                    >
                        <Edit3 size={12} />
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {items.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                <Icon size={14} className="text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-muted-foreground mb-0.5">
                                    {label}
                                </p>
                                <p className="text-[13.5px] font-medium text-foreground truncate">
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2FA Status */}
                <div className="mt-5 pt-5 border-t border-border/60">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${user.twoFactorEnabled ? "bg-green-50" : "bg-orange-50"
                                    }`}
                            >
                                {user.twoFactorEnabled ? (
                                    <ShieldCheck size={18} className="text-green-600" />
                                ) : (
                                    <ShieldOff size={18} className="text-orange-500" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13.5px] font-semibold text-foreground">
                                    Two-factor authentication
                                </p>
                                <p className="text-[12px] text-muted-foreground truncate">
                                    {user.twoFactorEnabled
                                        ? "Your account is protected with 2FA"
                                        : "Add an extra layer of security to your account"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`/${locale}/settings`)}
                            className={`shrink-0 h-8 px-3 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors ${user.twoFactorEnabled
                                    ? "border border-border text-foreground hover:bg-muted"
                                    : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                                }`}
                        >
                            {user.twoFactorEnabled ? "Manage" : "Enable"}
                        </button>
                    </div>
                </div>
            </div>

            <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} />
        </>
    );
}