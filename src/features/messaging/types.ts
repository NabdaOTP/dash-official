export interface Message {
  id: string;
  content: string;
  createdAt: string;
  projectId: string;
}

export interface SendMessageRequest {
  projectId: string;
  content: string;
  recipients: string[];
}
