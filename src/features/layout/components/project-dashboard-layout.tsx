"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "@/features/layout/components/sidebar";
import { Header } from "@/features/layout/components/header";

interface ProjectDashboardLayoutProps {
    children: React.ReactNode;
    projectId: string;
    projectName: string;
    headerTitle?: string;
}

export function ProjectDashboardLayout({
    children,
    projectId,
    projectName,
    headerTitle,
}: ProjectDashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full">
                <Sidebar
                    mode="project"
                    projectId={projectId}
                    projectName={projectName}
                />
            </aside>

            {/* Mobile sidebar — Sheet */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="p-0 w-[260px]">
                    <Sidebar
                        mode="project"
                        projectId={projectId}
                        projectName={projectName}
                        onNavigate={() => setMobileOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                <Header
                    title={headerTitle ?? projectName}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}