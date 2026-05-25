// Project 

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  settings: Record<string, unknown>;
  isActive: boolean;
}

export interface ProjectDetails extends Project {
  apiKeys?: ProjectApiKey[];
}

// Project Members

export type ProjectRole = "ADMIN" | "MEMBER";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
    isActive: boolean;
    lastLoginAt: string | null;
    twoFactorEnabled: boolean;
  };
}

// Invitations 

export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  invitedById: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// API Keys 

export interface ProjectApiKey {
  id: string;
  projectId: string;
  name: string;
  rawKey: string;         
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyResponse extends ProjectApiKey {
  rawKey: string;
}

export interface CreateProjectResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  apiKey: {
    id: string;
    name: string;
    projectId: string;
    rawKey: string;
  };
}

// Requests

export interface CreateProjectRequest {
  name: string;
}

export interface InviteMemberRequest {
  email: string;
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface AcceptInvitationRequest {
  token: string;
}