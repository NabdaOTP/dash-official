/**
 * Custom attributes attached to a contact.
 * Free-form key/value pairs used for audience filtering in campaigns.
 */
export type ContactAttributes = Record<string, string | number | boolean | undefined>;

/**
 * A contact in a project.
 *
 * NOTE: Backend response shape isn't documented in detail.
 * Optional fields are kept defensive in case they're missing.
 */
export interface Contact {
    id: string;
    projectId?: string;
    name?: string | null;
    phoneNumber: string;
    attributes?: ContactAttributes;
    isSubscribed: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Request body for POST /projects/{id}/campaigns/contacts
 */
export interface AddContactRequest {
    phoneNumber: string;
    name?: string;
    attributes?: ContactAttributes;
    isSubscribed: boolean;
}

/**
 * Sort options for the contacts list (client-side).
 */
export type ContactSortBy =
    | "name-asc"
    | "name-desc"
    | "recent"
    | "oldest";