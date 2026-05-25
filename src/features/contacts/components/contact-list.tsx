"use client";

import { useMemo } from "react";
import { Search, Plus, Users, ChevronDown } from "lucide-react";

import { searchContacts, sortContacts } from "@/features/contacts/lib/contact-helpers";
import type { Contact, ContactSortBy } from "@/features/contacts/types";

import { ContactListItem } from "./contact-list-item";

interface ContactListProps {
    contacts: Contact[];
    selectedId: string | null;
    search: string;
    sortBy: ContactSortBy;
    onSelect: (contact: Contact) => void;
    onSearchChange: (search: string) => void;
    onSortChange: (sortBy: ContactSortBy) => void;
    onAddNew: () => void;
}

const SORT_OPTIONS: { value: ContactSortBy; label: string }[] = [
    { value: "name-asc", label: "Name (A–Z)" },
    { value: "name-desc", label: "Name (Z–A)" },
    { value: "recent", label: "Recently added" },
    { value: "oldest", label: "Oldest first" },
];

export function ContactList({
    contacts,
    selectedId,
    search,
    sortBy,
    onSelect,
    onSearchChange,
    onSortChange,
    onAddNew,
}: ContactListProps) {
    const filteredContacts = useMemo(() => {
        const filtered = searchContacts(contacts, search);
        return sortContacts(filtered, sortBy);
    }, [contacts, search, sortBy]);

    const totalCount = contacts.length;
    const filteredCount = filteredContacts.length;

    return (
        <div className="rounded-2xl border border-border/60 bg-white overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="px-4 py-4 border-b border-border/40">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <h2 className="text-[15px] font-bold text-foreground leading-tight">
                            Contacts
                        </h2>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5">
                            {totalCount} {totalCount === 1 ? "contact" : "contacts"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onAddNew}
                        className="cursor-pointer w-9 h-9 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.95] transition-all flex items-center justify-center shadow-sm shadow-[#7C3AED]/25"
                        aria-label="Add contact"
                    >
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search contacts…"
                        className="w-full h-9 ps-9 pe-3 rounded-lg border border-border bg-muted/30 text-[12.5px] outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Sort by:</span>
                    <div className="relative flex-1">
                        <select
                            aria-label="select"
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value as ContactSortBy)}
                            className="appearance-none w-full h-8 px-2.5 pe-7 rounded-md border border-border bg-background text-[11.5px] outline-none transition-colors focus:ring-1 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-muted-foreground absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {totalCount === 0 ? (
                    <EmptyListState onAddNew={onAddNew} />
                ) : filteredCount === 0 ? (
                    <NoResultsState query={search} />
                ) : (
                    <div>
                        {filteredContacts.map((contact) => (
                            <ContactListItem
                                key={contact.id}
                                contact={contact}
                                selected={contact.id === selectedId}
                                onClick={() => onSelect(contact)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function EmptyListState({ onAddNew }: { onAddNew: () => void }) {
    return (
        <div className="px-4 py-10 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-muted/40 mb-3">
                <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground mb-1">
                No contacts yet
            </h3>
            <p className="text-[11.5px] text-muted-foreground mb-4 leading-relaxed">
                Add contacts to send campaigns and broadcasts.
            </p>
            <button
                type="button"
                onClick={onAddNew}
                className="cursor-pointer h-8 px-3 rounded-lg text-[11.5px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all inline-flex items-center gap-1.5"
            >
                <Plus className="w-3 h-3" />
                Add contact
            </button>
        </div>
    );
}

function NoResultsState({ query }: { query: string }) {
    return (
        <div className="px-4 py-10 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-muted/40 mb-3">
                <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground mb-1">
                No matches
            </h3>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                No contacts match &quot;<span className="font-mono">{query}</span>&quot;
            </p>
        </div>
    );
}