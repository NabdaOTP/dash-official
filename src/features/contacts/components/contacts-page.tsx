"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { getContacts } from "@/features/contacts/services/contact-service";
import type { Contact, ContactSortBy } from "@/features/contacts/types";

import { ContactList } from "./contact-list";
import { ContactDetails } from "./contact-details";
import { AddContactDialog } from "./add-contact-dialog";

export function ContactsPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<ContactSortBy>("name-asc");
    const [addOpen, setAddOpen] = useState(false);

    const fetchContacts = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getContacts(projectId);
            setContacts(data);
        } catch (err) {
            console.error("Failed to load contacts:", err);
            setError("Failed to load contacts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);


    useEffect(() => {
        (async () => {
            await fetchContacts();
        })()
    }, [fetchContacts]);



    const handleContactAdded = (contact: Contact) => {
        setContacts((prev) => [contact, ...prev]);
        setSelectedId(contact.id);
    };

    const selectedContact =
        contacts.find((c) => c.id === selectedId) ?? null;

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={fetchContacts}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader />

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 lg:h-[calc(100vh-220px)] lg:min-h-[500px]">
                <ContactList
                    contacts={contacts}
                    selectedId={selectedId}
                    search={search}
                    sortBy={sortBy}
                    onSelect={(c) => setSelectedId(c.id)}
                    onSearchChange={setSearch}
                    onSortChange={setSortBy}
                    onAddNew={() => setAddOpen(true)}
                />

                <ContactDetails
                    contact={selectedContact}
                    onAddNew={() => setAddOpen(true)}
                />
            </div>

            <AddContactDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                projectId={projectId}
                onAdded={handleContactAdded}
            />
        </div>
    );
}

function PageHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    Contacts
                </h1>
                <p className="text-[12.5px] text-muted-foreground">
                    Manage your audience for campaigns and broadcasts
                </p>
            </div>
        </div>
    );
}