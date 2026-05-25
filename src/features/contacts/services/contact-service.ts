// ─────────────────────────────────────────────────────────────
// File: src/features/contacts/services/contact-service.ts
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import type { Contact, AddContactRequest } from "../types";

/**
 * List project contacts.
 * GET /api/v1/projects/{projectId}/campaigns/contacts
 */
export async function getContacts(projectId: string): Promise<Contact[]> {
    const result = await api.get<Contact[]>(
        `/projects/${projectId}/campaigns/contacts`
    );
    return Array.isArray(result) ? result : [];
}

/**
 * Add a new contact to the project.
 * POST /api/v1/projects/{projectId}/campaigns/contacts
 */
export async function addContact(
    projectId: string,
    data: AddContactRequest
): Promise<Contact> {
    return api.post<Contact>(
        `/projects/${projectId}/campaigns/contacts`,
        data
    );
}