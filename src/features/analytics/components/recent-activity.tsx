"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Inbox, Send } from "lucide-react";

export function RecentActivity() {
    const router = useRouter();
    const locale = useLocale();
    const params = useParams();
    const projectId = params.projectId as string;

    // TODO: When a messages list endpoint is available, fetch recent messages here

    return (
        <div className="bg-background rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Inbox size={16} className="text-blue-600" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Recent Activity
                    </h2>
                    <p className="text-[11.5px] text-muted-foreground">
                        Your latest messages will appear here
                    </p>
                </div>
            </div>

            <div className="text-center py-8">
                <Inbox size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-[13px] font-medium text-foreground mb-1">
                    No recent messages
                </p>
                <p className="text-[11.5px] text-muted-foreground mb-4">
                    Start sending messages to see activity here
                </p>
                <button
                    onClick={() =>
                        router.push(`/${locale}/projects/${projectId}/messaging/send`)
                    }
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold cursor-pointer transition-colors"
                >
                    <Send size={12} />
                    Send your first message
                </button>
            </div>
        </div>
    );
}