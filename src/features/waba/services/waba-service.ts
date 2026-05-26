import type {
    WabaConnectUrl,
    WabaStatus,
} from "../types";

import { api } from "@/lib/api-client";
import type { WabaAccount } from "../types";

export interface CompleteAutoConnectRequest {
    code: string;
    state: string;
    projectId?: string;
    wabaId?: string;
    phoneNumberId?: string;
    redirectUri?: string;
    fallbackRedirectUri?: string;
}

export interface StoreConnectSessionRequest {
    state: string;
    wabaId: string;
    phoneNumberId: string;
}

export interface AttachWabaSenderRequest {
    accessToken: string;
    wabaId: string;
    phoneNumberId: string;
}

export interface SendWabaTestMessageRequest {
    to: string;
    templateName?: string;
    language?: string;
}

/**
 * Get the WhatsApp connection status for a project.
 * GET /api/v1/projects/{projectId}/waba/status
 */
export async function getWabaStatus(projectId: string): Promise<WabaStatus> {
    const result = await api.get<WabaStatus>(
        `/projects/${projectId}/waba/status`
    );
    return {
        isConnected: result?.isConnected ?? false,
        accounts: Array.isArray(result?.accounts) ? result.accounts : [],
    };
}

/**
 * List connected WhatsApp accounts for a project.
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
 * GET /api/v1/projects/{projectId}/waba/connect-url
 */
export async function getWabaConnectUrl(
    projectId: string
): Promise<WabaConnectUrl> {
    return api.get<WabaConnectUrl>(
        `/projects/${projectId}/waba/connect-url`
    );
}

/**
 * Get a Meta reauthorization URL for a specific WABA account.
 * Used when the token is expired or close to expiring.
 *
 * GET /api/v1/projects/{projectId}/waba/accounts/{wabaAccountId}/reauth-url
 */
export async function getWabaReauthUrl(
    projectId: string,
    wabaAccountId: string
): Promise<WabaConnectUrl> {
    return api.get<WabaConnectUrl>(
        `/projects/${projectId}/waba/accounts/${wabaAccountId}/reauth-url`
    );
}

/**
 * Disconnect a specific WhatsApp account from a project.
 *
 * DELETE /api/v1/projects/{projectId}/waba/disconnect/{wabaAccountId}
 */
export async function disconnectWabaAccount(
    projectId: string,
    wabaAccountId: string
): Promise<void> {
    return api.delete<void>(
        `/projects/${projectId}/waba/disconnect/${wabaAccountId}`
    );
}

/**
 * Disconnect ALL WhatsApp accounts from a project.
 * Use with caution — this removes every connection at once.
 *
 * DELETE /api/v1/projects/{projectId}/waba/disconnect
 */
export async function disconnectAllWabaAccounts(
    projectId: string
): Promise<void> {
    return api.delete<void>(`/projects/${projectId}/waba/disconnect`);
}

export async function completeWabaConnect(
  data: CompleteAutoConnectRequest
): Promise<WabaAccount> {
  return api.post<WabaAccount>(
    `/waba/connect/callback/complete-auto`,
    data
  );
}

export async function storeWabaConnectSession(
    projectId: string,
    data: StoreConnectSessionRequest
): Promise<void> {
    await api.post<void>(`/projects/${projectId}/waba/connect/session`, data);
}

export async function attachWabaSender(
    projectId: string,
    data: AttachWabaSenderRequest
): Promise<WabaAccount> {
    return api.post<WabaAccount>(`/projects/${projectId}/waba/connect/manual`, data);
}

export async function sendWabaTestMessage(
    projectId: string,
    phoneNumberId: string,
    data: SendWabaTestMessageRequest
): Promise<unknown> {
    return api.post<unknown>(
        `/projects/${projectId}/waba/accounts/${phoneNumberId}/test-message`,
        data
    );
}
