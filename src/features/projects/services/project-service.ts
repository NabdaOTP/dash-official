import { api } from "@/lib/api-client";
import type {
  Project, ProjectDetails, ProjectMember, ProjectInvitation,
  ProjectApiKey, CreateApiKeyResponse, CreateProjectResponse,
  CreateProjectRequest, InviteMemberRequest, UpdateMemberRoleRequest,
  CreateApiKeyRequest, AcceptInvitationRequest, ProjectRole,
  MetaWhatsappSettingsResponse,
  UpdateMetaWhatsappSettingsRequest,
} from "../types";

// ── Projects CRUD ──

export async function getMyProjects(): Promise<Project[]> {
  const result = await api.get<Project[]>("/projects");
  return Array.isArray(result) ? result : [];
}

export async function getProjectById(id: string): Promise<ProjectDetails> {
  return api.get<ProjectDetails>(`/projects/${id}`);
}

export async function createProject(
  data: CreateProjectRequest
): Promise<CreateProjectResponse> {
  return api.post<CreateProjectResponse>("/projects", data);
}

// ── Members ──

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const result = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return Array.isArray(result) ? result : [];
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: ProjectRole
): Promise<ProjectMember> {
  return api.patch<ProjectMember>(
    `/projects/${projectId}/members/${userId}`,
    { role } satisfies UpdateMemberRoleRequest
  );
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  return api.delete<void>(`/projects/${projectId}/members/${userId}`);
}

// ── Invitations ──

export async function inviteMember(
  projectId: string,
  email: string
): Promise<ProjectInvitation> {
  return api.post<ProjectInvitation>(
    `/projects/${projectId}/invitations`,
    { email } satisfies InviteMemberRequest
  );
}

export async function getProjectInvitations(
  projectId: string
): Promise<ProjectInvitation[]> {
  const result = await api.get<ProjectInvitation[]>(
    `/projects/${projectId}/invitations`
  );
  return Array.isArray(result) ? result : [];
}

export async function acceptInvitation(token: string): Promise<void> {
  return api.post<void>("/invitations/accept", { token } satisfies AcceptInvitationRequest);
}

// ── API Keys ──

export async function getProjectApiKeys(projectId: string): Promise<ProjectApiKey[]> {
  const result = await api.get<ProjectApiKey[]>(
    `/projects/${projectId}/api-keys`
  );
  return Array.isArray(result) ? result : [];
}

export async function createApiKey(
  projectId: string,
  name: string
): Promise<CreateApiKeyResponse> {
  return api.post<CreateApiKeyResponse>(
    `/projects/${projectId}/api-keys`,
    { name } satisfies CreateApiKeyRequest
  );
}

export async function revokeApiKey(
  projectId: string,
  keyId: string
): Promise<void> {
  return api.post<void>(`/projects/${projectId}/api-keys/${keyId}/revoke`);
}

export async function deleteProject(projectId: string): Promise<void> {
  return api.delete<void>(`/projects/${projectId}`);
}

export async function saveMetaWhatsappSettings(
  projectId: string,
  data: UpdateMetaWhatsappSettingsRequest
): Promise<unknown> {
  return api.post<unknown>(
    `/projects/${projectId}/meta-whatsapp`,
    data satisfies UpdateMetaWhatsappSettingsRequest
  );
}

export async function getMetaWhatsappSettings(
  projectId: string
): Promise<MetaWhatsappSettingsResponse | null> {
  const result = await api.get<MetaWhatsappSettingsResponse | null>(
    `/projects/${projectId}/meta-whatsapp`
  );
  return result ?? null;
}
 
