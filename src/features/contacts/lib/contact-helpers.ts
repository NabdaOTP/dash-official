// ─────────────────────────────────────────────────────────────
// File: src/features/contacts/lib/contact-helpers.ts
// ─────────────────────────────────────────────────────────────

import type { Contact, ContactSortBy } from "../types";

/**
 * Format a phone number with a leading "+" if it looks like an E.164 number.
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/[^0-9+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (/^\d{8,15}$/.test(cleaned)) return `+${cleaned}`;
    return phone;
}

/**
 * Get initials from a contact name. Falls back to first phone digits.
 */
export function getInitials(contact: Contact): string {
    const name = contact.name?.trim();
    if (name) {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    }
    // Fall back to last 2 digits of phone
    const digits = contact.phoneNumber.replace(/[^0-9]/g, "");
    return digits.slice(-2) || "#";
}

/**
 * Pick a deterministic color for a contact's avatar (based on id).
 * Uses a small palette of subtle backgrounds.
 */
const AVATAR_COLORS = [
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
];

export function getAvatarColor(contactId: string) {
    // Simple deterministic hash of the id
    let hash = 0;
    for (let i = 0; i < contactId.length; i++) {
        hash = (hash << 5) - hash + contactId.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

/**
 * Filter contacts by search query (matches name OR phone).
 */
export function searchContacts(
    contacts: Contact[],
    query: string
): Contact[] {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q) ?? false;
        const phoneMatch = c.phoneNumber.toLowerCase().includes(q);
        return nameMatch || phoneMatch;
    });
}

/**
 * Sort contacts by the given criterion.
 */
export function sortContacts(
    contacts: Contact[],
    sortBy: ContactSortBy
): Contact[] {
    const copy = [...contacts];
    switch (sortBy) {
        case "name-asc":
            return copy.sort((a, b) =>
                (a.name ?? a.phoneNumber).localeCompare(b.name ?? b.phoneNumber)
            );
        case "name-desc":
            return copy.sort((a, b) =>
                (b.name ?? b.phoneNumber).localeCompare(a.name ?? a.phoneNumber)
            );
        case "recent":
            return copy.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        case "oldest":
            return copy.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
    }
}

/**
 * Format a date as a relative time ("2 days ago").
 */
export function formatRelativeTime(iso: string): string {
    try {
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffSec < 60) return "Just now";
        if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
        if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
        if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
        if (diffWeek < 4) return `${diffWeek} ${diffWeek === 1 ? "week" : "weeks"} ago`;
        if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;
        return `${diffYear} ${diffYear === 1 ? "year" : "years"} ago`;
    } catch {
        return iso;
    }
}

/**
 * Validate a phone number — basic E.164 format check.
 */
export function validatePhoneNumber(phone: string): string | null {
    const cleaned = phone.replace(/[^0-9+]/g, "");
    if (!cleaned) return "Phone number is required";
    const digitsOnly = cleaned.replace(/^\+/, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return "Phone must be 8–15 digits in international format";
    }
    if (!/^\+?\d+$/.test(cleaned)) {
        return "Phone must contain only digits (and an optional leading +)";
    }
    return null;
}