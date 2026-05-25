"use client";

import {
    formatPhone, getInitials, getAvatarColor, formatRelativeTime,
} from "@/features/contacts/lib/contact-helpers";
import type { Contact } from "@/features/contacts/types";

interface ContactListItemProps {
    contact: Contact;
    selected: boolean;
    onClick: () => void;
}

export function ContactListItem({
    contact,
    selected,
    onClick,
}: ContactListItemProps) {
    const initials = getInitials(contact);
    const colors = getAvatarColor(contact.id);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer w-full text-left px-4 py-3 transition-colors border-b border-border/40 last:border-b-0 ${selected
                ? "bg-[#EDE9FE]/40 hover:bg-[#EDE9FE]/60"
                : "hover:bg-muted/30"
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                    className={`w-9 h-9 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 text-[12px] font-semibold`}
                >
                    {initials}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p
                            className={`text-[13.5px] truncate ${selected
                                ? "font-semibold text-[#7C3AED]"
                                : "font-semibold text-foreground"
                                }`}
                        >
                            {contact.name?.trim() || "Unnamed contact"}
                        </p>
                        <span className="text-[10.5px] text-muted-foreground shrink-0">
                            {formatRelativeTime(contact.createdAt)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11.5px] text-muted-foreground font-mono truncate flex-1">
                            {formatPhone(contact.phoneNumber)}
                        </p>
                        {!contact.isSubscribed && (
                            <span className="text-[9.5px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                                Unsubscribed
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}