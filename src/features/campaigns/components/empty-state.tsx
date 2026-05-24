"use client";

import { Megaphone, Plus } from "lucide-react";

interface EmptyStateProps {
    onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDE9FE] mb-4">
                <Megaphone className="w-7 h-7 text-[#7C3AED]" />
            </div>
            <h2 className="text-[18px] font-bold text-foreground mb-2">
                No campaigns yet
            </h2>
            <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed mb-5">
                Reach out to your contacts by creating your first WhatsApp campaign.
                Use approved templates to send promotional or transactional messages.
            </p>
            <button
                type="button"
                onClick={onCreate}
                className="cursor-pointer h-10 px-5 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
            >
                <Plus className="w-4 h-4" />
                Create Your First Campaign
            </button>
        </div>
    );
}