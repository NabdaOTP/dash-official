"use client";

import { useState } from "react";
import { Check, ShieldCheck, Camera } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { EditProfileDialog } from "./edit-profile-dialog";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function ProfileHeader() {
    const { user } = useAuth();
    const [editOpen, setEditOpen] = useState(false);

    if (!user) return null;

    const initials = getInitials(user.name);

    return (
        <>
            <div className="relative">
                <div className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-2xl p-6 sm:p-8 overflow-hidden relative">
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                            backgroundSize: "24px 24px",
                        }}
                    />
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-fuchsia-400/10 blur-2xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/15 backdrop-blur-sm ring-4 ring-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {user.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-3xl font-bold">{initials}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setEditOpen(true)}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-[#7C3AED] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Change avatar"
                                type="button"
                            >
                                <Camera size={14} />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-start min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 truncate">
                                {user.name}
                            </h1>
                            <p className="text-white/80 text-sm mb-3 truncate">{user.email}</p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full ring-1 ring-white/10">
                                    <Check size={11} strokeWidth={3} />
                                    {user.role}
                                </span>

                                {user.isActive && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-400/20 backdrop-blur-sm text-green-100 px-2.5 py-1 rounded-full ring-1 ring-green-300/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                        Active
                                    </span>
                                )}

                                {user.twoFactorEnabled && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full ring-1 ring-white/10">
                                        <ShieldCheck size={11} />
                                        2FA Enabled
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} />
        </>
    );
}