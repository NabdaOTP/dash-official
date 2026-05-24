"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
    Send, Key, FileText, BarChart3, ArrowRight, type LucideIcon,
} from "lucide-react";

interface QuickAction {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    bg: string;
    iconColor: string;
}

export function QuickActions() {
    const router = useRouter();
    const locale = useLocale();
    const params = useParams();
    const projectId = params.projectId as string;

    const actions: QuickAction[] = [
        {
            icon: Send,
            title: "Send Message",
            description: "Send WhatsApp OTPs and notifications to your users",
            href: `/${locale}/projects/${projectId}/messaging/send`,
            bg: "bg-purple-50",
            iconColor: "text-[#7C3AED]",
        },
        {
            icon: FileText,
            title: "Templates",
            description: "Manage your WhatsApp message templates",
            href: `/${locale}/projects/${projectId}/whatsapp/templates`,
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            icon: Key,
            title: "API Keys",
            description: "Create and manage API keys for secure access",
            href: `/${locale}/projects/${projectId}/api-keys`,
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            icon: BarChart3,
            title: "Analytics",
            description: "View detailed reports and message analytics",
            href: `/${locale}/projects/${projectId}/analytics/overview`,
            bg: "bg-green-50",
            iconColor: "text-green-600",
        },
    ];

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                    Quick Actions
                </h2>
                <p className="text-[12px] text-muted-foreground">
                    Common tasks and shortcuts
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {actions.map((action) => (
                    <button
                        key={action.title}
                        onClick={() => router.push(action.href)}
                        className="bg-background border border-border/60 rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:border-[#7C3AED] hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div
                                className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}
                            >
                                <action.icon size={18} className={action.iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[14px] font-semibold text-foreground mb-0.5">
                                    {action.title}
                                </h3>
                                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#7C3AED] group-hover:gap-2.5 transition-all">
                            Go to {action.title.toLowerCase()}
                            <ArrowRight size={13} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}