// ─────────────────────────────────────────────────────────────
// File: src/features/templates/services/template-service.ts
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import type {
    MessageTemplate,
    CreateTemplateRequest,
    TemplateFormState,
} from "../types";

/**
 * List templates for a project.
 *
 * GET /api/v1/projects/{projectId}/waba/templates
 */
export async function getTemplates(
    projectId: string
): Promise<MessageTemplate[]> {
    const result = await api.get<MessageTemplate[]>(
        `/projects/${projectId}/waba/templates`
    );
    return Array.isArray(result) ? result : [];
}

/**
 * Create a template and submit it to Meta directly.
 *
 * POST /api/v1/projects/{projectId}/waba/templates
 */
export async function createTemplate(
    projectId: string,
    data: CreateTemplateRequest
): Promise<MessageTemplate> {
    return api.post<MessageTemplate>(
        `/projects/${projectId}/waba/templates`,
        data
    );
}

/**
 * Save or update a local template draft.
 *
 * POST /api/v1/projects/{projectId}/waba/templates/drafts
 */
export async function saveTemplateDraft(
    projectId: string,
    data: CreateTemplateRequest
): Promise<MessageTemplate> {
    return api.post<MessageTemplate>(
        `/projects/${projectId}/waba/templates/drafts`,
        data
    );
}

/**
 * Refresh a template's review status from Meta.
 *
 * POST /api/v1/projects/{projectId}/waba/templates/{templateId}/refresh-status
 */
export async function refreshTemplateStatus(
    projectId: string,
    templateId: string,
    wabaAccountId?: string
): Promise<MessageTemplate> {
    const qs = wabaAccountId
        ? `?wabaAccountId=${encodeURIComponent(wabaAccountId)}`
        : "";
    return api.post<MessageTemplate>(
        `/projects/${projectId}/waba/templates/${templateId}/refresh-status${qs}`,
        {}
    );
}

/**
 * Delete a template from Meta and the local database.
 *
 * DELETE /api/v1/projects/{projectId}/waba/templates/{templateId}
 */
export async function deleteTemplate(
    projectId: string,
    templateId: string
): Promise<void> {
    return api.delete<void>(
        `/projects/${projectId}/waba/templates/${templateId}`
    );
}
