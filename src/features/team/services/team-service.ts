import { api } from "@/lib/api-client";
import type {
    ProjectMember,
    ProjectInvitation,
    ProjectRole,
} from "@/features/projects/types";

// ── Members ──

export async function getProjectMembers(
    projectId: string
): Promise<ProjectMember[]> {
    return api.get<ProjectMember[]>(`/projects/${projectId}/members`);
}

export async function updateMemberRole(
    projectId: string,
    userId: string,
    role: ProjectRole
): Promise<ProjectMember> {
    return api.patch<ProjectMember>(
        `/projects/${projectId}/members/${userId}`,
        { role }
    );
}

export async function removeMember(
    projectId: string,
    userId: string
): Promise<void> {
    return api.delete<void>(`/projects/${projectId}/members/${userId}`);
}

// ── Invitations ──

export async function getProjectInvitations(
    projectId: string
): Promise<ProjectInvitation[]> {
    return api.get<ProjectInvitation[]>(`/projects/${projectId}/invitations`);
}

export async function inviteToProject(
    projectId: string,
    email: string
): Promise<ProjectInvitation> {
    return api.post<ProjectInvitation>(
        `/projects/${projectId}/invitations`,
        { email }
    );
}

export async function acceptInvitation(token: string): Promise<{
    id: string;
    projectId: string;
    email: string;
    status: string;
    project: {
        id: string;
        name: string;
        ownerId: string;
        isActive: boolean;
    };
}> {
    return api.post(`/invitations/accept`, { token });
}