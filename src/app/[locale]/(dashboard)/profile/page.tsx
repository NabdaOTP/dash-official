"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/features/layout/components/sidebar";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileInfoCard } from "@/features/profile/components/profile-info-card";
import { ProfileReferralCard } from "@/features/profile/components/profile-referral-card";
import { ProfileProjectsList } from "@/features/profile/components/profile-projects-list";

export default function ProfilePage() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full">
                <Sidebar mode="home" />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-[300px] max-w-[80vw] bg-background shadow-xl animate-in slide-in-from-left duration-200">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
                            aria-label="Close menu"
                        >
                            <X size={18} className="text-muted-foreground" />
                        </button>
                        <Sidebar mode="home" onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                {/* Mobile top bar */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-background lg:hidden shrink-0">
                    <h1 className="text-sm font-semibold text-foreground">Profile</h1>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
                        aria-label="Open menu"
                    >
                        <Menu size={20} className="text-foreground" />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
                        <ProfileHeader />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Left column - 2/3 */}
                            <div className="lg:col-span-2 space-y-5">
                                <ProfileInfoCard />
                                <ProfileProjectsList />
                            </div>

                            {/* Right column - 1/3 */}
                            <div className="space-y-5">
                                <ProfileReferralCard />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}