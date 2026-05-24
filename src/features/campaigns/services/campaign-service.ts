import { api } from "@/lib/api-client";
import type { Campaign, CreateCampaignRequest } from "../types";

/**
 * Create a new campaign.
 * POST /api/v1/projects/{projectId}/campaigns
 */
export async function createCampaign(
    projectId: string,
    data: CreateCampaignRequest
): Promise<Campaign> {
    return api.post<Campaign>(
        `/projects/${projectId}/campaigns`,
        data
    );
}

/**
 * Start a campaign broadcast.
 * POST /api/v1/projects/{projectId}/campaigns/{campaignId}/start
 */
export async function startCampaign(
    projectId: string,
    campaignId: string
): Promise<Campaign> {
    return api.post<Campaign>(
        `/projects/${projectId}/campaigns/${campaignId}/start`,
        {}
    );
}