// ─────────────────────────────────────────────────────────────
// File: src/features/waba/services/waba-service.ts
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import type {
    WabaAccount,
    WabaConnectUrl,
    WabaStatus,
} from "../types";

/**
 * Get the connection status for a project.
 * Returns `isConnected` and the list of connected accounts.
 *
 * GET /api/v1/projects/{projectId}/waba/status
 */
export async function getWabaStatus(projectId: string): Promise<WabaStatus> {
    const result = await api.get<WabaStatus>(
        `/projects/${projectId}/waba/status`
    );
    // Defensive defaults in case backend returns null/undefined
    return {
        isConnected: result?.isConnected ?? false,
        accounts: Array.isArray(result?.accounts) ? result.accounts : [],
    };
}

/**
 * List connected WhatsApp accounts for a project.
 *
 * GET /api/v1/projects/{projectId}/waba/accounts
 */
export async function getWabaAccounts(
    projectId: string
): Promise<WabaAccount[]> {
    const result = await api.get<WabaAccount[]>(
        `/projects/${projectId}/waba/accounts`
    );
    return Array.isArray(result) ? result : [];
}

/**
 * Get the Meta OAuth connect URL for this project.
 * The user should be redirected to `connectUrl` to authorize the connection.
 *
 * GET /api/v1/projects/{projectId}/waba/connect-url
 */
export async function getWabaConnectUrl(
    projectId: string
): Promise<WabaConnectUrl> {
    return api.get<WabaConnectUrl>(
        `/projects/${projectId}/waba/connect-url`
    );
}