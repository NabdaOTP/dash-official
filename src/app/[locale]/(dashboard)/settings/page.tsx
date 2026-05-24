"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Sidebar } from "@/features/layout/components/sidebar";
import { Button } from "@/components/ui/button";
import { TwoFactorSection } from "@/features/settings/components/two-factor-section";
import { ChangePasswordSection } from "@/features/settings/components/change-password-section";
import { ActiveSessionsSection } from "@/features/settings/components/active-sessions-section";

export default function SettingsPage() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full">
                <Sidebar mode="home" />
            </aside>

            {/* Mobile sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[300px] max-w-[80vw] bg-background shadow-xl animate-in slide-in-from-left duration-200">
                        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" aria-label="Close menu">
                            <X size={18} className="text-muted-foreground" />
                        </button>
                        <Sidebar mode="home" onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                {/* Mobile header */}
                <div className="flex items-center h-14 px-4 border-b border-border bg-background lg:hidden shrink-0">
                    <Button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-purple-600 cursor-pointer">
                        <ArrowLeft size={18} />
                    </Button>
                    <span className="text-xl font-bold flex-1 text-center">Settings</span>
                    <button onClick={() => setMobileOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" aria-label="Open menu">
                        <Menu size={20} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl md:max-w-4xl mx-auto px-6 md:px-4 py-8 space-y-6">
                        <h1 className="text-3xl font-extrabold text-foreground hidden lg:block">Settings</h1>
                        <p className="text-muted-foreground mt-0.5 md:mt-2 text-[18px] font-normal">Manage your account settings and security preferences</p>

                        <TwoFactorSection />
                        <ChangePasswordSection />
                        <ActiveSessionsSection />
                    </div>
                </main>
            </div>
        </div>
    );
}
